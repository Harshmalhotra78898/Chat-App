import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConversationItem from './ConversationItem';
import UserList from './UserList';
import './Sidebar.css';

const Sidebar = ({ 
  conversations, 
  onChatSelect, 
  selectedChat, 
  chatType, 
  updateConversations,
  onNewMessage,
  onMarkRead 
}) => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/conversations');
      updateConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', {
        params: { search: searchTerm }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (activeTab === 'users') {
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchUsers();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleUserSelect = (user) => {
    // Check if conversation already exists
    const existingConversation = conversations.private.find(
      conv => conv._id._id === user._id
    );

    if (existingConversation) {
      onChatSelect(existingConversation, 'private');
    } else {
      // Create new conversation object
      const newConversation = {
        _id: user,
        lastMessage: null,
        unreadCount: 0
      };
      onChatSelect(newConversation, 'private');
    }
  };

  const handleConversationSelect = (conversation, type) => {
    onChatSelect(conversation, type);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            Conversations
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder={activeTab === 'conversations' ? 'Search conversations...' : 'Search users...'}
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      <div className="sidebar-content">
        {activeTab === 'conversations' ? (
          <div className="conversations-list">
            {loading ? (
              <div className="loading">Loading conversations...</div>
            ) : (
              <>
                {/* Private conversations */}
                {conversations.private.length > 0 && (
                  <div className="conversation-section">
                    <h3>Private Chats</h3>
                    {conversations.private.map((conversation) => (
                      <ConversationItem
                        key={conversation._id._id}
                        conversation={conversation}
                        type="private"
                        isSelected={
                          selectedChat && 
                          chatType === 'private' && 
                          selectedChat._id._id === conversation._id._id
                        }
                        onClick={() => handleConversationSelect(conversation, 'private')}
                      />
                    ))}
                  </div>
                )}

                {/* Group conversations */}
                {conversations.groups.length > 0 && (
                  <div className="conversation-section">
                    <h3>Group Chats</h3>
                    {conversations.groups.map((conversation) => (
                      <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        type="group"
                        isSelected={
                          selectedChat && 
                          chatType === 'group' && 
                          selectedChat._id === conversation._id
                        }
                        onClick={() => handleConversationSelect(conversation, 'group')}
                      />
                    ))}
                  </div>
                )}

                {conversations.private.length === 0 && conversations.groups.length === 0 && (
                  <div className="no-conversations">
                    <p>No conversations yet</p>
                    <p>Start chatting with users!</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <UserList
            users={users}
            onUserSelect={handleUserSelect}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
