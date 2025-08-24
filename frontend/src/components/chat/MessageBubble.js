import React from 'react';
import './MessageBubble.css';

const MessageBubble = ({ message, isOwn, currentUser }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatar = () => {
    if (message.sender.avatar) {
      return message.sender.avatar;
    }
    return `https://ui-avatars.com/api/?name=${message.sender.username}&background=random`;
  };

  const getReadStatus = () => {
    if (isOwn) {
      if (message.readBy && message.readBy.length > 0) {
        return 'read';
      }
      return 'sent';
    }
    return null;
  };

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-avatar">
          <img src={getAvatar()} alt={message.sender.username} />
        </div>
      )}
      
      <div className="message-content">
        {!isOwn && (
          <div className="message-sender">
            <span className="sender-name">{message.sender.username}</span>
          </div>
        )}
        
        <div className="message-text">
          {message.content}
        </div>
        
        <div className="message-meta">
          <span className="message-time">{formatTime(message.createdAt)}</span>
          
          {isOwn && (
            <span className={`read-status ${getReadStatus()}`}>
              {getReadStatus() === 'read' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
