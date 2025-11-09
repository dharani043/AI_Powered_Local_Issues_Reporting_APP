// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { Issue, Feedback, User } = require('../lib/database');
// const { auth, adminAuth } = require('../middleware/auth');

// const router = express.Router();

// // Multer storage setup
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const uploadPath = 'uploads/';
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath);
//     }
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ storage });

// // Get all issues
// router.get('/', auth, async (req, res) => {
//   try {
//     const { status, category, priority, search } = req.query;
//     let query = {};

//     if (status) query.status = status;
//     if (category) query.category = category;
//     if (priority) query.priority = priority;
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     const issues = await Issue.find(query)
//       .populate('reportedBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .sort({ createdAt: -1 });


//     res.json(issues);
//   } catch (error) {
//     console.error('Get issues error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // My issues
// router.get('/my-issues', auth, async (req, res) => {
//   try {
//     const issues = await Issue.find({ reportedBy: req.user._id })
//       .populate('reportedBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(issues);
//   } catch (error) {
//     console.error('Get user issues error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Create issue with image
// router.post('/', auth, upload.single('image'), async (req, res) => {
//   try {
//     const { title, description, category, priority, location } = req.body;
//     const imagePath = req.file ? req.file.path : null;

//     const issue = new Issue({
//       title,
//       description,
//       category,
//       priority: priority || 'medium',
//       location,
//       image: imagePath,
//       reportedBy: req.user._id
//     });

//     await issue.save();
//     await issue.populate('reportedBy', 'name email');

//     res.status(201).json(issue);
//   } catch (error) {
//     console.error('Create issue error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Delete issue (admin only)
// router.delete('/:id', adminAuth, async (req, res) => {
//   try {
//     const issue = await Issue.findByIdAndDelete(req.params.id);
//     if (!issue) return res.status(404).json({ error: 'Issue not found' });

//     // Delete image if it exists
//     if (issue.image && fs.existsSync(issue.image)) {
//       fs.unlinkSync(issue.image);
//     }

//     res.json({ message: 'Issue deleted successfully' });
//   } catch (error) {
//     console.error('Delete issue error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });


// // Update issue status (admin only)
// router.patch('/:id/status', adminAuth, async (req, res) => {
//   try {
//     const { status, assignedTo } = req.body;

//     const updateData = { status, updatedAt: new Date() };
//     if (assignedTo) updateData.assignedTo = assignedTo;

//     const issue = await Issue.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//       .populate('reportedBy', 'name email')
//       .populate('assignedTo', 'name email');

//     if (!issue) return res.status(404).json({ error: 'Issue not found' });

//     res.json(issue);
//   } catch (error) {
//     console.error('Update issue error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Add feedback
// router.post('/:id/feedback', auth, async (req, res) => {
//   try {
//     const { rating, comment } = req.body;

//     const feedback = new Feedback({
//       issueId: req.params.id,
//       userId: req.user._id,
//       rating,
//       comment
//     });

//     await feedback.save();
//     await feedback.populate('userId', 'name email');

//     res.status(201).json(feedback);
//   } catch (error) {
//     console.error('Add feedback error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Get feedback
// router.get('/:id/feedback', auth, async (req, res) => {
//   try {
//     const feedback = await Feedback.find({ issueId: req.params.id })
//       .populate('userId', 'name email')
//       .sort({ createdAt: -1 });

//     res.json(feedback);
//   } catch (error) {
//     console.error('Get feedback error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Update issue status with image upload (admin only)
// router.patch('/:id/status-update', adminAuth, upload.single('statusImage'), async (req, res) => {
//   try {
//     const { status, adminNotes } = req.body;
//     const imagePath = req.file ? req.file.path : null;

//     const updateData = { 
//       status, 
//       adminNotes,
//       updatedAt: new Date(),
//       updatedBy: req.user._id
//     };

//     // Add image path based on status
//     if (status === 'in_progress' && imagePath) {
//       updateData.inProgressImageUrl = imagePath;
//     } else if (status === 'resolved' && imagePath) {
//       updateData.rectifiedImage = imagePath;
//     }

//     const issue = await Issue.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true }
//     )
//       .populate('reportedBy', 'name email')
//       .populate('assignedTo', 'name email')
//       .populate('updatedBy', 'name');

//     if (!issue) return res.status(404).json({ error: 'Issue not found' });

//     res.json(issue);
//   } catch (error) {
//     console.error('Update issue status error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // Resolve issue with image upload
// router.post('/resolve/:id', upload.single('rectifiedImage'), async (req, res) => {
//   try {
//     const issueId = req.params.id;
//     const imageBuffer = req.file.buffer;

//     // compress and convert to base64
//     const compressedImage = await sharp(imageBuffer)
//       .resize({ width: 640 }) // Resize to save space
//       .jpeg({ quality: 70 }) // Compress
//       .toBuffer();

//     const base64Image = `data:image/jpeg;base64,${compressedImage.toString('base64')}`;

//     const updatedIssue = await Issue.findByIdAndUpdate(
//       issueId,
//       {
//         status: 'resolved',
//         rectifiedImage: base64Image,
//         updatedAt: Date.now()
//       },
//       { new: true }
//     );

//     res.status(200).json(updatedIssue);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Image upload failed' });
//   }
// });


// // Get stats
// router.get('/analytics/stats', auth, async (req, res) => {
//   try {
//     const totalIssues = await Issue.countDocuments();
//     const openIssues = await Issue.countDocuments({ status: 'open' });
//     const inProgressIssues = await Issue.countDocuments({ status: 'in-progress' });
//     const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

//     const categoryStats = await Issue.aggregate([
//       { $group: { _id: '$category', count: { $sum: 1 } } }
//     ]);

//     const priorityStats = await Issue.aggregate([
//       { $group: { _id: '$priority', count: { $sum: 1 } } }
//     ]);

//     const recentIssues = await Issue.find()
//       .populate('reportedBy', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(5);

//     res.json({
//       totalIssues,
//       openIssues,
//       inProgressIssues,
//       resolvedIssues,
//       categoryStats,
//       priorityStats,
//       recentIssues
//     });
//   } catch (error) {
//     console.error('Get stats error:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// module.exports = router;






const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Issue, Feedback, User } = require('../lib/database');
const { auth, adminAuth } = require('../middleware/auth');
const imageClassifier = require('../lib/imageClassifier');
const departmentRouter = require('../lib/departmentRouter');

const router = express.Router();

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all issues (filtered by municipality for municipality admins)
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    let query = {};

    // Filter by municipality for corporation admins
    if (req.user.role === 'corporation_admin') {
      query.municipalityId = req.user.municipalityId;
      console.log(`Corporation admin ${req.user.name} filtering by municipalityId: ${req.user.municipalityId}`);
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Query:', JSON.stringify(query));
    const issues = await Issue.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    console.log(`Found ${issues.length} issues for query`);
    res.json(issues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// My issues
router.get('/my-issues', auth, async (req, res) => {
  try {
    const issues = await Issue.find({ reportedBy: req.user._id })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create issue with image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, priority, location, geoLocation } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Validation: Require image
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required to report an issue' });
    }

    // Validation: Require location data (either GPS or manual)
    if (!geoLocation && !location) {
      return res.status(400).json({ error: 'Location data is required' });
    }

    let parsedGeoLocation = null;
    if (geoLocation) {
      parsedGeoLocation = JSON.parse(geoLocation);
      if (!parsedGeoLocation.latitude || !parsedGeoLocation.longitude) {
        return res.status(400).json({ error: 'Invalid GPS coordinates' });
      }
    }

    // AI-powered image classification and department routing
    let aiClassification = null;
    let departmentInfo = null;
    
    try {
      // Initialize AI classifier on first use
      if (!imageClassifier.model) {
        await imageClassifier.loadModel();
      }
      
      // Classify image and route to department
      aiClassification = await imageClassifier.classifyImage(imagePath);
      departmentInfo = await departmentRouter.routeIssue(imagePath, {
        category,
        userPriority: priority
      });
      
      console.log('AI Classification:', aiClassification);
      console.log('Department Routing:', departmentInfo);
    } catch (aiError) {
      console.error('AI processing error:', aiError);
    }

    const issueData = {
      title,
      description,
      category: aiClassification?.category || category,
      priority: departmentInfo?.priority || priority || 'medium',
      location,
      image: imagePath,
      reportedBy: req.user._id,
      // AI enhancement fields
      aiClassification: aiClassification ? {
        detectedCategory: aiClassification.category,
        confidence: aiClassification.confidence,
        processedAt: new Date()
      } : null,
      departmentRouting: departmentInfo ? {
        assignedDepartment: departmentInfo.department,
        contactEmail: departmentInfo.contact,
        estimatedResponse: departmentInfo.estimatedResponse,
        autoRouted: departmentInfo.autoRouted,
        routingConfidence: departmentInfo.confidence
      } : null
    };

    if (parsedGeoLocation) {
      issueData.geoLocation = parsedGeoLocation;
    }

    // Advanced municipality assignment with automatic pincode detection
    const assignMunicipality = (geoLocation, location) => {
      // Generate pincode based on GPS coordinates
      const generatePincode = (lat, lng) => {
        // Coimbatore area detection (expanded boundaries)
        if ((lat >= 10.5 && lat <= 13.0) && (lng >= 76.5 && lng <= 77.5)) {
          // Generate specific pincode based on sub-area
          const latIndex = Math.floor((lat - 10.5) * 4); // 0-9
          const lngIndex = Math.floor((lng - 76.5) * 10); // 0-9
          return `641${String(latIndex).padStart(2, '0')}${lngIndex}`;
        }
        // Chennai area
        if ((lat >= 12.5 && lat <= 13.5) && (lng >= 79.8 && lng <= 80.5)) {
          return '600001';
        }
        // Madurai area
        if ((lat >= 9.5 && lat <= 10.2) && (lng >= 77.8 && lng <= 78.5)) {
          return '625001';
        }
        return null;
      };

      // Municipality definitions with expanded boundaries
      const municipalityBounds = {
        'CBE001': {
          name: 'Coimbatore Corporation',
          bounds: {
            north: 13.0,   // Expanded
            south: 10.5,   // Expanded
            east: 77.5,    // Expanded
            west: 76.5     // Expanded
          },
          pincodePattern: /^641/
        },
        'CHN001': {
          name: 'Chennai Corporation',
          bounds: {
            north: 13.5,
            south: 12.5,
            east: 80.5,
            west: 79.8
          },
          pincodePattern: /^600/
        },
        'MDU001': {
          name: 'Madurai Corporation',
          bounds: {
            north: 10.2,
            south: 9.5,
            east: 78.5,
            west: 77.8
          },
          pincodePattern: /^625/
        }
      };

      // Check GPS coordinates first
      if (geoLocation && geoLocation.latitude && geoLocation.longitude) {
        const lat = parseFloat(geoLocation.latitude);
        const lng = parseFloat(geoLocation.longitude);
        
        // Generate pincode from coordinates
        const generatedPincode = generatePincode(lat, lng);
        
        for (const [munId, data] of Object.entries(municipalityBounds)) {
          const bounds = data.bounds;
          if (lat >= bounds.south && lat <= bounds.north && 
              lng >= bounds.west && lng <= bounds.east) {
            return {
              municipalityId: munId,
              municipalityName: data.name,
              pincode: generatedPincode || '641001', // Use generated or default
              detectedBy: 'GPS + Auto-Pincode',
              coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            };
          }
        }
      }

      // Fallback to location text matching
      const locationText = location.toLowerCase();
      if (locationText.includes('coimbatore') || locationText.includes('641')) {
        return {
          municipalityId: 'CBE001',
          municipalityName: 'Coimbatore Corporation',
          pincode: '641001',
          detectedBy: 'Location Text'
        };
      }
      if (locationText.includes('chennai') || locationText.includes('600')) {
        return {
          municipalityId: 'CHN001',
          municipalityName: 'Chennai Corporation',
          pincode: '600001',
          detectedBy: 'Location Text'
        };
      }
      if (locationText.includes('madurai') || locationText.includes('625')) {
        return {
          municipalityId: 'MDU001',
          municipalityName: 'Madurai Corporation',
          pincode: '625001',
          detectedBy: 'Location Text'
        };
      }

      return null;
    };

    // Dynamic municipality assignment using GPS coordinates
    const assignMunicipalityByGPS = async (geoLocation) => {
      if (!geoLocation?.latitude || !geoLocation?.longitude) {
        return { municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: '641001', detectionMethod: 'Manual' };
      }

      try {
        const axios = require('axios');
        const LOCATIONIQ_KEY = 'pk.f526e213a60e771ab60012038dea1247';
        const url = `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${geoLocation.latitude}&lon=${geoLocation.longitude}&format=json`;
        
        const response = await axios.get(url);
        const address = response.data.address;
        const detectedPincode = address.postcode;
        const city = address.city || address.town || address.village || '';
        
        // Comprehensive municipality mapping
        const municipalityMap = {
          '600': { id: 'CHN001', name: 'Chennai Corporation', defaultPin: '600001' },
          '641': { id: 'CBE001', name: 'Coimbatore Corporation', defaultPin: '641001' },
          '625': { id: 'MDU001', name: 'Madurai Corporation', defaultPin: '625001' },
          '620': { id: 'TRY001', name: 'Trichy Corporation', defaultPin: '620001' },
          '636': { id: 'SLM001', name: 'Salem Corporation', defaultPin: '636001' },
          '613': { id: 'TJV001', name: 'Thanjavur Municipality', defaultPin: '613001' },
          '627': { id: 'TVL001', name: 'Tirunelveli Corporation', defaultPin: '627001' },
          '638': { id: 'ERD001', name: 'Erode Municipality', defaultPin: '638001' },
          '632': { id: 'VLR001', name: 'Vellore Corporation', defaultPin: '632001' },
          '628': { id: 'TTK001', name: 'Thoothukudi Corporation', defaultPin: '628001' },
          '624': { id: 'DGL001', name: 'Dindigul Municipality', defaultPin: '624001' },
          '629': { id: 'NCL001', name: 'Nagercoil Municipality', defaultPin: '629001' },
          '612': { id: 'KBK001', name: 'Kumbakonam Municipality', defaultPin: '612001' },
          '639': { id: 'KRR001', name: 'Karur Municipality', defaultPin: '639001' },
          '635': { id: 'HSR001', name: 'Hosur Municipality', defaultPin: '635109' },
          '642': { id: 'PLC001', name: 'Pollachi Municipality', defaultPin: '642001' },
          '626': { id: 'RPM001', name: 'Rajapalayam Municipality', defaultPin: '626117' },
          '622': { id: 'PDK001', name: 'Pudukkottai Municipality', defaultPin: '622001' }
        };

        // Check pincode mapping
        for (const [prefix, mun] of Object.entries(municipalityMap)) {
          if (detectedPincode?.startsWith(prefix)) {
            return { municipalityId: mun.id, municipalityName: mun.name, pincode: detectedPincode || mun.defaultPin, detectionMethod: 'GPS + LocationIQ' };
          }
        }

        // Check city name mapping
        const cityMap = {
          'chennai': 'CHN001', 'coimbatore': 'CBE001', 'madurai': 'MDU001', 'trichy': 'TRY001', 'tiruchirappalli': 'TRY001',
          'salem': 'SLM001', 'thanjavur': 'TJV001', 'tanjore': 'TJV001', 'tirunelveli': 'TVL001', 'erode': 'ERD001',
          'vellore': 'VLR001', 'thoothukudi': 'TTK001', 'tuticorin': 'TTK001', 'dindigul': 'DGL001', 'tiruppur': 'TPR001',
          'nagercoil': 'NCL001', 'kumbakonam': 'KBK001', 'karur': 'KRR001', 'hosur': 'HSR001', 'pollachi': 'PLC001',
          'rajapalayam': 'RPM001', 'pudukkottai': 'PDK001', 'sivakasi': 'SVK001'
        };
        
        for (const [cityName, munId] of Object.entries(cityMap)) {
          if (city.toLowerCase().includes(cityName)) {
            const mun = Object.values(municipalityMap).find(m => m.id === munId) || municipalityMap['641'];
            return { municipalityId: munId, municipalityName: mun.name, pincode: detectedPincode || mun.defaultPin, detectionMethod: 'GPS + LocationIQ' };
          }
        }
        
        // Default to Coimbatore if not recognized
        return { municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: detectedPincode || '641001', detectionMethod: 'GPS + LocationIQ' };
      } catch (error) {
        console.error('LocationIQ API error:', error.message);
        return { municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: '641001', detectionMethod: 'Manual' };
      }
    };

    const municipalityInfo = await assignMunicipalityByGPS(parsedGeoLocation);
    issueData.municipalityId = municipalityInfo.municipalityId;
    issueData.municipalityName = municipalityInfo.municipalityName;
    issueData.pincode = municipalityInfo.pincode;
    issueData.detectionMethod = municipalityInfo.detectionMethod;

    const issue = new Issue(issueData);
    await issue.save();
    await issue.populate('reportedBy', 'name email');

    // Store user's location for future filtering
    if (parsedGeoLocation) {
      await User.findByIdAndUpdate(req.user._id, {
        lastKnownLocation: {
          latitude: parsedGeoLocation.latitude,
          longitude: parsedGeoLocation.longitude,
          timestamp: new Date(),
          source: 'issue_report'
        }
      });
    }

    // Notify corporation admin about new issue
    const { createNotification } = require('../lib/notificationService');
    console.log(`Issue created by: ${req.user.name} (${req.user.email})`);
    console.log(`Municipality assigned: ${issue.municipalityId} (${issue.municipalityName}) via ${issue.detectionMethod}`);
    console.log(`Detected pincode: ${issue.pincode}`);
    
    if (issue.municipalityId) {
      // Find corporation admin for this area
      const corporationAdmin = await User.findOne({ 
        role: 'corporation_admin', 
        municipalityId: issue.municipalityId 
      });
      
      if (corporationAdmin) {
        await createNotification(
          corporationAdmin._id,
          'New Issue in Your Area',
          `${req.user.name} reported: "${title}" in ${category} category at ${location}`,
          'new_issue'
        );
        console.log(`Notified corporation admin: ${corporationAdmin.municipalityName}`);
      }
    } else {
      // Fallback: notify all admins if no municipality detected
      const { notifyAdmins } = require('../lib/notificationService');
      await notifyAdmins(
        'New Issue Reported',
        `${req.user.name} reported: "${title}" in ${category} category`
      );
    }

    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete issue (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Delete image if it exists
    if (issue.image && fs.existsSync(issue.image)) {
      fs.unlinkSync(issue.image);
    }

    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update issue status (admin only) - Basic status update without image
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const updateData = { status, updatedAt: new Date() };
    if (assignedTo) updateData.assignedTo = assignedTo;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Create notification for user
    const { createNotification } = require('../lib/notificationService');
    const statusMessages = {
      pending: 'under review',
      in_progress: 'being worked on',
      resolved: 'completed and resolved'
    };
    
    await createNotification(
      issue.reportedBy._id,
      'Issue Status Update',
      `Your issue "${issue.title}" is now ${statusMessages[status] || status.replace('_', ' ')}`
    );

    res.json(issue);
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add feedback
router.post('/:id/feedback', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Update the issue with feedback
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        userFeedback: {
          rating,
          comment,
          submittedAt: new Date()
        }
      },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.status(201).json(issue.userFeedback);
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get feedback
router.get('/:id/feedback', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ issueId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update issue status with image upload (admin only)
router.patch('/:id/status-update', adminAuth, upload.single('statusImage'), async (req, res) => {
  try {
    console.log(`Admin ${req.user.name} updating issue ${req.params.id} to status: ${req.body.status}`);
    const { status, adminNotes } = req.body;
    const imagePath = req.file ? req.file.path : null;

    const updateData = { 
      status, 
      adminNotes,
      updatedAt: new Date(),
      updatedBy: req.user._id
    };

    // Add image path based on status
    if (status === 'in_progress' && imagePath) {
      updateData.inProgressImageUrl = imagePath;
    } else if (status === 'resolved' && imagePath) {
      updateData.rectifiedImage = imagePath;
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('reportedBy', 'name email fcmToken')
      .populate('assignedTo', 'name email')
      .populate('updatedBy', 'name');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    // Create notification for user
    const { createNotification } = require('../lib/notificationService');
    const statusMessages = {
      pending: 'under review',
      in_progress: 'being worked on',
      resolved: 'completed and resolved'
    };
    
    console.log(`Creating notification for user: ${issue.reportedBy.name} (${issue.reportedBy._id})`);
    console.log(`Issue "${issue.title}" status changed to: ${status}`);
    
    await createNotification(
      issue.reportedBy._id,
      'Issue Status Update',
      `Your issue "${issue.title}" is now ${statusMessages[status] || status.replace('_', ' ')}`,
      'status_update'
    );
    
    console.log('✅ Notification created successfully');

    // Send push notification
    if (issue.reportedBy.fcmToken) {
      const notificationData = {
        token: issue.reportedBy.fcmToken,
        notification: {
          title: 'Issue Status Updated',
          body: `Your issue "${issue.title}" is now ${status.replace('_', ' ')}`
        }
      };
      
      try {
        await fetch('http://localhost:5000/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notificationData)
        });
      } catch (notifError) {
        console.error('Notification send error:', notifError);
      }
    }

    res.json(issue);
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});





// Assign issue to field worker (Municipality Admin only)
router.patch('/:id/assign-worker', auth, async (req, res) => {
  try {
    if (req.user.role !== 'municipality_admin') {
      return res.status(403).json({ error: 'Municipality admin access required' });
    }

    const { fieldWorkerId } = req.body;
    
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { 
        fieldWorker: fieldWorkerId,
        status: 'assigned',
        assignedAt: new Date(),
        updatedBy: req.user._id
      },
      { new: true }
    )
      .populate('reportedBy', 'name email')
      .populate('fieldWorker', 'name email');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json(issue);
  } catch (error) {
    console.error('Assign worker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start work on issue (Field Worker only)
router.patch('/:id/start-work', auth, async (req, res) => {
  try {
    if (req.user.role !== 'field_worker') {
      return res.status(403).json({ error: 'Field worker access required' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'in_progress',
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json(issue);
  } catch (error) {
    console.error('Start work error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve issue (Field Worker only)
router.patch('/:id/resolve', auth, upload.array('resolutionImages'), async (req, res) => {
  try {
    if (req.user.role !== 'field_worker') {
      return res.status(403).json({ error: 'Field worker access required' });
    }

    const { resolutionNotes } = req.body;
    const resolutionImages = req.files ? req.files.map(file => file.path) : [];

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'resolved',
        resolutionNotes,
        resolutionImages,
        resolvedAt: new Date(),
        updatedBy: req.user._id
      },
      { new: true }
    ).populate('reportedBy', 'name email');

    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    res.json(issue);
  } catch (error) {
    console.error('Resolve issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stats (filtered by municipality for municipality admins)
router.get('/analytics/stats', auth, async (req, res) => {
  try {
    let filter = {};
    
    // Filter by municipality for corporation admins
    if (req.user.role === 'corporation_admin') {
      filter.municipalityId = req.user.municipalityId;
    }

    const totalIssues = await Issue.countDocuments(filter);
    const pendingIssues = await Issue.countDocuments({ ...filter, status: 'pending' });
    const inProgressIssues = await Issue.countDocuments({ ...filter, status: 'in_progress' });
    const resolvedIssues = await Issue.countDocuments({ ...filter, status: 'resolved' });

    const categoryStats = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const priorityStats = await Issue.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const recentIssues = await Issue.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalIssues,
      pendingIssues,
      inProgressIssues,
      resolvedIssues,
      categoryStats,
      priorityStats,
      recentIssues
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Auto-assign issue to nearest available field worker
router.patch('/:id/auto-assign', auth, async (req, res) => {
  try {
    if (req.user.role !== 'corporation_admin') {
      return res.status(403).json({ error: 'Corporation admin access required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Find available field workers in the same municipality with location enabled
    const availableWorkers = await User.find({
      role: 'field_worker',
      municipalityId: req.user.municipalityId,
      isActive: true,
      locationEnabled: true,
      'currentLocation.latitude': { $exists: true },
      'currentLocation.longitude': { $exists: true }
    });

    if (availableWorkers.length === 0) {
      return res.status(400).json({ error: 'No available field workers with location enabled' });
    }

    // Calculate distances and find nearest worker
    const issueLocation = issue.geoLocation;
    if (!issueLocation || !issueLocation.latitude || !issueLocation.longitude) {
      return res.status(400).json({ error: 'Issue location not available' });
    }

    let nearestWorker = null;
    let minDistance = Infinity;

    availableWorkers.forEach(worker => {
      const distance = calculateDistance(
        issueLocation.latitude,
        issueLocation.longitude,
        worker.currentLocation.latitude,
        worker.currentLocation.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestWorker = worker;
      }
    });

    // Assign issue to nearest worker
    issue.fieldWorker = nearestWorker._id;
    issue.status = 'assigned';
    issue.assignedAt = new Date();
    await issue.save();

    res.json({
      message: 'Issue auto-assigned successfully',
      assignedTo: {
        name: nearestWorker.name,
        specialization: nearestWorker.specialization,
        distance: `${minDistance.toFixed(2)} km`
      }
    });
  } catch (error) {
    console.error('Auto-assign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

module.exports = router;