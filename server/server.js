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
  origin: ['https://ai-powered-local-issues-reporting-a.vercel.app', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.get('/', (req, res) => {
  res.json({ status: 'Civic Issue Tracker API', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Test MongoDB connection
app.get('/api/test/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    if (connectionState === 1) {
      const testDoc = await User.countDocuments();
      res.json({ 
        status: 'Database connected', 
        state: states[connectionState],
        userCount: testDoc,
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
      });
    } else {
      res.json({ 
        status: 'Database not connected', 
        state: states[connectionState],
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database test failed', details: error.message });
  }
});

// Test registration endpoint
app.post('/api/test/register', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password } = req.body;
    
    console.log('Test registration:', { name, email, password: password ? 'provided' : 'missing' });
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });
    
    await user.save();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});
app.get('/api/init/municipality-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const admin = {
      name: 'Tamil Nadu State Admin',
      email: 'state.admin@tn.gov.in',
      password: 'admin123',
      role: 'municipality_admin',
      municipalityId: 'TN001',
      municipalityName: 'Tamil Nadu State'
    };

    const existingAdmin = await User.findOne({ email: admin.email });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      const newAdmin = new User({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: admin.role,
        municipalityId: admin.municipalityId,
        municipalityName: admin.municipalityName
      });
      await newAdmin.save();
      res.json({ message: 'Municipality admin created', created: admin.name });
    } else {
      res.json({ message: 'Municipality admin already exists', name: admin.name });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create municipality admin', details: error.message });
  }
});
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email role municipalityId').limit(50);
    const fieldWorkers = await User.find({ role: 'field_worker' }, 'name email role');
    res.json({ 
      totalUsers: users.length,
      users, 
      fieldWorkers: fieldWorkers.length,
      fieldWorkerList: fieldWorkers
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Initialize database - GET routes for easy access
app.get('/api/init/corporation-admins', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const corporationAdmins = [
      { name: 'Chennai Corporation Admin', email: 'admin@chennai.gov.in', password: 'chennai123', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation', pincode: '600001' },
      { name: 'Coimbatore Admin', email: 'admin@coimbatore.gov.in', password: 'coimbatore123', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: '641001' },
      { name: 'Madurai Admin', email: 'admin@madurai.gov.in', password: 'madurai123', municipalityId: 'MDU001', municipalityName: 'Madurai Corporation', pincode: '625001' }
    ];

    const created = [];
    for (const admin of corporationAdmins) {
      const existingAdmin = await User.findOne({ email: admin.email });
      if (!existingAdmin) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(admin.password, salt);
        const newAdmin = new User({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: 'corporation_admin',
          municipalityId: admin.municipalityId,
          municipalityName: admin.municipalityName,
          pincode: admin.pincode
        });
        await newAdmin.save();
        created.push(admin.municipalityName);
      }
    }
    res.json({ message: 'Corporation admins created', created });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create admins', details: error.message });
  }
});

app.get('/api/init/field-workers', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const fieldWorkers = [
      { name: 'Ravi Kumar', email: 'ravi.worker@chennai.gov.in', password: 'worker123', phone: '+91-9876543210', specialization: 'Plumbing', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' },
      { name: 'Suresh Babu', email: 'suresh.electrician@chennai.gov.in', password: 'worker123', phone: '+91-9876543211', specialization: 'Electrical', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' }
    ];

    const created = [];
    for (const worker of fieldWorkers) {
      const existingWorker = await User.findOne({ email: worker.email });
      if (!existingWorker) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(worker.password, salt);
        const newWorker = new User({
          name: worker.name,
          email: worker.email,
          password: hashedPassword,
          role: 'field_worker',
          phone: worker.phone,
          specialization: worker.specialization,
          municipalityId: worker.municipalityId,
          municipalityName: worker.municipalityName,
          isActive: true
        });
        await newWorker.save();
        created.push(worker.name);
      }
    }
    res.json({ message: 'Field workers created', created });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workers', details: error.message });
  }
});

// List all routes for debugging
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes });
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
