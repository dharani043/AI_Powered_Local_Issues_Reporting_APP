const express = require('express');
const { Feedback } = require('../lib/database'); // ✅ import your model
const { auth } = require('../middleware/auth');   // optional, for logged-in users
const router = express.Router();

// Submit feedback (requires user to be logged in)
router.post('/', auth, async (req, res) => {
  try {
    const { issueId, rating, comment } = req.body;

    // req.user is populated by the auth middleware
    const userId = req.user._id;

    const feedback = new Feedback({
      issueId,
      userId,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
