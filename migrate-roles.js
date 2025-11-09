const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './server/.env' });

async function migrateRoles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('Starting role migration...');
    
    // Update system_admin to municipality_admin
    const result1 = await db.collection('users').updateMany(
      { role: 'system_admin' },
      { $set: { role: 'municipality_admin' } }
    );
    console.log(`Updated ${result1.modifiedCount} system_admin users to municipality_admin`);
    
    // Update municipality_admin to corporation_admin
    const result2 = await db.collection('users').updateMany(
      { role: 'municipality_admin' },
      { $set: { role: 'corporation_admin' } }
    );
    console.log(`Updated ${result2.modifiedCount} municipality_admin users to corporation_admin`);
    
    console.log('Role migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

migrateRoles();