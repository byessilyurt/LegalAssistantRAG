#!/bin/bash
# Script to fix Vercel deployment issues

echo "Fixing Vercel deployment issues..."

# Remove node_modules and package-lock.json
echo "Cleaning up old dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies with exact version
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Make sure react-scripts is installed
echo "Ensuring react-scripts is installed..."
npm install react-scripts@5.0.1 --save

echo "Done! Now try deploying to Vercel again."
echo "Use: vercel --prod" 