# 🚂 Railway Deployment Guide

## 🚀 Deploy Backend to Railway

### 1. **Go to Railway**
- Visit [railway.app](https://railway.app)
- Sign up/Login with GitHub

### 2. **Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `dharani043/AI_Powered_Local_Issues_Reporting_APP`

### 3. **Configure Environment Variables**
Add these in Railway dashboard:

```
MONGODB_URI=mongodb+srv://dharanishankar118:dharanishankar118@issuetracker.hqoer2d.mongodb.net/civic_issues_db?retryWrites=true&w=majority
JWT_SECRET=dharani@043
LOCATIONIQ_API_KEY=pk.f526e213a60e771ab60012038dea1247
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PORT=5000
```

### 4. **Deploy**
- Railway will auto-deploy
- Get your backend URL: `https://your-app.railway.app`

### 5. **Update Frontend**
In Vercel, update environment variable:
```
VITE_API_URL=https://your-app.railway.app
```

### 6. **Initialize Database**
Visit these URLs after deployment:
- `https://your-app.railway.app/api/auth/create-corporation-admins`
- `https://your-app.railway.app/api/auth/create-field-workers`

## ✅ **Test Your App**
- **Frontend**: https://your-vercel-app.vercel.app
- **Backend**: https://your-app.railway.app
- **Health Check**: https://your-app.railway.app/api/health

Your full-stack app is now live! 🎉