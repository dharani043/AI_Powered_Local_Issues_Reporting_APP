const { Notification, User } = require('./database');

const createNotification = async (userId, title, message, type = 'system') => {
  try {
    console.log(`ℹ️ Creating notification for userId: ${userId}`);
    console.log(`ℹ️ Title: ${title}`);
    console.log(`ℹ️ Message: ${message}`);
    console.log(`ℹ️ Type: ${type}`);
    
    const notification = new Notification({
      userId,
      title,
      message,
      type
    });
    await notification.save();
    console.log(`✅ Notification saved to database with ID: ${notification._id}`);
    
    // Get user's FCM token for push notification
    const user = await User.findById(userId);
    if (user && user.fcmToken) {
      console.log(`🔔 Push notification sent to ${user.name}: ${title} - ${message}`);
    } else {
      console.log(`⚠️ No FCM token for user ${user?.name || userId}`);
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Notification creation error:', error);
  }
};

const notifyAdmins = async (title, message) => {
  try {
    const admins = await User.find({ role: 'admin' });
    console.log(`Found ${admins.length} admins to notify`);
    for (const admin of admins) {
      await createNotification(admin._id, title, message, 'new_issue');
    }
  } catch (error) {
    console.error('Admin notification error:', error);
  }
};

module.exports = { createNotification, notifyAdmins };