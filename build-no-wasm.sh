#!/bin/bash

# WebAssembly-free build script for 2GB RAM servers
echo "🚀 Starting WebAssembly-free build..."

# Set environment variables to avoid WebAssembly
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=512 --no-experimental-fetch"
export UV_THREADPOOL_SIZE=1

# Disable WebAssembly features
export NODE_NO_WASM=1

# Function to check if command succeeded
check_status() {
    if [ $? -ne 0 ]; then
        echo "❌ Step failed: $1"
        exit 1
    fi
    echo "✅ $1 completed successfully"
}

# Step 1: Clean everything
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vite
check_status "Clean"

# Step 2: TypeScript compilation with minimal features
echo "📝 Compiling TypeScript..."
npx tsc --noEmitOnError --skipLibCheck --noResolve --noEmit
check_status "TypeScript compilation"

# Step 3: Simple Vite build without optimizations
echo "🔨 Building with minimal Vite..."
npx vite build --config vite.config.no-wasm.ts --mode production --force
check_status "Vite build"

# Step 4: Verify build output
echo "🔍 Verifying build output..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build verification passed"
    echo "📦 Build completed successfully!"
    echo "📁 Output directory: dist/"
    ls -la dist/
else
    echo "❌ Build verification failed - dist directory not found"
    exit 1
fi 