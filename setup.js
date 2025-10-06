#!/usr/bin/env node

/**
 * Setup Helper Script for ClubSphere
 * This script helps users configure their development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  return results;
}

async function main() {
  console.log('🚀 ClubSphere Setup Helper\n');
  
  // Get IP addresses
  const ips = getLocalIP();
  console.log('📡 Available IP addresses:');
  ips.forEach((ip, index) => {
    console.log(`  ${index + 1}. ${ip}`);
  });
  console.log(`${ips.length + 1}. localhost (for emulator only)`);
  
  const choice = await question(`\nSelect IP for API connection (1-${ips.length + 1}): `);
  const selectedIP = choice <= ips.length ? ips[choice - 1] : 'localhost';
  
  console.log(`\n✅ Selected IP: ${selectedIP}`);
  
  // Update client config
  const configPath = path.join(__dirname, 'client', 'config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');
  
  configContent = configContent.replace(
    /API_BASE_URL: 'http:\/\/.*?:5000\/api'/,
    `API_BASE_URL: 'http://${selectedIP}:5000/api'`
  );
  
  fs.writeFileSync(configPath, configContent);
  console.log(`✅ Updated client configuration with ${selectedIP}`);
  
  // Check if .env exists in server
  const serverEnvPath = path.join(__dirname, 'server', '.env');
  if (!fs.existsSync(serverEnvPath)) {
    console.log('\n⚠️  Server .env file not found!');
    const createEnv = await question('Create a basic .env file? (y/N): ');
    
    if (createEnv.toLowerCase() === 'y') {
      const envContent = `MONGODB_URI=mongodb://localhost:27017/clubsphere
JWT_SECRET=your_jwt_secret_change_this_in_production
PORT=8000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=clubsphere
`;
      fs.writeFileSync(serverEnvPath, envContent);
      console.log('✅ Created server/.env file');
      console.log('⚠️  Please update the values in server/.env with your actual credentials');
    }
  }
  
  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update server/.env with your MongoDB and Cloudinary credentials');
  console.log('2. Start server: cd server && npm start');
  console.log('3. Start client: cd client && npm start');
  
  rl.close();
}

if (require.main === module) {
  main().catch(console.error);
}