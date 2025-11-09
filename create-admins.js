const axios = require('axios');

async function createAdmins() {
  try {
    console.log('Creating municipality admins...');
    const response = await axios.post('http://localhost:5000/api/auth/create-municipality-admins');
    console.log('✅ Success:', response.data);
  } catch (error) {
    if (error.response?.data?.error?.includes('duplicate key')) {
      console.log('✅ Municipality admins already exist');
    } else {
      console.error('❌ Error:', error.response?.data || error.message);
    }
  }
}

createAdmins();