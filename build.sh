#!/bin/bash

# Memory-optimized build script for Linux servers
echo "🚀 Starting memory-optimized build..."

# Set environment variables
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Step 1: TypeScript compilation
echo "📝 Compiling TypeScript..."
npx tsc

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Step 2: Vite build
echo "🔨 Building with Vite..."
npx vite build --config vite.config.server.ts

if [ $? -ne 0 ]; then
    echo "❌ Vite build failed"
    exit 1
fi

echo "✅ Build completed successfully!" 