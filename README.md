# MERN Chat Application

A real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Socket.IO for real-time messaging.

## Features

- **User Authentication**
  - JWT-based authentication
  - User registration and login
  - Role-based access control (admin, user)
  - Secure password hashing with bcrypt

- **Real-time Chat**
  - Socket.IO for instant messaging
  - One-to-one private chats
  - Group chat support
  - Online/offline status indicators
  - Typing indicators
  - Read receipts

- **User Management**
  - User search and discovery
  - Profile management
  - Admin controls for user management
  - Avatar support with fallback to generated avatars

- **Modern UI/UX**
  - Clean, responsive design
  - Real-time updates without page refresh
  - Message bubbles with sender/receiver differentiation
  - Unread message counters
  - Conversation history

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **Socket.IO Client** - Real-time client
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd chatapp
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
```

**Important**: Replace `your-super-secret-jwt-key-here` with a strong, unique secret key.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Run the Application

#### Development Mode (Recommended)

From the root directory, run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

#### Separate Mode

If you prefer to run them separately:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

## Usage

### 1. First Time Setup

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Sign up here" to create a new account
3. Fill in your username, email, and password
4. You'll be automatically logged in and redirected to the chat interface

### 2. Starting Conversations

1. **With Users**: Click on the "Users" tab in the sidebar to see all available users
2. **Search Users**: Use the search bar to find specific users
3. **Start Chat**: Click on any user to start a private conversation

### 3. Chat Features

- **Real-time Messaging**: Messages are delivered instantly
- **Typing Indicators**: See when someone is typing
- **Read Receipts**: Know when your messages are read
- **Online Status**: See who's currently online
- **Message History**: All conversations are saved and accessible

### 4. Admin Features

If you have admin privileges:
- Manage user roles
- View all users
- Delete user accounts
- Monitor system activity

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:userId` - Get private chat messages
- `GET /api/chat/group/:groupId` - Get group chat messages
- `POST /api/chat/message` - Send private message
- `POST /api/chat/group-message` - Send group message

### Users
- `GET /api/users` - Get all users (with search)
- `GET /api/users/online` - Get online users
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/:id/role` - Update user role (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Socket.IO Events

### Client to Server
- `private_message` - Send private message
- `group_message` - Send group message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `mark_read` - Mark messages as read

### Server to Client
- `new_private_message` - Receive private message
- `new_group_message` - Receive group message
- `user_typing` - User typing indicator
- `user_stopped_typing` - User stopped typing
- `messages_read` - Messages read confirmation
- `user_online` - User came online
- `user_offline` - User went offline

## Project Structure

```
chatapp/
├── backend/                 # Backend server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── socket/             # Socket.IO handlers
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── package.json            # Root package.json
└── README.md               # This file
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured CORS for security
- **Role-based Access**: Admin and user role management
- **Secure Headers**: Proper security headers implementation

## Performance Features

- **Database Indexing**: Optimized MongoDB queries
- **Real-time Updates**: Instant message delivery
- **Efficient Caching**: Smart conversation caching
- **Responsive Design**: Mobile-first approach
- **Optimized Bundles**: React production builds

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env` file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill processes using the port
   - Restart the application

3. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`
   - Ensure token hasn't expired

4. **Socket.IO Connection Issues**
   - Check backend server is running
   - Verify CORS configuration
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## Future Enhancements

- [ ] File sharing support
- [ ] Voice and video calls
- [ ] Message encryption
- [ ] Push notifications
- [ ] Mobile app
- [ ] Advanced search filters
- [ ] Message reactions
- [ ] User blocking
- [ ] Chat backup/export
- [ ] Multi-language support

---

**Happy Chatting! 🚀**
