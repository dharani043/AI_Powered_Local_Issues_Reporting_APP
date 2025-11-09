# 🔧 Field Worker Login & Features Guide

## 🚀 Quick Start for Field Workers

### 1. **Create Field Workers** (First Time Setup)
```bash
# Run this command to create sample field workers
node create-field-workers.js
```

### 2. **Field Worker Login Credentials**
- **Email**: `worker@chennai.gov.in`
- **Password**: `worker123`
- **Role**: Field Worker

**Other Available Field Workers:**
- `electrician@chennai.gov.in` - Electrical Specialist
- `roads@chennai.gov.in` - Road Maintenance
- `sanitation@chennai.gov.in` - Sanitation Specialist
- `worker@coimbatore.gov.in` - General Maintenance (Coimbatore)

### 3. **How to Login as Field Worker**

1. **Open the Application**: Go to `http://localhost:5173`
2. **Click Login**: Click the "Login" button in the header
3. **Enter Credentials**:
   - Email: `worker@chennai.gov.in`
   - Password: `worker123`
4. **Click Sign In**: You'll be redirected to the Field Worker Dashboard

## 🎯 Field Worker Features

### **Dashboard Overview**
- **Assigned Issues**: View all issues assigned to you
- **Work Status**: Track assigned, in-progress, and completed tasks
- **Statistics**: See your work performance metrics

### **Issue Management Workflow**

#### **1. View Assigned Issues**
- See all issues assigned by Municipality Admins
- View issue details: title, description, location, priority
- Check issue images and location information

#### **2. Start Work on Issues**
- Click "Start Work" button on assigned issues
- Status changes from "Assigned" → "In Progress"
- Issue becomes active in your work queue

#### **3. Complete & Resolve Issues**
- Click "Mark Resolved" when work is completed
- **Required**: Add resolution notes describing work done
- **Optional**: Upload before/after photos of completed work
- Status changes to "Resolved"

### **Resolution Process**
1. **Resolution Notes**: Describe what work was completed
2. **Upload Images**: Take photos showing the resolved issue
3. **Submit**: Mark the issue as resolved

## 🔄 Complete Workflow Example

### **Scenario**: Water Pipe Leak Repair

1. **Municipality Admin** assigns water leak issue to field worker
2. **Field Worker** logs in and sees assigned issue
3. **Field Worker** clicks "Start Work" (status: in_progress)
4. **Field Worker** goes to location and fixes the leak
5. **Field Worker** clicks "Mark Resolved"
6. **Field Worker** adds notes: "Replaced damaged pipe section, tested water flow"
7. **Field Worker** uploads photos of repaired pipe
8. **Field Worker** submits resolution (status: resolved)
9. **Citizen** receives notification that issue is resolved
10. **Citizen** can provide feedback on the resolution

## 📱 Field Worker Dashboard Features

### **Statistics Cards**
- **Assigned**: Number of new issues waiting to be started
- **In Progress**: Issues currently being worked on
- **Total Issues**: All active issues assigned to you

### **Issue Actions**
- **Start Work**: Begin working on an assigned issue
- **Mark Resolved**: Complete an issue with notes and photos
- **View Details**: See full issue information and location

### **Image Management**
- **View Issue Images**: See photos uploaded by citizens
- **Upload Resolution Images**: Add before/after photos
- **Image Preview**: Review uploaded images before submission

## 🔐 Access Control

### **Field Worker Permissions**
- ✅ View assigned issues only
- ✅ Update issue status (assigned → in_progress → resolved)
- ✅ Add resolution notes and images
- ✅ View issue location and details
- ❌ Cannot assign issues to other workers
- ❌ Cannot access admin functions
- ❌ Cannot view issues from other municipalities

### **Security Features**
- **Role-based Access**: Only field workers can access the dashboard
- **Municipality Filtering**: Workers only see issues from their municipality
- **Secure Authentication**: JWT token-based login system

## 🛠️ Technical Details

### **API Endpoints Used by Field Workers**
- `GET /api/issues` - Get assigned issues
- `PATCH /api/issues/:id/start-work` - Start working on issue
- `PATCH /api/issues/:id/resolve` - Mark issue as resolved

### **File Upload**
- **Resolution Images**: Uploaded to `server/uploads/` directory
- **Supported Formats**: JPG, PNG, WebP
- **Auto-compression**: Images optimized using Sharp.js

### **Database Updates**
- **Status Tracking**: Issue status updated in real-time
- **Assignment Tracking**: fieldWorker field links issues to workers
- **Resolution Data**: Notes and images stored with issue

## 🚨 Troubleshooting

### **Common Issues**

1. **Cannot Login**
   - Ensure field workers are created: `node create-field-workers.js`
   - Check credentials: `worker@chennai.gov.in` / `worker123`
   - Verify server is running on port 5000

2. **No Issues Visible**
   - Issues must be assigned by Municipality Admin first
   - Check if you're in the correct municipality
   - Verify your field worker account is active

3. **Cannot Upload Images**
   - Check file size (max 10MB)
   - Ensure supported format (JPG, PNG, WebP)
   - Verify server uploads directory exists

4. **Access Denied**
   - Ensure you're logged in as field_worker role
   - Check JWT token is valid
   - Verify account is active

### **Development Setup**
```bash
# Start MongoDB
mongod

# Start backend server
cd server
npm run dev

# Start frontend (new terminal)
npm run dev

# Create field workers (if not done)
node create-field-workers.js
```

## 📞 Support

For technical support:
1. Check server logs for errors
2. Verify database connection
3. Ensure all dependencies are installed
4. Check network connectivity to localhost:5000

---

**Ready to start working! 🔧**