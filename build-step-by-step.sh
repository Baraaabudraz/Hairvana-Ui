#!/bin/bash

# Step-by-step build script for ultra-low memory servers
echo "🚀 Starting step-by-step build for low memory server..."

# Set environment variables for minimal memory usage
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=1024 --max-semi-space-size=32"

# Function to check if command succeeded
check_status() {
    if [ $? -ne 0 ]; then
        echo "❌ Step failed: $1"
        exit 1
    fi
    echo "✅ $1 completed successfully"
}

# Step 1: Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf node_modules/.vite
check_status "Clean"

# Step 2: TypeScript compilation with minimal memory
echo "📝 Compiling TypeScript (Step 1/3)..."
npx tsc --noEmitOnError --skipLibCheck
check_status "TypeScript compilation"

# Step 3: Vite build with ultra-low memory config
echo "🔨 Building with Vite (Step 2/3)..."
npx vite build --config vite.config.ultra-low.ts --mode production
check_status "Vite build"

# Step 4: Verify build output
echo "🔍 Verifying build output (Step 3/3)..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build verification passed"
    echo "📦 Build completed successfully!"
    echo "📁 Output directory: dist/"
    ls -la dist/
else
    echo "❌ Build verification failed - dist directory not found"
    exit 1
fi 