const mongoose = require('mongoose');

// ===== USER SCHEMA =====

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'municipality_admin', 'corporation_admin', 'field_worker'], default: 'user' },
  municipalityId: { type: String },
  municipalityName: { type: String },
  pincode: { type: String },
  phone: { type: String },
  specialization: { type: String },
  isActive: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  otpEnabled: { type: Boolean, default: false },
  fcmToken: { type: String },
  lastKnownLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    timestamp: { type: Date },
    source: { type: String, enum: ['device', 'issue_report'], default: 'device' }
  },
  locationEnabled: { type: Boolean, default: false },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    accuracy: { type: Number },
    timestamp: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});


// ===== ISSUE SCHEMA =====
const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'assigned', 'in_progress', 'resolved', 'escalated'], default: 'open' },
  location: { type: String, required: true },
  municipalityId: { type: String },
  municipalityName: { type: String },
  pincode: { type: String },
  detectionMethod: { type: String, enum: ['GPS', 'Location Text', 'Manual', 'Default', 'GPS + LocationIQ', 'API Error - Default', 'Auto-Assignment'], default: 'Manual' },
  geoLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    source: { type: String, enum: ['exif', 'manual', 'device'], default: 'manual' },
    accuracy: { type: Number },
    timestamp: { type: Date }
  },
  image: { type: String },
  inProgressImageUrl: { type: String },
  rectifiedImage: { type: String },
  adminNotes: { type: String },
  userFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date }
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Municipality Admin
  fieldWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Field Worker
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: { type: Date },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ===== FEEDBACK SCHEMA =====
const feedbackSchema = new mongoose.Schema({
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  name: String,
  email: String,
  message: String,
  category: String,
  createdAt: { type: Date, default: Date.now }
});

// ===== NOTIFICATION SCHEMA =====
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['status_update', 'new_issue', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});


// ===== EXPORT MODELS =====
const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { User, Issue, Feedback, Notification };
