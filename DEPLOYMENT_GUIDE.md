# 🚀 Deployment Guide - Civic Issue Tracker

## 📋 Pre-Deployment Checklist

### ✅ **Environment Variables Setup**
Create these environment variables in Vercel:

**Frontend (.env):**
```
VITE_API_URL=https://your-app.vercel.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key
```

**Backend (Vercel Environment Variables):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic_issues_db
JWT_SECRET=your_super_secure_jwt_secret_key_here
LOCATIONIQ_API_KEY=your_locationiq_api_key
FIREBASE_SERVER_KEY=your_firebase_server_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=production
```

## 🔧 **GitHub Setup**

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Civic Issue Tracker"
```

### 2. Create GitHub Repository
- Go to GitHub.com
- Click "New Repository"
- Name: `civic-issue-tracker`
- Description: `Smart Municipal Management System`
- Make it Public
- Don't initialize with README (we already have one)

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/civic-issue-tracker.git
git branch -M main
git push -u origin main
```

## 🌐 **Vercel Deployment**

### 1. Connect GitHub to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign up/Login with GitHub
- Click "New Project"
- Import your `civic-issue-tracker` repository

### 2. Configure Build Settings
- **Framework Preset:** Vite
- **Root Directory:** `./` (leave empty)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```
MONGODB_URI = mongodb+srv://your-connection-string
JWT_SECRET = your-jwt-secret
LOCATIONIQ_API_KEY = your-locationiq-key
FIREBASE_SERVER_KEY = your-firebase-key
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
NODE_ENV = production
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Your app will be available at `https://your-app.vercel.app`

## 🗄️ **Database Setup**

### 1. MongoDB Atlas
- Create account at [mongodb.com](https://mongodb.com)
- Create new cluster
- Get connection string
- Add to Vercel environment variables

### 2. Initialize Database
After deployment, visit:
```
https://your-app.vercel.app/api/auth/create-corporation-admins
https://your-app.vercel.app/api/auth/create-field-workers
```

## 🔥 **Firebase Setup**

### 1. Create Firebase Project
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Create new project
- Enable Cloud Messaging

### 2. Get Configuration
- Project Settings → General → Web apps
- Copy config values to Vercel environment variables

### 3. Service Worker
- Upload `firebase-messaging-sw.js` to public folder
- Configure VAPID key in Firebase → Cloud Messaging

## 📧 **Email Service Setup**

### 1. Gmail App Password
- Enable 2FA on Gmail
- Generate App Password
- Use in EMAIL_PASS environment variable

### 2. Alternative: SendGrid
- Create SendGrid account
- Get API key
- Update emailService.js to use SendGrid

## 🗺️ **LocationIQ Setup**

### 1. Get API Key
- Sign up at [locationiq.com](https://locationiq.com)
- Get free API key (60,000 requests/month)
- Add to environment variables

## 🧪 **Testing Deployment**

### 1. Test Login Credentials
**Citizens:**
- Register new account or use demo

**Corporation Admins:**
- Chennai: admin@chennai.gov.in / CHN001 / 600001 / chennai123
- Coimbatore: admin@coimbatore.gov.in / CBE001 / 641001 / coimbatore123

**Field Workers:**
- Plumber: ravi.worker@chennai.gov.in / worker123
- Electrician: suresh.electrician@chennai.gov.in / worker123

**Municipality Admin:**
- State Admin: state.admin@tn.gov.in / admin123

### 2. Test Features
- ✅ User registration/login
- ✅ Issue reporting with GPS
- ✅ Image upload
- ✅ Admin dashboards
- ✅ Notifications
- ✅ Analytics

## 🔧 **Troubleshooting**

### Common Issues:

**1. Build Fails:**
- Check package.json scripts
- Ensure all dependencies are listed
- Check for TypeScript errors

**2. API Routes Not Working:**
- Verify vercel.json configuration
- Check environment variables
- Ensure MongoDB connection

**3. Images Not Uploading:**
- Vercel has file size limits
- Consider using Cloudinary for images
- Check multer configuration

**4. Firebase Not Working:**
- Verify all Firebase config variables
- Check service worker registration
- Ensure VAPID key is correct

## 📱 **Mobile Optimization**

The app is already mobile-responsive with:
- ✅ Touch-friendly interface
- ✅ GPS location access
- ✅ Camera integration
- ✅ Push notifications
- ✅ Offline-ready service worker

## 🔒 **Security Checklist**

- ✅ Environment variables secured
- ✅ JWT tokens with expiration
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ File upload restrictions
- ✅ CORS configuration
- ✅ Rate limiting (add if needed)

## 📊 **Monitoring**

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor API response times

## 🚀 **Post-Deployment**

1. **Test all user roles and features**
2. **Set up monitoring and alerts**
3. **Configure custom domain (optional)**
4. **Set up backup strategy for MongoDB**
5. **Document API endpoints**
6. **Create user guides for each role**

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check browser console for errors

Your Civic Issue Tracker is now ready for production! 🎉