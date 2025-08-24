import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatType, setChatType] = useState('private'); // 'private' or 'group'
  const [conversations, setConversations] = useState({ private: [], groups: [] });

  const handleChatSelect = (chat, type) => {
    setSelectedChat(chat);
    setChatType(type);
  };

  const handleLogout = async () => {
    await logout();
  };

  const updateConversations = (newConversations) => {
    setConversations(newConversations);
  };

  const addNewMessage = (message, chatId, type) => {
    setConversations(prev => {
      const newConversations = { ...prev };
      
      if (type === 'private') {
        const conversationIndex = newConversations.private.findIndex(
          conv => conv._id._id === chatId
        );
        
        if (conversationIndex !== -1) {
          newConversations.private[conversationIndex].lastMessage = message;
          newConversations.private[conversationIndex].unreadCount += 1;
        }
      } else if (type === 'group') {
        const conversationIndex = newConversations.groups.findIndex(
          conv => conv._id === chatId
        );
        
        if (conversationIndex !== -1) {
          newConversations.groups[conversationIndex].lastMessage = message;
          newConversations.groups[conversationIndex].unreadCount += 1;
        }
      }
      
      return newConversations;
    });
  };

  const markMessagesAsRead = (chatId, type) => {
    setConversations(prev => {
      const newConversations = { ...prev };
      
      if (type === 'private') {
        const conversationIndex = newConversations.private.findIndex(
          conv => conv._id._id === chatId
        );
        
        if (conversationIndex !== -1) {
          newConversations.private[conversationIndex].unreadCount = 0;
        }
      } else if (type === 'group') {
        const conversationIndex = newConversations.groups.findIndex(
          conv => conv._id === chatId
        );
        
        if (conversationIndex !== -1) {
          newConversations.groups[conversationIndex].unreadCount = 0;
        }
      }
      
      return newConversations;
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-left">
          <h1>CLICK - Chat App</h1>
        </div>
        <div className="chat-header-right">
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className={`status ${user.isOnline ? 'online' : 'offline'}`}>
              {user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="chat-main">
        <Sidebar
          conversations={conversations}
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
          chatType={chatType}
          updateConversations={updateConversations}
          onNewMessage={addNewMessage}
          onMarkRead={markMessagesAsRead}
        />
        
        <ChatArea
          selectedChat={selectedChat}
          chatType={chatType}
          currentUser={user}
          onNewMessage={addNewMessage}
          onMarkRead={markMessagesAsRead}
        />
      </div>
    </div>
  );
};

export default Chat;
