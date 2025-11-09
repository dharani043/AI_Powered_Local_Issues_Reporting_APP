const express = require('express');
const router = express.Router();
const { sendNotification, sendOTP, verifyOTP } = require('../lib/emailService');

// 📩 Send General Notification Email
router.post('/send-notification', async (req, res) => {
  const { email, message } = req.body;
  const result = await sendNotification(email, message);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const result = await sendOTP(email);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const result = verifyOTP(email, otp);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(400).json(result);
  }
});

module.exports = router;