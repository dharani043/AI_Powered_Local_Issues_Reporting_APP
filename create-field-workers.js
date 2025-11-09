const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './server/.env' });

// Import User model
const { User } = require('./server/lib/database');

const createFieldWorkers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic_issue_tracker');
    console.log('Connected to MongoDB');

    const fieldWorkers = [
      {
        name: 'Ravi Kumar',
        email: 'worker@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543210',
        specialization: 'Plumbing',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Suresh Babu',
        email: 'electrician@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543211',
        specialization: 'Electrical',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Murugan S',
        email: 'roads@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543212',
        specialization: 'Road Maintenance',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Karthik R',
        email: 'sanitation@chennai.gov.in',
        password: 'worker123',
        phone: '+91-9876543213',
        specialization: 'Sanitation',
        municipalityId: 'CHN001',
        municipalityName: 'Chennai Corporation'
      },
      {
        name: 'Prakash M',
        email: 'worker@coimbatore.gov.in',
        password: 'worker123',
        phone: '+91-9876543214',
        specialization: 'General Maintenance',
        municipalityId: 'CBE001',
        municipalityName: 'Coimbatore Corporation'
      }
    ];

    const created = [];
    const existing = [];

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
        created.push({
          name: worker.name,
          email: worker.email,
          specialization: worker.specialization,
          municipality: worker.municipalityName
        });
      } else {
        existing.push(worker.name);
      }
    }

    console.log('\n=== Field Worker Creation Results ===');
    console.log(`Created: ${created.length} field workers`);
    console.log(`Already existing: ${existing.length} field workers`);
    
    if (created.length > 0) {
      console.log('\n=== Created Field Workers ===');
      created.forEach(worker => {
        console.log(`- ${worker.name} (${worker.email}) - ${worker.specialization} - ${worker.municipality}`);
      });
    }
    
    if (existing.length > 0) {
      console.log('\n=== Already Existing ===');
      existing.forEach(name => console.log(`- ${name}`));
    }

    console.log('\n=== Login Credentials ===');
    console.log('Email: worker@chennai.gov.in');
    console.log('Password: worker123');
    console.log('\nOther workers use the same password: worker123');

  } catch (error) {
    console.error('Error creating field workers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

createFieldWorkers();