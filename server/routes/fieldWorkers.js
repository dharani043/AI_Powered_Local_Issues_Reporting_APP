const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../lib/database');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get field workers (Municipality Admin only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'municipality_admin') {
      return res.status(403).json({ error: 'Municipality admin access required' });
    }

    const workers = await User.find({
      role: 'field_worker',
      municipalityId: req.user.municipalityId
    }).select('-password');

    res.json(workers);
  } catch (error) {
    console.error('Get field workers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create field worker (Municipality Admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'municipality_admin') {
      return res.status(403).json({ error: 'Municipality admin access required' });
    }

    const { name, email, phone, specialization, municipalityId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Generate default password
    const defaultPassword = 'worker123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const worker = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'field_worker',
      municipalityId: municipalityId || req.user.municipalityId,
      municipalityName: req.user.municipalityName,
      specialization,
      isActive: true
    });

    await worker.save();

    res.status(201).json({
      message: 'Field worker created successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        specialization: worker.specialization,
        isActive: worker.isActive
      },
      defaultPassword
    });
  } catch (error) {
    console.error('Create field worker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update field worker status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'municipality_admin') {
      return res.status(403).json({ error: 'Municipality admin access required' });
    }

    const { isActive } = req.body;
    
    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!worker) {
      return res.status(404).json({ error: 'Field worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Update field worker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password (Field Worker only)
router.patch('/change-password', auth, async (req, res) => {
  try {
    if (req.user.role !== 'field_worker') {
      return res.status(403).json({ error: 'Field worker access required' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // Fetch user with password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update field worker location
router.patch('/update-location', auth, async (req, res) => {
  try {
    if (req.user.role !== 'field_worker') {
      return res.status(403).json({ error: 'Field worker access required' });
    }

    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        latitude,
        longitude,
        accuracy,
        timestamp: new Date()
      },
      locationEnabled: true
    });

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle location sharing
router.patch('/toggle-location', auth, async (req, res) => {
  try {
    if (req.user.role !== 'field_worker') {
      return res.status(403).json({ error: 'Field worker access required' });
    }

    const { enabled } = req.body;
    
    await User.findByIdAndUpdate(req.user._id, {
      locationEnabled: enabled,
      ...(enabled ? {} : { currentLocation: null })
    });

    res.json({ message: `Location sharing ${enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Toggle location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;