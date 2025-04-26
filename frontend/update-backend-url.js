#!/usr/bin/env node
/**
 * This script updates the backend URL in the frontend code
 * Run it after deploying the backend to Cloud Run
 * 
 * Usage: node update-backend-url.js YOUR_CLOUD_RUN_URL
 */

const fs = require('fs');
const path = require('path');

// Get the Cloud Run URL from command line args
const backendUrl = process.argv[2];

if (!backendUrl) {
  console.error('Please provide the Cloud Run URL as an argument');
  console.error('Example: node update-backend-url.js https://pl-foreigners-legal-api-abcdef123-uc.a.run.app');
  process.exit(1);
}

// Validate URL format
if (!backendUrl.startsWith('https://')) {
  console.error('URL must start with https://');
  process.exit(1);
}

// Path to the API client file
const apiFilePath = path.join(__dirname, 'src', 'api', 'chatApi.js');

// Read the file
let content;
try {
  content = fs.readFileSync(apiFilePath, 'utf8');
} catch (error) {
  console.error(`Error reading file ${apiFilePath}:`, error);
  process.exit(1);
}

// Update the API_BASE_URL constant
const updatedContent = content.replace(
  /const API_BASE_URL = .*?;/,
  `const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '${backendUrl}';`
);

// Write the updated content back to the file
try {
  fs.writeFileSync(apiFilePath, updatedContent, 'utf8');
  console.log(`Updated API_BASE_URL in ${apiFilePath} to ${backendUrl}`);
} catch (error) {
  console.error(`Error writing to file ${apiFilePath}:`, error);
  process.exit(1);
}

// Create or update .env.local file with the Backend URL
try {
  const envFilePath = path.join(__dirname, '.env.local');
  fs.writeFileSync(envFilePath, `REACT_APP_API_BASE_URL=${backendUrl}\n`, 'utf8');
  console.log(`Updated REACT_APP_API_BASE_URL in .env.local to ${backendUrl}`);
} catch (error) {
  console.error(`Error writing to .env.local: ${error}`);
  console.log('Please manually create a .env.local file with REACT_APP_API_BASE_URL set to your backend URL');
}

console.log('Backend URL updated successfully!');
console.log('Remember to rebuild and redeploy your frontend to Vercel:');
console.log('  npm run build');
console.log('  vercel --prod'); 