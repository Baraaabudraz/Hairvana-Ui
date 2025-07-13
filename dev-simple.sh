#!/bin/bash

# Simple development server script for 2GB RAM servers
echo "🚀 Starting simple development server..."

# Set minimal environment
export NODE_OPTIONS="--max-old-space-size=256"

# Function to check if command succeeded
check_status() {
    if [ $? -ne 0 ]; then
        echo "❌ Step failed: $1"
        exit 1
    fi
    echo "✅ $1 completed successfully"
}

# Step 1: Check if we have a basic structure
echo "📁 Checking project structure..."
if [ ! -f "index.html" ]; then
    echo "📄 Creating basic index.html..."
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hairvana Admin Dashboard</title>
    <style>
        body { 
            margin: 0; 
            font-family: Arial, sans-serif; 
            background: #f5f5f5;
        }
        .container { 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .message { 
            background: #e3f2fd; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 4px solid #2196f3;
        }
        .warning { 
            background: #fff3e0; 
            border-left: 4px solid #ff9800;
        }
        .success { 
            background: #e8f5e8; 
            border-left: 4px solid #4caf50;
        }
        code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hairvana Admin Dashboard</h1>
        
        <div class="message success">
            <h2>✅ Development Server Running</h2>
            <p>Your simple development server is now running!</p>
        </div>
        
        <div class="message">
            <h3>📁 Project Structure</h3>
            <p>This is a basic development setup for your 2GB server.</p>
            <ul>
                <li><code>src/</code> - Source files</li>
                <li><code>public/</code> - Static assets</li>
                <li><code>backend/</code> - Backend API</li>
            </ul>
        </div>
        
        <div class="message warning">
            <h3>⚠️ Development Limitations</h3>
            <p>Due to server memory constraints (2GB), this is a simplified development setup:</p>
            <ul>
                <li>No hot reload</li>
                <li>No TypeScript compilation</li>
                <li>No Vite bundling</li>
                <li>Basic file serving only</li>
            </ul>
        </div>
        
        <div class="message">
            <h3>🔧 Next Steps</h3>
            <p>To work with your project:</p>
            <ol>
                <li>Edit files in <code>src/</code> directory</li>
                <li>Refresh browser to see changes</li>
                <li>Use <code>npm run backend</code> for API</li>
                <li>For full development, use a local machine</li>
            </ol>
        </div>
        
        <div class="message">
            <h3>📊 Server Info</h3>
            <p><strong>Memory:</strong> 2GB (limited)</p>
            <p><strong>Node.js:</strong> v22.16.0</p>
            <p><strong>Server:</strong> Simple HTTP server</p>
        </div>
    </div>
</body>
</html>
EOF
    check_status "Create index.html"
fi

# Step 2: Start simple server
echo "🌐 Starting simple HTTP server..."
echo "📡 Server will be available at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Use Python's simple HTTP server if available, otherwise use Node.js
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python HTTP server..."
    python3 -m http.server 3000
elif command -v python &> /dev/null; then
    echo "🐍 Using Python HTTP server..."
    python -m SimpleHTTPServer 3000
else
    echo "📦 Using Node.js simple server..."
    node dev-server.js
fi 