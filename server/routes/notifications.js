const express = require('express');
const router = express.Router();
const { User, Notification } = require('../lib/database');
const { auth } = require('../middleware/auth');



// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    let notifications;
    
    if (req.user.role === 'admin') {
      // Admins see notifications about new issues reported by users
      notifications = await Notification.find({ 
        userId: req.user._id,
        type: 'new_issue'
      })
      .sort({ createdAt: -1 })
      .limit(50);
    } else {
      // Regular users see notifications about their issue status updates
      notifications = await Notification.find({ 
        userId: req.user._id,
        type: 'status_update'
      })
      .sort({ createdAt: -1 })
      .limit(50);
    }
    
    res.json(notifications || []);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send notification (internal use)
router.post('/send', async (req, res) => {
  try {
    const { token, notification } = req.body;
    console.log('Notification sent:', { token, notification });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;