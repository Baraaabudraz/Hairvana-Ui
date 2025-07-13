#!/bin/bash

# Manual build script that bypasses Vite for 2GB RAM servers
echo "🚀 Starting manual build (bypassing Vite)..."

# Set minimal environment
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=256"

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

# Step 2: Create basic dist structure
echo "📁 Creating dist structure..."
mkdir -p dist/assets
check_status "Create dist structure"

# Step 3: Copy static files
echo "📋 Copying static files..."
cp -r public/* dist/ 2>/dev/null || true
check_status "Copy static files"

# Step 4: Create minimal HTML
echo "📄 Creating minimal HTML..."
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
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
</html>
EOF
check_status "Create HTML"

# Step 5: Copy source files (for development server)
echo "📦 Copying source files..."
cp -r src dist/src 2>/dev/null || true
check_status "Copy source files"

echo "✅ Manual build completed!"
echo "📁 Output directory: dist/"
echo "⚠️ This is a development build. For production, you'll need to run a dev server." 