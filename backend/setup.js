#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up CodeEditor Pro Backend...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeeditor
REDIS_URL=redis://localhost:6379`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
const npmInstall = spawn('npm', ['install', '--legacy-peer-deps'], {
  stdio: 'inherit',
  shell: true
});

npmInstall.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Dependencies installed successfully!');
    console.log('\n🎯 Next steps:');
    console.log('1. Make sure MongoDB is running on localhost:27017 (optional)');
    console.log('2. Make sure Redis is running on localhost:6379 (optional)');
    console.log('3. Run: npm start');
    console.log('4. Visit: http://localhost:5000/health');
  } else {
    console.log('\n❌ Failed to install dependencies');
    process.exit(1);
  }
});
