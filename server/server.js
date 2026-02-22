require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./lib/mongodb');

// Routes
let authRoutes, issueRoutes, feedbackRoutes, userRoutes, notificationRoutes, emailRoutes, fieldWorkerRoutes;

try {
  authRoutes = require('./routes/auth');
  issueRoutes = require('./routes/issues');
  feedbackRoutes = require('./routes/feedback');
  userRoutes = require('./routes/user');
  notificationRoutes = require('./routes/notifications');
  emailRoutes = require('./routes/email');
  fieldWorkerRoutes = require('./routes/fieldWorkers');
  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const { User, Issue, Feedback, Notification } = require('./lib/database');
console.log('✅ Database models initialized');


setTimeout(async () => {
  try {
    const testUser = await User.findOne();
    if (testUser) {
      const existingNotification = await Notification.findOne({ userId: testUser._id, title: 'System Test' });
      if (!existingNotification) {
        await new Notification({
          userId: testUser._id,
          title: 'System Test',
          message: 'Notification system initialized successfully'
        }).save();
        console.log('✅ Notification collection created');
      }
    }
  } catch (error) {
    console.log('⚠️ Could not create test notification:', error.message);
  }
}, 2000);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://aipoweredlocalissuesreportingapp-production.up.railway.app', 'https://*.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/field-workers', fieldWorkerRoutes);

console.log('✅ All routes registered successfully');
console.log('Available routes:');
console.log('- /api/auth');
console.log('- /api/issues');
console.log('- /api/feedback');
console.log('- /api/user');
console.log('- /api/notifications');
console.log('- /api/email');
console.log('- /api/field-workers');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
