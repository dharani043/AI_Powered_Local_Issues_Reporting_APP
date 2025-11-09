# MongoDB Atlas Integration Guide

## 1. MongoDB Atlas Setup

### Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (M0 Sandbox is free)

### Database Configuration
1. **Database Name**: `civic_issues_db`
2. **Collections**:
   - `users` - Store user accounts and profiles
   - `issues` - Store civic issues and reports
   - `feedback` - Store user feedback on resolved issues

### Security Setup
1. **Database Access**: Create a database user with read/write permissions
2. **Network Access**: Add your IP address (or 0.0.0.0/0 for development)
3. **Connection String**: Copy your connection string from Atlas

## 2. Environment Configuration

### Create .env file
```bash
cp .env.example .env
```

### Update .env with your MongoDB Atlas credentials
```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/civic_issues_db?retryWrites=true&w=majority
NODE_ENV=development
PORT=5173
```

## 3. Install MongoDB Dependencies

```bash
npm install mongodb
```

## 4. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  name: String,
  password: String, // hashed
  role: String, // 'user' or 'admin'
  createdAt: Date,
  updatedAt: Date
}
```

### Issues Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // 'pothole', 'streetlight', etc.
  status: String, // 'pending', 'in_progress', 'resolved'
  priority: String, // 'low', 'medium', 'high'
  location: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  imageUrl: String,
  inProgressImageUrl: String,
  resolvedImageUrl: String,
  reportedBy: String, // User ID
  reportedByName: String,
  reportedAt: Date,
  resolvedAt: Date,
  resolvedBy: String,
  votes: Number,
  adminNotes: String,
  userFeedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Feedback Collection
```javascript
{
  _id: ObjectId,
  issueId: ObjectId,
  userId: String,
  rating: Number,
  comment: String,
  createdAt: Date
}
```

## 5. Usage Instructions

### Switch to MongoDB Context
Replace the mock context with MongoDB context in your App.jsx:

```javascript
// Replace this import
import { IssueProvider } from './contexts/IssueContext';

// With this import
import { IssueProvider } from './contexts/IssueContextMongoDB';
```

### Database Operations
The MongoDB context provides the same interface as the mock context but with real database operations:

- `addIssue()` - Creates new issue in MongoDB
- `updateIssueStatus()` - Updates issue status with admin images
- `deleteIssue()` - Removes issue from database
- `addUserFeedback()` - Adds user feedback to resolved issues
- `getUserIssues()` - Gets issues by specific user
- `getIssuesByStatus()` - Filters issues by status
- `searchIssues()` - Full-text search across issues

### Error Handling
All database operations include proper error handling and loading states.

## 6. Production Deployment

### Environment Variables
Set these in your production environment:
- `MONGODB_URI` - Your Atlas connection string
- `NODE_ENV=production`

### Security Considerations
1. Use strong passwords for database users
2. Restrict network access to specific IPs in production
3. Enable MongoDB Atlas security features
4. Implement proper authentication and authorization
5. Use HTTPS in production

## 7. Monitoring and Analytics

The database layer includes built-in analytics functions:
- `getIssueStats()` - Overall statistics
- `getIssuesByCategory()` - Category breakdown
- `getIssuesByPriority()` - Priority analysis

## 8. Backup and Recovery

MongoDB Atlas provides:
- Automatic backups
- Point-in-time recovery
- Cross-region replication
- Disaster recovery options

## 9. Scaling

As your application grows:
- Upgrade cluster tier for more resources
- Implement database indexing for better performance
- Use MongoDB Atlas Search for advanced search features
- Consider sharding for very large datasets