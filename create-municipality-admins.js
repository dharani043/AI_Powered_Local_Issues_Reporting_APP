const axios = require('axios');

async function createMunicipalityAdmins() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/create-municipality-admins');
    console.log('✅ Municipality admins created:', response.data);
  } catch (error) {
    console.error('❌ Error creating municipality admins:', error.response?.data || error.message);
  }
}

createMunicipalityAdmins();