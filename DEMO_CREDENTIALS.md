# 🔐 Demo Credentials - Civic Issue Tracker

## 👤 **Citizens**
**Registration:** Create new account or use demo
- **Demo Account:** user@civic.com / User_123
- **Features:** Report issues, track status, provide feedback

## 🏢 **Corporation Admins**
**Login Requirements:** Email + Password + Municipality ID + Pincode

### Major Cities:
- **Chennai:** admin@chennai.gov.in / chennai123 / CHN001 / 600001
- **Coimbatore:** admin@coimbatore.gov.in / coimbatore123 / CBE001 / 641001
- **Madurai:** admin@madurai.gov.in / madurai123 / MDU001 / 625001
- **Trichy:** admin@trichy.gov.in / trichy123 / TRY001 / 620001
- **Salem:** admin@salem.gov.in / salem123 / SLM001 / 636001

### Additional Cities:
- **Thanjavur:** admin@thanjavur.gov.in / thanjavur123 / TJV001 / 613001
- **Tirunelveli:** admin@tirunelveli.gov.in / tirunelveli123 / TVL001 / 627001
- **Erode:** admin@erode.gov.in / erode123 / ERD001 / 638001
- **Vellore:** admin@vellore.gov.in / vellore123 / VLR001 / 632001
- **Thoothukudi:** admin@thoothukudi.gov.in / thoothukudi123 / TTK001 / 628001
- **Dindigul:** admin@dindigul.gov.in / dindigul123 / DGL001 / 624001
- **Tiruppur:** admin@tiruppur.gov.in / tiruppur123 / TPR001 / 641601
- **Nagercoil:** admin@nagercoil.gov.in / nagercoil123 / NCL001 / 629001
- **Kumbakonam:** admin@kumbakonam.gov.in / kumbakonam123 / KBK001 / 612001
- **Karur:** admin@karur.gov.in / karur123 / KRR001 / 639001
- **Hosur:** admin@hosur.gov.in / hosur123 / HSR001 / 635109
- **Ambur:** admin@ambur.gov.in / ambur123 / AMB001 / 635802
- **Pollachi:** admin@pollachi.gov.in / pollachi123 / PLC001 / 642001
- **Rajapalayam:** admin@rajapalayam.gov.in / rajapalayam123 / RPM001 / 626117
- **Pudukkottai:** admin@pudukkottai.gov.in / pudukkottai123 / PDK001 / 622001
- **Sivakasi:** admin@sivakasi.gov.in / sivakasi123 / SVK001 / 626123

**Features:** Manage area issues, assign field workers, view analytics for their municipality

## 👷 **Field Workers**
**Login Requirements:** Email + Password

### Chennai Workers:
- **Plumber:** ravi.worker@chennai.gov.in / worker123
- **Electrician:** suresh.electrician@chennai.gov.in / worker123
- **Roads:** murugan.roads@chennai.gov.in / worker123
- **Sanitation:** karthik.sanitation@chennai.gov.in / worker123

### Coimbatore Workers:
- **Plumber:** senthil.worker@coimbatore.gov.in / worker123
- **Electrician:** rajesh.electrician@coimbatore.gov.in / worker123
- **Roads:** vinod.roads@coimbatore.gov.in / worker123
- **Sanitation:** arun.sanitation@coimbatore.gov.in / worker123

### Madurai Workers:
- **Plumber:** prakash.worker@madurai.gov.in / worker123
- **Electrician:** ganesh.electrician@madurai.gov.in / worker123

**Features:** View assigned issues, update status, upload resolution photos

## 🏛️ **Municipality Admin**
**Login Requirements:** Email + Password
- **State Admin:** state.admin@tn.gov.in / admin123

**Features:** Multi-municipality oversight, create corporation admins, system-wide analytics

## 🔧 **Quick Test Flow**

### 1. **Citizen Journey:**
1. Register as citizen or use demo account
2. Report an issue with GPS location and photo
3. Track issue status updates

### 2. **Corporation Admin Journey:**
1. Login with any corporation admin credentials
2. View issues from your municipality only
3. Update issue status and assign to field workers
4. View analytics for your area

### 3. **Field Worker Journey:**
1. Login with field worker credentials
2. View assigned issues
3. Start work and update status
4. Upload resolution photos

### 4. **Municipality Admin Journey:**
1. Login with state admin credentials
2. View all issues across municipalities
3. Create new corporation admins
4. Access system-wide analytics

## 📱 **Mobile Testing**
- All roles work on mobile devices
- GPS location detection
- Camera integration for photos
- Push notifications (with Firebase setup)

## 🌐 **API Testing**
Base URL: `https://your-app.vercel.app/api`

### Initialize Database:
- GET `/api/auth/create-corporation-admins`
- GET `/api/auth/create-field-workers`

### Test Endpoints:
- POST `/api/auth/login`
- GET `/api/issues`
- POST `/api/issues` (with image upload)
- GET `/api/notifications`

## 🔐 **Security Notes**
- All passwords are hashed with bcrypt
- JWT tokens expire in 7 days
- Role-based access control implemented
- Municipality-specific data filtering
- Input validation and sanitization

## 📞 **Support**
If credentials don't work:
1. Ensure database is initialized
2. Check API endpoints are working
3. Verify environment variables
4. Check browser console for errors