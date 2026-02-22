# 🚀 Complete Deployment Checklist

## ✅ Railway Backend Environment Variables

Go to Railway → Your Project → Variables → Add these:

```
MONGODB_URI = mongodb+srv://dharanishankar118:dharanishankar118@issuetracker.hqoer2d.mongodb.net/civic_issues_db?retryWrites=true&w=majority
JWT_SECRET = dharani@043
LOCATIONIQ_API_KEY = pk.f526e213a60e771ab60012038dea1247
NODE_ENV = production
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your_email@gmail.com
EMAIL_PASS = your_app_password
PORT = 5000
```

## ✅ Vercel Frontend Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables → Add these:

```
VITE_API_URL = https://aipoweredlocalissuesreportingapp-production.up.railway.app
VITE_FIREBASE_API_KEY = AIzaSyDp3LDZTM9Zy3k-xqCgRmmEEZKj4HXQ7po
VITE_FIREBASE_AUTH_DOMAIN = pushnotification-civic.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = pushnotification-civic
VITE_FIREBASE_STORAGE_BUCKET = pushnotification-civic.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 16419014370
VITE_FIREBASE_APP_ID = 1:16419014370:web:cfe97d704c4650ef2240bb
VITE_FIREBASE_MEASUREMENT_ID = G-3GGK9TCKJB
VITE_FIREBASE_VAPID_KEY = BPcHM74GWFerL5X0OzWDYYW57KGofH__9YYiUu52uTRJyV1iRI_vkc1nE5ZCVUbe0iEY04CpVKgtSJ9dPiY3kMk
VITE_LOCATIONIQ_API_KEY = pk.f526e213a60e771ab60012038dea1247
```

## 🔧 After Setting Variables

1. **Redeploy Railway** (should auto-deploy after git push)
2. **Redeploy Vercel** (Settings → Deployments → Redeploy)

## 🧪 Test After Deployment

1. **Backend Health:** https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/health
2. **Database Test:** https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/test/db
3. **Routes Check:** https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/debug/routes
4. **Frontend:** https://ai-powered-local-issues-reporting-a.vercel.app/

## 📝 Initialize Database

Visit these URLs in order:
1. https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/init/municipality-admin
2. https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/init/corporation-admins
3. https://aipoweredlocalissuesreportingapp-production.up.railway.app/api/init/field-workers

## 🔐 Test Login Credentials

**Municipality Admin:**
- Email: state.admin@tn.gov.in
- Password: admin123

**Corporation Admin (use Municipality Login page):**
- Email: admin@chennai.gov.in
- Password: chennai123
- Municipality ID: CHN001
- Pincode: 600001

**Field Worker:**
- Email: ravi.worker@chennai.gov.in
- Password: worker123

**Citizens:**
- Register new account on the website

## ✅ Current Status

- ✅ Code pushed to GitHub
- ✅ Railway connected to GitHub
- ✅ Vercel connected to GitHub
- ⏳ Waiting for Railway deployment with fixed Dockerfile
- ⏳ Need to verify all environment variables are set

## 🐛 If Still Not Working

Check Railway logs:
1. Go to Railway dashboard
2. Click on your project
3. Click "Deployments"
4. Click latest deployment
5. Check logs for errors

Common issues:
- Missing environment variables
- MongoDB connection timeout
- Port configuration
- Route loading errors