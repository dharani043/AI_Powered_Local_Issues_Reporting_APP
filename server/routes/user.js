const express = require('express');
const router = express.Router();
const { User } = require('../lib/database'); // Update path accordingly
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware to get user from token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = await User.findById(decoded.userId || decoded.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  const { name, email } = req.body;
  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json({ message: 'Profile updated' });
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const isMatch = await bcrypt.compare(currentPassword, req.user.password);
  if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  res.json({ message: 'Password changed' });
});

// Update email notification preference
router.patch('/preferences', authenticate, async (req, res) => {
  const { emailNotifications } = req.body;
  req.user.emailNotifications = emailNotifications;
  await req.user.save();
  res.json({ message: 'Preferences updated' });
});

// Enable/disable OTP
router.patch('/security', authenticate, async (req, res) => {
  const { otpEnabled } = req.body;
  req.user.otpEnabled = otpEnabled;
  await req.user.save();
  res.json({ message: 'Security updated' });
});

// Update FCM token
router.post('/fcm-token', authenticate, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
    
    req.user.fcmToken = fcmToken;
    await req.user.save();
    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('FCM token update error:', error);
    res.status(500).json({ error: 'Failed to update FCM token' });
  }
});

// Update user location
router.post('/location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    req.user.lastKnownLocation = {
      latitude,
      longitude,
      timestamp: new Date(),
      source: 'device'
    };
    await req.user.save();
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

module.exports = router;
