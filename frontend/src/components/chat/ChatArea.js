import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import io from 'socket.io-client';
import axios from 'axios';
import MessageBubble from './MessageBubble';
import './ChatArea.css';

const ChatArea = ({ selectedChat, chatType, currentUser, onNewMessage, onMarkRead }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { user } = useAuth();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && !socket) {
      const token = localStorage.getItem('token');
      const newSocket = io('http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.IO');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Connection failed. Please refresh the page.');
      });

      newSocket.on('new_private_message', (message) => {
        if (selectedChat && chatType === 'private' && 
            (message.sender._id === selectedChat._id._id || message.recipient._id === selectedChat._id._id)) {
          setMessages(prev => [...prev, message]);
          onNewMessage(message, selectedChat._id._id, 'private');
        }
      });

      newSocket.on('new_group_message', (message) => {
        if (selectedChat && chatType === 'group' && message.groupId === selectedChat._id) {
          setMessages(prev => [...prev, message]);
          onNewMessage(message, selectedChat._id, 'group');
        }
      });

      newSocket.on('user_typing', (data) => {
        if (data.chatType === chatType && 
            ((chatType === 'private' && data.userId === selectedChat?._id?._id) ||
             (chatType === 'group' && data.groupId === selectedChat?._id))) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== data.userId);
            return [...filtered, { userId: data.userId, username: data.username }];
          });
        }
      });

      newSocket.on('user_stopped_typing', (data) => {
        if (data.chatType === chatType && 
            ((chatType === 'private' && data.userId === selectedChat?._id?._id) ||
             (chatType === 'group' && data.groupId === selectedChat?._id))) {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, socket, selectedChat, chatType, onNewMessage]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
      setMessages([]);
      setTypingUsers([]);
    }
  }, [selectedChat, chatType]);

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);
      let response;
      
      if (chatType === 'private') {
        response = await axios.get(`/api/chat/messages/${selectedChat._id._id}`);
      } else {
        response = await axios.get(`/api/chat/group/${selectedChat._id}`);
      }
      
      setMessages(response.data);
      
      // Mark messages as read
      if (response.data.length > 0) {
        const unreadMessages = response.data.filter(msg => 
          msg.sender._id !== currentUser._id && !msg.isRead
        );
        
        if (unreadMessages.length > 0) {
          const messageIds = unreadMessages.map(msg => msg._id);
          markMessagesAsRead(messageIds);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (messageIds) => {
    if (!socket || !selectedChat) return;

    try {
      socket.emit('mark_read', {
        messageIds,
        chatType,
        recipientId: chatType === 'private' ? selectedChat._id._id : undefined,
        groupId: chatType === 'group' ? selectedChat._id : undefined
      });

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
      ));

      // Update conversation unread count
      onMarkRead(chatType === 'private' ? selectedChat._id._id : selectedChat._id, chatType);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !selectedChat) return;

    const messageData = {
      content: newMessage.trim()
    };

    try {
      if (chatType === 'private') {
        messageData.recipientId = selectedChat._id._id;
        socket.emit('private_message', messageData);
      } else {
        messageData.groupId = selectedChat._id;
        socket.emit('group_message', messageData);
      }

      setNewMessage('');
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      socket.emit('typing_stop', {
        chatType,
        recipientId: chatType === 'private' ? selectedChat._id._id : undefined,
        groupId: chatType === 'group' ? selectedChat._id : undefined
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedChat) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing_start', {
        chatType,
        recipientId: chatType === 'private' ? selectedChat._id._id : undefined,
        groupId: chatType === 'group' ? selectedChat._id : undefined
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', {
        chatType,
        recipientId: chatType === 'private' ? selectedChat._id._id : undefined,
        groupId: chatType === 'group' ? selectedChat._id : undefined
      });
    }, 1000);
  };

  if (!selectedChat) {
    return (
      <div className="chat-area-empty">
        <div className="empty-state">
          <h2>Welcome to Chat App!</h2>
          <p>Select a conversation or user to start chatting</p>
        </div>
      </div>
    );
  }

  const getChatTitle = () => {
    if (chatType === 'private') {
      return selectedChat._id.username;
    } else {
      return selectedChat.groupName;
    }
  };

  const getChatAvatar = () => {
    if (chatType === 'private') {
      return selectedChat._id.avatar || `https://ui-avatars.com/api/?name=${selectedChat._id.username}&background=random`;
    } else {
      return selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.groupName}&background=random`;
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-header-info">
          <img src={getChatAvatar()} alt={getChatTitle()} className="chat-avatar" />
          <div>
            <h3 className="chat-title">{getChatTitle()}</h3>
            {chatType === 'private' && (
              <span className={`chat-status ${selectedChat._id.isOnline ? 'online' : 'offline'}`}>
                {selectedChat._id.isOnline ? 'Online' : 'Offline'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet</p>
                <p>Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.sender._id === currentUser._id}
                  currentUser={currentUser}
                />
              ))
            )}
            
            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span>{typingUsers.map(u => u.username).join(', ')} is typing...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
          disabled={loading}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || loading}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatArea;
