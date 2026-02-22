const nodemailer = require("nodemailer");

// Store OTPs in memory (for MVP only, use DB in production)
let otpStore = {};

// Setup Nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 📩 Send General Notification Email
const sendNotification = async (email, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Notification from Civic Issue Tracker",
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">Civic Issue Tracker Notification</h2>
        <p>${message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated message from Civic Issue Tracker.</p>
      </div>`,
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
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code - Civic Issue Tracker",
      text: `Your One-Time Password is: ${otp}\n\nThis code will expire in 5 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Your OTP Code</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">Your One-Time Password is:</p>
          <div style="background-color: #eff6ff; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #1d4ed8; letter-spacing: 4px;">${otp}</span>
          </div>
          <p style="color: #dc2626; font-weight: 500;">This code will expire in 5 minutes.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Civic Issue Tracker. Do not share this OTP with anyone.</p>
        </div>
      </div>`,
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

// 📧 Send Issue Status Update Email
const sendIssueStatusUpdate = async (email, userName, issueTitle, status, adminNotes = '') => {
  try {
    const statusMessages = {
      pending: { text: 'under review', color: '#f59e0b' },
      in_progress: { text: 'being worked on', color: '#3b82f6' },
      resolved: { text: 'completed and resolved', color: '#10b981' }
    };
    
    const statusInfo = statusMessages[status] || { text: status, color: '#6b7280' };
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Issue Status Update - ${issueTitle}`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Issue Status Update</h2>
          <p style="font-size: 16px;">Dear ${userName},</p>
          <p style="margin: 20px 0;">Your reported issue has been updated:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">${issueTitle}</h3>
            <p style="margin: 10px 0;">Status: <span style="color: ${statusInfo.color}; font-weight: bold;">${statusInfo.text.toUpperCase()}</span></p>
            ${adminNotes ? `<p style="margin: 10px 0;"><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
          </div>
          
          <p style="margin: 20px 0;">Thank you for using Civic Issue Tracker to make your community better!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Civic Issue Tracker.</p>
        </div>
      </div>`,
    });
    return { success: true, msg: "Status update email sent!" };
  } catch (err) {
    console.error("❌ Status update email error:", err);
    return { success: false, msg: "Failed to send status update email" };
  }
};

module.exports = {
  sendNotification,
  sendOTP,
  verifyOTP,
  sendIssueStatusUpdate
};