#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory-optimized build script for server environments
async function buildServer() {
  console.log('🚀 Starting server-optimized build...');
  
  // Set environment variables for memory optimization
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  
  try {
    // Step 1: TypeScript compilation
    console.log('📝 Compiling TypeScript...');
    await runCommand('npx', ['tsc'], { stdio: 'inherit' });
    
    // Step 2: Vite build with server config
    console.log('🔨 Building with Vite...');
    await runCommand('npx', ['vite', 'build', '--config', 'vite.config.server.ts'], { stdio: 'inherit' });
    
    console.log('✅ Server build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio || 'pipe',
      env: { ...process.env, ...options.env },
      cwd: process.cwd(),
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Run the build
buildServer(); 