const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import database models
const { User } = require('./server/lib/database');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'civic_issues_db',
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createMunicipalityAdmins = async () => {
  const municipalityAdmins = [
    {
      name: 'Tamil Nadu State Admin',
      email: 'state.admin@tn.gov.in',
      password: 'admin123',
      role: 'municipality_admin',
      municipalityId: 'TN001',
      municipalityName: 'Tamil Nadu State',
      pincode: '600001'
    }
  ];

  console.log('Creating Municipality Admins...');
  for (const admin of municipalityAdmins) {
    const existingAdmin = await User.findOne({ email: admin.email });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      
      const newAdmin = new User({
        ...admin,
        password: hashedPassword
      });
      
      await newAdmin.save();
      console.log(`✅ Created: ${admin.name}`);
    } else {
      console.log(`⚠️ Already exists: ${admin.name}`);
    }
  }
};

const createCorporationAdmins = async () => {
  const corporationAdmins = [
    // Major Corporations
    { name: 'Chennai Corporation Admin', email: 'admin@chennai.gov.in', password: 'chennai123', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation', pincode: '600001' },
    { name: 'Coimbatore Admin', email: 'admin@coimbatore.gov.in', password: 'coimbatore123', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation', pincode: '641001' },
    { name: 'Madurai Admin', email: 'admin@madurai.gov.in', password: 'madurai123', municipalityId: 'MDU001', municipalityName: 'Madurai Corporation', pincode: '625001' },
    { name: 'Trichy Admin', email: 'admin@trichy.gov.in', password: 'trichy123', municipalityId: 'TRY001', municipalityName: 'Trichy Corporation', pincode: '620001' },
    { name: 'Salem Admin', email: 'admin@salem.gov.in', password: 'salem123', municipalityId: 'SLM001', municipalityName: 'Salem Corporation', pincode: '636001' },
    { name: 'Thanjavur Admin', email: 'admin@thanjavur.gov.in', password: 'thanjavur123', municipalityId: 'TJV001', municipalityName: 'Thanjavur Municipality', pincode: '613001' },
    
    // Additional Districts
    { name: 'Tirunelveli Admin', email: 'admin@tirunelveli.gov.in', password: 'tirunelveli123', municipalityId: 'TVL001', municipalityName: 'Tirunelveli Corporation', pincode: '627001' },
    { name: 'Erode Admin', email: 'admin@erode.gov.in', password: 'erode123', municipalityId: 'ERD001', municipalityName: 'Erode Municipality', pincode: '638001' },
    { name: 'Vellore Admin', email: 'admin@vellore.gov.in', password: 'vellore123', municipalityId: 'VLR001', municipalityName: 'Vellore Corporation', pincode: '632001' },
    { name: 'Thoothukudi Admin', email: 'admin@thoothukudi.gov.in', password: 'thoothukudi123', municipalityId: 'TTK001', municipalityName: 'Thoothukudi Corporation', pincode: '628001' },
    { name: 'Dindigul Admin', email: 'admin@dindigul.gov.in', password: 'dindigul123', municipalityId: 'DGL001', municipalityName: 'Dindigul Municipality', pincode: '624001' },
    { name: 'Tiruppur Admin', email: 'admin@tiruppur.gov.in', password: 'tiruppur123', municipalityId: 'TPR001', municipalityName: 'Tiruppur Corporation', pincode: '641601' },
    { name: 'Nagercoil Admin', email: 'admin@nagercoil.gov.in', password: 'nagercoil123', municipalityId: 'NCL001', municipalityName: 'Nagercoil Municipality', pincode: '629001' },
    { name: 'Kumbakonam Admin', email: 'admin@kumbakonam.gov.in', password: 'kumbakonam123', municipalityId: 'KBK001', municipalityName: 'Kumbakonam Municipality', pincode: '612001' },
    { name: 'Karur Admin', email: 'admin@karur.gov.in', password: 'karur123', municipalityId: 'KRR001', municipalityName: 'Karur Municipality', pincode: '639001' },
    { name: 'Hosur Admin', email: 'admin@hosur.gov.in', password: 'hosur123', municipalityId: 'HSR001', municipalityName: 'Hosur Municipality', pincode: '635109' },
    { name: 'Ambur Admin', email: 'admin@ambur.gov.in', password: 'ambur123', municipalityId: 'AMB001', municipalityName: 'Ambur Municipality', pincode: '635802' },
    { name: 'Pollachi Admin', email: 'admin@pollachi.gov.in', password: 'pollachi123', municipalityId: 'PLC001', municipalityName: 'Pollachi Municipality', pincode: '642001' },
    { name: 'Rajapalayam Admin', email: 'admin@rajapalayam.gov.in', password: 'rajapalayam123', municipalityId: 'RPM001', municipalityName: 'Rajapalayam Municipality', pincode: '626117' },
    { name: 'Pudukkottai Admin', email: 'admin@pudukkottai.gov.in', password: 'pudukkottai123', municipalityId: 'PDK001', municipalityName: 'Pudukkottai Municipality', pincode: '622001' },
    { name: 'Sivakasi Admin', email: 'admin@sivakasi.gov.in', password: 'sivakasi123', municipalityId: 'SVK001', municipalityName: 'Sivakasi Municipality', pincode: '626123' }
  ];

  console.log('Creating Corporation Admins...');
  for (const admin of corporationAdmins) {
    const existingAdmin = await User.findOne({ email: admin.email });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      
      const newAdmin = new User({
        name: admin.name,
        email: admin.email,
        password: hashedPassword,
        role: 'corporation_admin',
        municipalityId: admin.municipalityId,
        municipalityName: admin.municipalityName,
        pincode: admin.pincode
      });
      
      await newAdmin.save();
      console.log(`✅ Created: ${admin.municipalityName}`);
    } else {
      console.log(`⚠️ Already exists: ${admin.municipalityName}`);
    }
  }
};

const createFieldWorkers = async () => {
  const fieldWorkers = [
    // Chennai Workers
    { name: 'Ravi Kumar', email: 'ravi.worker@chennai.gov.in', password: 'worker123', phone: '+91-9876543210', specialization: 'Plumbing', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' },
    { name: 'Suresh Babu', email: 'suresh.electrician@chennai.gov.in', password: 'worker123', phone: '+91-9876543211', specialization: 'Electrical', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' },
    { name: 'Murugan S', email: 'murugan.roads@chennai.gov.in', password: 'worker123', phone: '+91-9876543212', specialization: 'Road Maintenance', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' },
    { name: 'Karthik R', email: 'karthik.sanitation@chennai.gov.in', password: 'worker123', phone: '+91-9876543213', specialization: 'Sanitation', municipalityId: 'CHN001', municipalityName: 'Chennai Corporation' },
    
    // Coimbatore Workers
    { name: 'Senthil Kumar', email: 'senthil.worker@coimbatore.gov.in', password: 'worker123', phone: '+91-9876543220', specialization: 'Plumbing', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' },
    { name: 'Rajesh M', email: 'rajesh.electrician@coimbatore.gov.in', password: 'worker123', phone: '+91-9876543221', specialization: 'Electrical', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' },
    { name: 'Vinod P', email: 'vinod.roads@coimbatore.gov.in', password: 'worker123', phone: '+91-9876543222', specialization: 'Road Maintenance', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' },
    { name: 'Arun S', email: 'arun.sanitation@coimbatore.gov.in', password: 'worker123', phone: '+91-9876543223', specialization: 'Sanitation', municipalityId: 'CBE001', municipalityName: 'Coimbatore Corporation' },
    
    // Madurai Workers
    { name: 'Prakash R', email: 'prakash.worker@madurai.gov.in', password: 'worker123', phone: '+91-9876543230', specialization: 'Plumbing', municipalityId: 'MDU001', municipalityName: 'Madurai Corporation' },
    { name: 'Ganesh K', email: 'ganesh.electrician@madurai.gov.in', password: 'worker123', phone: '+91-9876543231', specialization: 'Electrical', municipalityId: 'MDU001', municipalityName: 'Madurai Corporation' }
  ];

  console.log('Creating Field Workers...');
  for (const worker of fieldWorkers) {
    const existingWorker = await User.findOne({ email: worker.email });
    
    if (!existingWorker) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(worker.password, salt);
      
      const newWorker = new User({
        name: worker.name,
        email: worker.email,
        password: hashedPassword,
        role: 'field_worker',
        phone: worker.phone,
        specialization: worker.specialization,
        municipalityId: worker.municipalityId,
        municipalityName: worker.municipalityName,
        isActive: true
      });
      
      await newWorker.save();
      console.log(`✅ Created: ${worker.name} (${worker.specialization})`);
    } else {
      console.log(`⚠️ Already exists: ${worker.name}`);
    }
  }
};

const main = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    await connectDB();
    
    await createMunicipalityAdmins();
    await createCorporationAdmins();
    await createFieldWorkers();
    
    console.log('✅ Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Municipality Admins: Created');
    console.log('- Corporation Admins: 21 municipalities');
    console.log('- Field Workers: Multiple specializations');
    console.log('\n🔐 Default Credentials:');
    console.log('Municipality Admin: state.admin@tn.gov.in / admin123');
    console.log('Corporation Admin: admin@[city].gov.in / [city]123');
    console.log('Field Worker: [name].worker@[city].gov.in / worker123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
};

main();