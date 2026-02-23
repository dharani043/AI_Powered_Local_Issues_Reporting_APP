# 🏛️ Civic Issue Tracker - Smart Municipal Management System
Demo URL - https://ai-powered-local-issues-reporting-a.vercel.app/
A comprehensive full-stack web application designed to revolutionize civic issue reporting and municipal management through intelligent automation, real-time tracking, and data-driven insights.

## 🌟 Overview

The Civic Issue Tracker is a sophisticated municipal management platform that bridges the gap between citizens and local government. Built with modern web technologies, it provides an intuitive interface for citizens to report civic issues while offering powerful administrative tools for efficient issue resolution and municipal governance.

## ✨ Key Features

### 🎯 **Multi-Role Authentication System**
- **Citizens**: Register, login, and manage personal issue reports
- **Corporation Admins**: Area-specific administrative access with unique ID and pincode validation
- **Municipality Admins**: Multi-municipality oversight and issue delegation capabilities
- **JWT-based Security**: Secure token-based authentication with role-based access control

### 📍 **Intelligent Geo-Location System**
- **GPS Integration**: Automatic location detection using device GPS
- **Geo-tagged Images**: EXIF data extraction for precise issue location mapping
- **Municipality Auto-Assignment**: Smart routing of issues to appropriate municipal authorities based on geographic coordinates
- **LocationIQ API Integration**: Reverse geocoding for accurate address resolution

### 📱 **Advanced Issue Reporting**
- **Multi-Category Support**: Infrastructure, utilities, sanitation, safety, and environmental issues
- **Rich Media Upload**: High-quality image capture with automatic compression using Sharp.js
- **Priority Classification**: Automatic and manual priority assignment (Low, Medium, High, Critical)
- **Real-time Validation**: Client and server-side validation for data integrity

### 🔔 **Real-Time Notification System**
- **Firebase Cloud Messaging**: Push notifications for instant updates
- **Role-Based Filtering**: Targeted notifications based on user roles and responsibilities
- **Multi-Channel Delivery**: In-app notifications, email alerts, and push notifications
- **Status Update Tracking**: Automatic notifications for issue status changes

### 📊 **Comprehensive Analytics Dashboard**
- **Interactive Charts**: Visual representation of issue trends and patterns
- **Time-Based Filtering**: Historical data analysis with customizable date ranges
- **Performance Metrics**: Resolution times, success rates, and efficiency indicators
- **Geographic Distribution**: Heat maps and cluster analysis of issue locations

### 🗺️ **Interactive Map Visualization**
- **Real-Time Issue Mapping**: Live visualization of reported issues on interactive maps
- **Cluster Analysis**: Intelligent grouping of nearby issues for better resource allocation
- **Filter Capabilities**: Multi-parameter filtering by status, category, priority, and date
- **Geographic Insights**: Spatial analysis for identifying problem areas and trends

### 💬 **Integrated Feedback System**
- **User Satisfaction Tracking**: Post-resolution feedback collection with rating system
- **Comment Management**: Detailed feedback comments for continuous improvement
- **Performance Analytics**: Feedback-driven insights for service quality enhancement
- **Database Integration**: Embedded feedback storage for optimal performance

### 🎨 **Modern User Interface**
- **Gradient Design System**: Professional, corporate-appropriate visual design
- **Smooth Animations**: Micro-interactions and transitions for enhanced user experience
- **Responsive Layout**: Mobile-first design ensuring compatibility across all devices
- **Dark/Light Theme**: User preference-based theme switching
- **Accessibility Compliant**: WCAG guidelines adherence for inclusive design

## 🏗️ Technical Architecture

### **Frontend Stack**
- **React 18.3.1**: Modern component-based UI framework with hooks
- **Vite**: Lightning-fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Beautiful, customizable icon library
- **Context API**: State management for authentication, themes, and issues
- **Axios**: HTTP client for API communication

### **Backend Stack**
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Minimal and flexible web application framework
- **MongoDB**: NoSQL database for scalable data storage
- **Mongoose**: Elegant MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure authentication
- **Multer**: Middleware for handling multipart/form-data file uploads
- **Sharp**: High-performance image processing library

### **External Services**
- **Firebase**: Real-time notifications and cloud messaging
- **LocationIQ**: Geocoding and reverse geocoding services
- **Nodemailer**: Email service integration for notifications
- **EXIF.js**: JavaScript library for reading image metadata

## 📁 Project Structure

```
civic-issue-tracker/
├── src/                          # Frontend source code
│   ├── components/               # Reusable UI components
│   │   ├── AuthModal.jsx        # Authentication modal component
│   │   ├── Header.jsx           # Application header with navigation
│   │   └── Sidebar.jsx          # Navigation sidebar with animations
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.jsx      # Authentication state management
│   │   ├── IssueContextAPI.jsx  # Issue management with API integration
│   │   ├── ThemeContext.jsx     # Theme switching functionality
│   │   └── NotificationContext.jsx # Notification state management
│   ├── pages/                   # Application pages/routes
│   │   ├── HomePage.jsx         # Landing page with feature overview
│   │   ├── ReportPage.jsx       # Issue reporting interface
│   │   ├── UserDashboard.jsx    # User's personal dashboard
│   │   ├── AdminPage.jsx        # Municipality admin interface
│   │   ├── CorporationDashboard.jsx # Corporation-specific admin panel
│   │   ├── AnalyticsPage.jsx    # Data visualization and analytics
│   │   ├── MapView.jsx          # Interactive map interface
│   │   └── SettingsPage.jsx     # User preferences and settings
│   ├── lib/                     # Utility libraries and configurations
│   │   ├── firebase.js          # Firebase configuration and setup
│   │   └── database.js          # Database connection utilities
│   └── App.jsx                  # Main application component
├── server/                      # Backend server code
│   ├── routes/                  # API route handlers
│   │   ├── auth.js             # Authentication endpoints
│   │   ├── issues.js           # Issue CRUD operations
│   │   ├── notifications.js    # Notification management
│   │   └── user.js             # User profile management
│   ├── middleware/              # Custom middleware functions
│   │   └── auth.js             # JWT authentication middleware
│   ├── lib/                    # Server utilities and services
│   │   ├── database.js         # MongoDB schemas and models
│   │   ├── notificationService.js # Notification delivery service
│   │   └── emailService.js     # Email notification service
│   ├── uploads/                # File upload storage directory
│   └── server.js               # Express server configuration
├── images/                     # Static image assets
└── docs/                       # Documentation files
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v5.0 or higher)
- **Git** for version control

### 1. Clone Repository
```bash
git clone <repository-url>
cd civic-issue-tracker
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

#### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key
```

#### Backend Environment (server/.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civic_issue_tracker
JWT_SECRET=your_super_secure_jwt_secret_key_here
LOCATIONIQ_API_KEY=your_locationiq_api_key
FIREBASE_SERVER_KEY=your_firebase_server_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Database Setup
```bash
# Start MongoDB service
mongod

# Create initial admin accounts (optional)
node create-admins.js
node create-municipality-admins.js
```

### 5. Start Development Servers
```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend development server
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 👥 User Roles & Permissions

### 🏠 **Citizens**
- Register and authenticate with email/password
- Report civic issues with location and images
- Track personal issue status and history
- Receive notifications for issue updates
- Provide feedback on resolved issues
- View resolved issues with before/after comparisons

### 🏢 **Corporation Admins**
- Access area-specific dashboard with unique ID and pincode
- Manage issues within their municipal jurisdiction
- Update issue status (Pending → In Progress → Resolved)
- Upload resolution images and add comments
- View analytics for their municipality
- Receive notifications for new issues in their area

### 🏛️ **Municipality Admins**
- Multi-municipality oversight and management
- Create and manage corporation admin accounts
- Review and delegate issues to Corporation Admins
- View comprehensive analytics across all municipalities
- System configuration and user management
- Access to all issues regardless of location
- Advanced reporting and data export capabilities

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/corporation-login # Corporation admin login
POST /api/auth/create-corporation-admin # Create corporation admin
```

### Issues Management
```
GET    /api/issues              # Get all issues (filtered by role)
POST   /api/issues              # Create new issue
PUT    /api/issues/:id          # Update issue status
DELETE /api/issues/:id          # Delete issue
POST   /api/issues/:id/feedback # Submit user feedback
```

### Notifications
```
GET  /api/notifications         # Get user notifications
POST /api/notifications/send    # Send notification (admin only)
PUT  /api/notifications/:id/read # Mark notification as read
```

### User Management
```
GET  /api/user/profile          # Get user profile
PUT  /api/user/profile          # Update user profile
GET  /api/user/issues           # Get user's issues
```

## 📊 Database Schema

### Issues Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String, // 'infrastructure', 'utilities', 'sanitation', etc.
  priority: String, // 'low', 'medium', 'high', 'critical'
  status: String,   // 'pending', 'in_progress', 'resolved'
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  images: [String], // File paths
  resolutionImages: [String],
  reportedBy: ObjectId, // User ID
  assignedTo: String,   // Municipality ID
  municipalityId: String,
  userFeedback: {
    rating: Number,
    comment: String,
    submittedAt: Date
  },
  createdAt: Date,
  updatedAt: Date,
  resolvedAt: Date
}
```

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed with bcrypt
  role: String,     // 'user', 'municipality_admin', 'corporation_admin'
  municipalityId: String, // For corporation admins
  pincode: String,        // For corporation admins
  createdAt: Date,
  lastLogin: Date
}
```

## 🔔 Notification System

### Notification Types
- **new_issue**: New issue reported in municipality
- **status_update**: Issue status changed
- **system**: System-wide announcements
- **feedback_request**: Request for user feedback

### Delivery Channels
- **Push Notifications**: Firebase Cloud Messaging
- **Email Notifications**: Nodemailer with SMTP
- **In-App Notifications**: Real-time UI updates

## 📈 Analytics & Reporting

### Key Metrics
- **Issue Resolution Rate**: Percentage of resolved issues
- **Average Resolution Time**: Time from report to resolution
- **Category Distribution**: Issues by category breakdown
- **Geographic Hotspots**: Areas with highest issue density
- **User Satisfaction**: Average feedback ratings
- **Municipality Performance**: Comparative analysis

### Visualization Features
- Interactive charts and graphs
- Time-series analysis
- Geographic heat maps
- Trend identification
- Performance benchmarking

## 🔒 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Role-Based Access**: Granular permission system
- **Session Management**: Automatic token expiration

### Data Protection
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size restrictions
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Protection**: Input sanitization and output encoding

## 🌐 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start production server
cd server
npm start
```

### Environment Variables (Production)
- Update all API URLs to production endpoints
- Configure production MongoDB connection
- Set secure JWT secrets
- Configure production Firebase project
- Set up production email service

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🚀 Future Enhancements

- **Mobile Application**: React Native mobile app
- **AI-Powered Categorization**: Automatic issue classification
- **Blockchain Integration**: Transparent issue tracking
- **IoT Sensor Integration**: Automated issue detection
- **Multi-Language Support**: Internationalization
- **Advanced Analytics**: Machine learning insights
- **Citizen Engagement**: Voting and community features

---

**Built with ❤️ for better civic governance and community engagement**
