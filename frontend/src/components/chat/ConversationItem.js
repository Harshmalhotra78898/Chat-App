import React from 'react';
import './ConversationItem.css';

const ConversationItem = ({ conversation, type, isSelected, onClick }) => {
  const getDisplayName = () => {
    if (type === 'private') {
      return conversation._id.username;
    } else {
      return conversation.groupName;
    }
  };

  const getLastMessage = () => {
    if (!conversation.lastMessage) {
      return type === 'private' ? 'Start a conversation' : 'No messages yet';
    }
    return conversation.lastMessage.content;
  };

  const getAvatar = () => {
    if (type === 'private') {
      return conversation._id.avatar || `https://ui-avatars.com/api/?name=${conversation._id.username}&background=random`;
    } else {
      return conversation.avatar || `https://ui-avatars.com/api/?name=${conversation.groupName}&background=random`;
    }
  };

  const getStatus = () => {
    if (type === 'private') {
      return conversation._id.isOnline ? 'online' : 'offline';
    }
    return null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div 
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="conversation-avatar">
        <img src={getAvatar()} alt={getDisplayName()} />
        {type === 'private' && (
          <span className={`status-indicator ${getStatus()}`}></span>
        )}
      </div>
      
      <div className="conversation-content">
        <div className="conversation-header">
          <h4 className="conversation-name">{getDisplayName()}</h4>
          {conversation.lastMessage && (
            <span className="conversation-time">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        
        <div className="conversation-preview">
          <p className="last-message">{getLastMessage()}</p>
          {conversation.unreadCount > 0 && (
            <span className="unread-badge">{conversation.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
