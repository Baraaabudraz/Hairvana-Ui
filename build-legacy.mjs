#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Legacy build script that avoids WebAssembly
async function buildLegacy() {
  console.log('🚀 Starting legacy build (avoiding WebAssembly)...');
  
  // Set legacy environment variables
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=256 --no-experimental-fetch --no-experimental-global-webcrypto';
  process.env.UV_THREADPOOL_SIZE = '1';
  
  try {
    // Step 1: Clean build directory
    console.log('🧹 Cleaning build directory...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
    }
    
    // Step 2: Create dist directory
    fs.mkdirSync('dist', { recursive: true });
    
    // Step 3: Copy public files
    console.log('📋 Copying public files...');
    if (fs.existsSync('public')) {
      fs.cpSync('public', 'dist', { recursive: true });
    }
    
    // Step 4: Create minimal HTML
    console.log('📄 Creating minimal HTML...');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hairvana Admin Dashboard</title>
    <link rel="stylesheet" href="/src/index.css">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`;
    
    fs.writeFileSync('dist/index.html', htmlContent);
    
    // Step 5: Copy source files for development
    console.log('📦 Copying source files...');
    if (fs.existsSync('src')) {
      fs.cpSync('src', 'dist/src', { recursive: true });
    }
    
    console.log('✅ Legacy build completed successfully!');
    console.log('📁 Output directory: dist/');
    console.log('⚠️ This is a development build. You can serve it with: npx serve dist');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildLegacy(); 