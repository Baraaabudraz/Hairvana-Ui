#!/usr/bin/env node

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple development server that avoids WebAssembly
const PORT = process.env.PORT || 3000;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.ts': 'text/javascript',
  '.tsx': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Simple development server
const server = createServer(async (req, res) => {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query parameters
    filePath = filePath.split('?')[0];
    
    // Map API requests to backend
    if (filePath.startsWith('/api/')) {
      // Proxy API requests to backend (if running)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'API proxy not configured',
        note: 'Configure your backend server to handle API requests'
      }));
      return;
    }
    
    // Serve static files
    let fullPath;
    if (filePath === '/index.html') {
      fullPath = join(__dirname, 'index.html');
    } else if (filePath.startsWith('/src/')) {
      fullPath = join(__dirname, filePath);
    } else if (filePath.startsWith('/public/')) {
      fullPath = join(__dirname, filePath);
    } else {
      fullPath = join(__dirname, 'public', filePath);
    }
    
    const ext = extname(fullPath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    const content = await readFile(fullPath, 'utf8');
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File not found - serve a simple message
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>404 - File Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file was not found on this server.</p>
            <p>Requested: ${req.url}</p>
            <p><a href="/">Go to Home</a></p>
          </body>
        </html>
      `);
    } else {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head><title>500 - Server Error</title></head>
          <body>
            <h1>500 - Server Error</h1>
            <p>An error occurred while processing your request.</p>
            <p>Error: ${error.message}</p>
          </body>
        </html>
      `);
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Simple dev server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`⚠️ This is a basic server - no hot reload or TypeScript compilation`);
  console.log(`🔧 For full development, you'll need more memory on your server`);
}); 