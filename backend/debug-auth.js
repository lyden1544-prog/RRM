/**
 * Debug Registration Issue
 * Run: node debug-auth.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('🔍 Debugging Registration...\n');

  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email: `debug${Date.now()}@test.com`,
      password: 'Test123!',
      full_name: 'Debug User',
      company_name: 'Debug Co'
    });

    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Registration failed!');
    
    if (error.response) {
      console.log('\n📋 Error Details:');
      console.log('Status:', error.response.status);
      console.log('Status Text:', error.response.statusText);
      console.log('\nResponse Data:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('\n❌ No response from server');
      console.log('Is your server running? Check: npm start');
    } else {
      console.log('\n❌ Error:', error.message);
    }
  }

  console.log('\n📝 Next Steps:');
  console.log('1. Check server logs in the terminal where you ran "npm start"');
  console.log('2. Look for error messages in backend/logs/error.log');
  console.log('3. Share the error with me so I can fix it');
}

testRegistration();