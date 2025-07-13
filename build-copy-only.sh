#!/bin/bash

# Copy-only build script for 2GB RAM servers
echo "🚀 Starting copy-only build..."

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
check_status "Clean"

# Step 2: Create dist structure
echo "📁 Creating dist structure..."
mkdir -p dist
check_status "Create dist structure"

# Step 3: Copy public files
echo "📋 Copying public files..."
if [ -d "public" ]; then
    cp -r public/* dist/ 2>/dev/null || true
fi
check_status "Copy public files"

# Step 4: Create basic HTML
echo "📄 Creating basic HTML..."
cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hairvana Admin Dashboard</title>
    <style>
        body { margin: 0; font-family: Arial, sans-serif; }
        .container { padding: 20px; text-align: center; }
        .message { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hairvana Admin Dashboard</h1>
        <div class="message">
            <h2>Build Status</h2>
            <p>✅ Basic build completed successfully!</p>
            <p>📁 Files copied to dist/ directory</p>
            <p>🔧 This is a minimal build for server deployment</p>
        </div>
        <div class="message">
            <h3>Next Steps</h3>
            <p>1. Serve the dist/ directory with your web server</p>
            <p>2. Configure your backend API endpoints</p>
            <p>3. Set up environment variables</p>
        </div>
    </div>
</body>
</html>
EOF
check_status "Create HTML"

# Step 5: Copy package.json for reference
echo "📦 Copying package.json..."
cp package.json dist/ 2>/dev/null || true
check_status "Copy package.json"

# Step 6: Create a simple README
echo "📝 Creating README..."
cat > dist/README.md << 'EOF'
# Hairvana Admin Dashboard - Build Output

This directory contains the build output for the Hairvana Admin Dashboard.

## Files
- `index.html` - Main HTML file
- `package.json` - Project dependencies reference
- `README.md` - This file

## Deployment
1. Serve this directory with your web server
2. Configure your backend API endpoints
3. Set up environment variables

## Development
For development, run:
```bash
npm run dev
```

## Production Build
For a full production build, you'll need more memory on your server.
EOF
check_status "Create README"

echo "✅ Copy-only build completed!"
echo "📁 Output directory: dist/"
echo "📄 Files created:"
ls -la dist/ 