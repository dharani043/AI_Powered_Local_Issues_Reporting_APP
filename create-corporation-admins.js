const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'municipality_admin', 'corporation_admin'], default: 'user' },
  municipalityId: { type: String },
  municipalityName: { type: String },
  pincode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createCorporationAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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

    const created = [];
    const existing = [];
    
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
        created.push({
          name: admin.municipalityName,
          email: admin.email,
          municipalityId: admin.municipalityId,
          pincode: admin.pincode
        });
      } else {
        existing.push(admin.municipalityName);
      }
    }

    console.log(`\n✅ Corporation admin creation completed!`);
    console.log(`📊 Created: ${created.length} new admins`);
    console.log(`📊 Existing: ${existing.length} admins already existed`);
    
    if (created.length > 0) {
      console.log('\n🆕 Newly created corporation admins:');
      created.forEach(admin => {
        console.log(`   • ${admin.name} (${admin.municipalityId}) - ${admin.email}`);
      });
    }
    
    if (existing.length > 0) {
      console.log('\n📋 Already existing:');
      existing.forEach(name => console.log(`   • ${name}`));
    }

  } catch (error) {
    console.error('❌ Error creating corporation admins:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createCorporationAdmins();