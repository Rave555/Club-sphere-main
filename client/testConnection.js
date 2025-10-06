/**
 * API Connection Tester
 * Run this script to verify your API connection is working
 * Usage: node testConnection.js
 */

const { getApiUrl, testApiConnection } = require('./config');

async function testConnection() {
  console.log('🔍 Testing API Connection...\n');
  
  const apiUrl = getApiUrl();
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`🌐 Base URL: ${apiUrl.replace('/api', '')}\n`);
  
  console.log('⏳ Testing connection...');
  
  try {
    const result = await testApiConnection();
    
    if (result.success) {
      console.log('✅ Connection successful!');
      console.log(`📊 Status: ${result.status}`);
      console.log('🎉 Your API is reachable and ready to use!');
    } else {
      console.log('❌ Connection failed!');
      console.log(`🚨 Error: ${result.error}\n`);
      
      console.log('🛠️  Troubleshooting suggestions:');
      result.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testConnection();