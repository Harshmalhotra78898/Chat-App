import React from 'react';
import './UserList.css';

const UserList = ({ users, onUserSelect, searchTerm }) => {
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvatar = (user) => {
    return user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`;
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (filteredUsers.length === 0) {
    return (
      <div className="user-list-empty">
        <p>No users found</p>
        {searchTerm && <p>Try a different search term</p>}
      </div>
    );
  }

  return (
    <div className="user-list">
      {filteredUsers.map(user => (
        <div 
          key={user._id} 
          className="user-item"
          onClick={() => onUserSelect(user)}
        >
          <div className="user-avatar">
            <img src={getAvatar(user)} alt={user.username} />
            <span className={`status-indicator ${user.isOnline ? 'online' : 'offline'}`}></span>
          </div>
          
          <div className="user-info">
            <div className="user-header">
              <h4 className="user-name">{user.username}</h4>
              <span className="user-role">{user.role}</span>
            </div>
            
            <div className="user-details">
              <p className="user-email">{user.email}</p>
              <p className="user-status">
                {user.isOnline ? 'Online' : `Last seen ${formatLastSeen(user.lastSeen)}`}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;
