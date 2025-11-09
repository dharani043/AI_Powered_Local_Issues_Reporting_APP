const nodemailer = require("nodemailer");

// Store OTPs in memory (for MVP only, use DB in production)
let otpStore = {};

// Setup Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "ctmrtuhqtkjegbqu",
  },
});

// 📩 Send General Notification Email
const sendNotification = async (email, message) => {
  try {
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Notification from Issue Tracker",
      text: message,
    });
    return { success: true, msg: "Notification email sent!" };
  } catch (err) {
    console.error("❌ Email error:", err);
    return { success: false, msg: "Failed to send email" };
  }
};

// 🔐 Send OTP
const sendOTP = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await transporter.sendMail({
      from: "your-email@gmail.com",
      to: email,
      subject: "Your OTP Code - Issue Tracker",
      text: `Your One-Time Password is: ${otp}\n\nThis code will expire in 5 minutes.`,
    });
    return { success: true, msg: "OTP sent to email" };
  } catch (err) {
    console.error("❌ OTP send error:", err);
    return { success: false, msg: "Failed to send OTP" };
  }
};

// 🔐 Verify OTP
const verifyOTP = (email, otp) => {
  const record = otpStore[email];

  if (!record) {
    return { success: false, msg: "No OTP found. Request again." };
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return { success: false, msg: "OTP expired. Request new OTP." };
  }

  if (record.otp === otp) {
    delete otpStore[email];
    return { success: true, msg: "OTP verified successfully!" };
  }

  return { success: false, msg: "Invalid OTP" };
};

module.exports = {
  sendNotification,
  sendOTP,
  verifyOTP
};