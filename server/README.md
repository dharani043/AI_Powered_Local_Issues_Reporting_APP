# Civic Issue API Server

This is the backend API server for the Civic Issue Reporting Platform that connects to MongoDB Atlas.

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
The `.env` file is already configured with your MongoDB Atlas URI:
```
MONGODB_URI=mongodb+srv://dharanishankar118:dharanishankar118@issuetracker.hqoer2d.mongodb.net/?retryWrites=true&w=majority&appName=issuetracker
DATABASE_NAME=issuetracker
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 3. Start the Server
```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Issues
- `GET /api/issues` - Get all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue by ID
- `PUT /api/issues/:id/status` - Update issue status (admin)
- `DELETE /api/issues/:id` - Delete issue
- `POST /api/issues/:id/feedback` - Add user feedback
- `GET /api/issues/user/:userId` - Get user's issues
- `GET /api/issues/status/:status` - Get issues by status
- `GET /api/issues/search/:query` - Search issues
- `GET /api/issues/analytics/stats` - Get statistics

### Health Check
- `GET /api/health` - Server health status

## Database Collections

### users
- User authentication and profile data
- Roles: 'user' or 'admin'

### issues
- Civic issues with full lifecycle tracking
- Status: 'pending', 'in_progress', 'resolved'
- Images for each status phase

### feedback
- User ratings and comments on resolved issues
- Analytics data for performance tracking

## Features

✅ **MongoDB Atlas Integration** - Direct connection to your database  
✅ **JWT Authentication** - Secure user sessions  
✅ **Role-based Access** - Admin and user permissions  
✅ **Image Upload Support** - Base64 image handling  
✅ **Real-time Statistics** - Issue analytics  
✅ **Search & Filter** - Advanced querying  
✅ **Error Handling** - Comprehensive error responses  
✅ **CORS Enabled** - Frontend integration ready  

## Usage

1. Start the API server: `npm run dev`
2. Start the frontend: `npm run dev` (in main project)
3. Issues reported in the frontend will now be saved to MongoDB Atlas!

The frontend is already configured to use this API server through the `IssueContextAPI` context.