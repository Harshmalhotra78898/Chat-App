const express = require('express');
const { pool } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get private chat messages
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Get messages between the two users
    const [messages] = await pool.execute(
      `SELECT m.*, u.username, u.avatar 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.chat_type = 'private' 
       AND ((m.sender_id = ? AND m.recipient_id = ?) 
            OR (m.sender_id = ? AND m.recipient_id = ?))
       ORDER BY m.created_at ASC`,
      [currentUserId, userId, userId, currentUserId]
    );

    res.json(messages.map(msg => ({
      _id: msg.id,
      content: msg.content,
      chatType: msg.chat_type,
      isRead: msg.is_read,
      createdAt: msg.created_at,
      sender: {
        _id: msg.sender_id,
        username: msg.username,
        avatar: msg.avatar
      }
    })));
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send private message
router.post('/message', auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    // Insert message
    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, content, chat_type, recipient_id) VALUES (?, ?, ?, ?)',
      [senderId, content, 'private', recipientId]
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
    res.status(201).json({
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
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations list - SIMPLIFIED VERSION
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all users except current user (simple approach)
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_online, last_seen, avatar FROM users WHERE id != ?',
      [currentUserId]
    );

    // Get recent messages for each user
    const conversations = [];
    for (const user of users) {
      const [messages] = await pool.execute(
        `SELECT content, created_at FROM messages 
         WHERE chat_type = 'private' 
         AND ((sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?))
         ORDER BY created_at DESC LIMIT 1`,
        [currentUserId, user.id, user.id, currentUserId]
      );

      conversations.push({
        _id: { _id: user.id },
        username: user.username,
        avatar: user.avatar,
        isOnline: user.is_online,
        lastSeen: user.last_seen,
        lastMessage: messages.length > 0 ? messages[0].content : null,
        lastMessageTime: messages.length > 0 ? messages[0].created_at : null,
        unreadCount: 0
      });
    }

    res.json({
      private: conversations,
      groups: []
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
