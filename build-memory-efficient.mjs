#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Memory-efficient build script
async function buildMemoryEfficient() {
  console.log('🚀 Starting memory-efficient build...');
  
  // Set minimal memory usage
  process.env.NODE_ENV = 'production';
  process.env.NODE_OPTIONS = '--max-old-space-size=1024 --max-semi-space-size=32';
  
  try {
    // Step 1: TypeScript with minimal memory
    console.log('📝 Compiling TypeScript...');
    await runCommandWithRetry('npx', ['tsc', '--noEmitOnError', '--skipLibCheck'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1024' }
    });
    
    // Step 2: Vite build with ultra-low memory
    console.log('🔨 Building with Vite...');
    await runCommandWithRetry('npx', ['vite', 'build', '--config', 'vite.config.ultra-low.ts', '--mode', 'production'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=1024' }
    });
    
    console.log('✅ Memory-efficient build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function runCommandWithRetry(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const maxRetries = 3;
    let retryCount = 0;
    
    function attempt() {
      const child = spawn(command, args, {
        stdio: options.stdio || 'pipe',
        env: { ...process.env, ...options.env },
        cwd: process.cwd(),
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⚠️ Command failed, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(attempt, 2000); // Wait 2 seconds before retry
        } else {
          reject(new Error(`Command failed after ${maxRetries} retries with exit code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⚠️ Command error, retrying (${retryCount}/${maxRetries})...`);
          setTimeout(attempt, 2000);
        } else {
          reject(error);
        }
      });
    }
    
    attempt();
  });
}

// Run the build
buildMemoryEfficient(); 