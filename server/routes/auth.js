const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../lib/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    console.log('Received data:', req.body);
    console.log('Password value:', password);


    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      // contact,                                
      password: hashedPassword,
      role
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // contact: user.contact
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, loginType, municipalityId, pincode } = req.body;
    console.log('Login attempt:', { email, loginType, municipalityId, pincode });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, role: user.role, municipalityId: user.municipalityId });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Additional validation for corporation/municipality admin
    if (loginType === 'corporation_admin' || loginType === 'municipality_admin') {
      if (user.role !== 'corporation_admin' && user.role !== 'municipality_admin') {
        console.log('Role mismatch. User role:', user.role);
        return res.status(400).json({ error: 'Not authorized as admin' });
      }
      if (municipalityId && pincode) {
        if (user.municipalityId !== municipalityId || user.pincode !== pincode) {
          console.log('Municipality details mismatch:', { 
            provided: { municipalityId, pincode },
            stored: { municipalityId: user.municipalityId, pincode: user.pincode }
          });
          return res.status(400).json({ error: 'Invalid municipality details' });
        }
      }
    }
    
    console.log('Login successful for:', email);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role === 'municipality_admin' ? 'corporation_admin' : user.role,
        municipalityId: user.municipalityId,
        municipalityName: user.municipalityName,
        pincode: user.pincode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});       

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Create corporation admins
router.post('/create-corporation-admins', async (req, res) => {
  try {
    const corporationAdmins = [
      // Major Corporations
      { name: 'Chennai Corporation Admin', email: 'admin@chennai.gov.in', password: 'chennai123', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation', pincode: '600001' },
      { name: 'Coimbatore Admin', email: 'admin@coimbatore.gov.in', password: 'coimbatore123', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: '641001' },
      { name: 'Madurai Admin', email: 'admin@madurai.gov.in', password: 'madurai123', municipalityId: 'MDU001', municipalityName: 'Madurai Corporation', pincode: '625001' },
      { name: 'Trichy Admin', email: 'admin@trichy.gov.in', password: 'trichy123', municipalityId: 'TRY001', municipalityName: 'Trichy Corporation', pincode: '620001' },
      { name: 'Salem Admin', email: 'admin@salem.gov.in', password: 'salem123', municipalityId: 'SLM001', municipalityName: 'Salem Corporation', pincode: '636001' },
      { name: 'Thanjavur Admin', email: 'admin@thanjavur.gov.in', password: 'thanjavur123', municipalityId: 'TJV001', municipalityName: 'Thanjavur Municipality', pincode: '613001' },
      
      // Additional Districts
      { name: 'Tirunelveli Admin', email: 'admin@tirunelveli.gov.in', password: 'tirunelveli123', municipalityId: 'TVL001', municipalityName: 'Tirunelveli Corporation', pincode: '627001' },
      { name: 'Erode Admin', email: 'admin@erode.gov.in', password: 'erode123', municipalityId: 'ERD001', municipalityName: 'Erode Municipality', pincode: '638001' },
      { name: 'Vellore Admin', email: 'admin@vellore.gov.in', password: 'vellore123', municipalityId: 'VLR001', municipalityName: 'Vellore Corporation', pincode: '632001' },
      { name: 'Thoothukudi Admin', email: 'admin@thoothukudi.gov.in', password: 'thoothukudi123', municipalityId: 'TTK001', municipalityName: 'Thoothukudi Corporation', pincode: '628001' },
      { name: 'Dindigul Admin', email: 'admin@dindigul.gov.in', password: 'dindigul123', municipalityId: 'DGL001', municipalityName: 'Dindigul Municipality', pincode: '624001' },
      { name: 'Tiruppur Admin', email: 'admin@tiruppur.gov.in', password: 'tiruppur123', municipalityId: 'TPR001', municipalityName: 'Tiruppur Corporation', pincode: '641601' },
      { name: 'Nagercoil Admin', email: 'admin@nagercoil.gov.in', password: 'nagercoil123', municipalityId: 'NCL001', municipalityName: 'Nagercoil Municipality', pincode: '629001' },
      { name: 'Kumbakonam Admin', email: 'admin@kumbakonam.gov.in', password: 'kumbakonam123', municipalityId: 'KBK001', municipalityName: 'Kumbakonam Municipality', pincode: '612001' },
      { name: 'Karur Admin', email: 'admin@karur.gov.in', password: 'karur123', municipalityId: 'KRR001', municipalityName: 'Karur Municipality', pincode: '639001' },
      { name: 'Hosur Admin', email: 'admin@hosur.gov.in', password: 'hosur123', municipalityId: 'HSR001', municipalityName: 'Hosur Municipality', pincode: '635109' },
      { name: 'Ambur Admin', email: 'admin@ambur.gov.in', password: 'ambur123', municipalityId: 'AMB001', municipalityName: 'Ambur Municipality', pincode: '635802' },
      { name: 'Pollachi Admin', email: 'admin@pollachi.gov.in', password: 'pollachi123', municipalityId: 'PLC001', municipalityName: 'Pollachi Municipality', pincode: '642001' },
      { name: 'Rajapalayam Admin', email: 'admin@rajapalayam.gov.in', password: 'rajapalayam123', municipalityId: 'RPM001', municipalityName: 'Rajapalayam Municipality', pincode: '626117' },
      { name: 'Pudukkottai Admin', email: 'admin@pudukkottai.gov.in', password: 'pudukkottai123', municipalityId: 'PDK001', municipalityName: 'Pudukkottai Municipality', pincode: '622001' },
      { name: 'Sivakasi Admin', email: 'admin@sivakasi.gov.in', password: 'sivakasi123', municipalityId: 'SVK001', municipalityName: 'Sivakasi Municipality', pincode: '626123' }
    ];

    const created = [];
    const existing = [];
    
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
        created.push({
          name: admin.municipalityName,
          email: admin.email,
          municipalityId: admin.municipalityId,
          pincode: admin.pincode
        });
      } else {
        existing.push(admin.municipalityName);
      }
    }

    res.json({ 
      message: 'Corporation admin creation completed', 
      created: created.length,
      existing: existing.length,
      details: { created, existing }
    });
  } catch (error) {
    console.error('Error creating corporation admins:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Create field workers
router.post('/create-field-workers', async (req, res) => {
  try {
    const fieldWorkers = [
      {
        name: 'Ravi Kumar',
        email: 'worker@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543210',
        specialization: 'Plumbing',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Suresh Babu',
        email: 'electrician@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543211',
        specialization: 'Electrical',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Murugan S',
        email: 'roads@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543212',
        specialization: 'Road Maintenance',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Karthik R',
        email: 'sanitation@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543213',
        specialization: 'Sanitation',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      }
    ];

    const created = [];
    const existing = [];

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
        created.push({
          name: worker.name,
          email: worker.email,
          specialization: worker.specialization
        });
      } else {
        existing.push(worker.name);
      }
    }

    res.json({ 
      message: 'Field worker creation completed', 
      created: created.length,
      existing: existing.length,
      details: { created, existing }
    });
  } catch (error) {
    console.error('Error creating field workers:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;