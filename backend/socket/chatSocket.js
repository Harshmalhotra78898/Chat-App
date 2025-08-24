const { pool } = require('../config/database');

module.exports = (io) => {
  const connectedUsers = new Map();

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    connectedUsers.set(socket.userId.toString(), {
      socketId: socket.id,
      username: socket.username,
      role: socket.role
    });

    try {
      // Update user online status
      await pool.execute(
        'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
        [socket.userId]
      );

      // Broadcast user online status
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        username: socket.username,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }

    // Join user's personal room
    socket.join(socket.userId.toString());

    // Handle private messages - SIMPLIFIED
    socket.on('private_message', async (data) => {
      try {
        const { recipientId, content } = data;
        
        // Insert message into database
        const [result] = await pool.execute(
          'INSERT INTO messages (sender_id, content, chat_type, recipient_id) VALUES (?, ?, ?, ?)',
          [socket.userId, content, 'private', recipientId]
        );

        const messageId = result.insertId;

        // Get the created message with sender info
        const [messages] = await pool.execute(
          `SELECT m.*, u.username, u.avatar 
           FROM messages m 
           JOIN users u ON m.sender_id = u.id 
           WHERE m.id = ?`,
          [messageId]
        );

        const message = messages[0];
        const messageData = {
          _id: message.id,
          content: message.content,
          chatType: message.chat_type,
          recipientId: message.recipient_id,
          isRead: message.is_read,
          createdAt: message.created_at,
          sender: {
            _id: message.sender_id,
            username: message.username,
            avatar: message.avatar
          }
        };

        // Send to recipient
        io.to(recipientId.toString()).emit('new_private_message', messageData);
        
        // Send back to sender for confirmation
        socket.emit('message_sent', messageData);
      } catch (error) {
        console.error('Error sending private message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators - SIMPLIFIED
    socket.on('typing_start', (data) => {
      const { recipientId } = data;
      io.to(recipientId.toString()).emit('user_typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    socket.on('typing_stop', (data) => {
      const { recipientId } = data;
      io.to(recipientId.toString()).emit('user_stopped_typing', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username} (${socket.userId})`);
      
      connectedUsers.delete(socket.userId.toString());

      try {
        // Update user offline status
        await pool.execute(
          'UPDATE users SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
          [socket.userId]
        );

        // Broadcast user offline status
        socket.broadcast.emit('user_offline', {
          userId: socket.userId,
          username: socket.username,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });
  });

  return {
    getConnectedUsersCount: () => connectedUsers.size,
    getConnectedUsers: () => Array.from(connectedUsers.values())
  };
};
