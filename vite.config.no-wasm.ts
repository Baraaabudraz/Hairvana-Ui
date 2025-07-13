import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// WebAssembly-free configuration for servers with 2GB RAM
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Use older target to avoid modern features that require more memory
    target: 'es2015',
    
    // Disable all memory-intensive features
    sourcemap: false,
    minify: false, // Disable minification to save memory
    
    rollupOptions: {
      // Disable tree-shaking to reduce memory usage
      treeshake: false,
      
      output: {
        // Single file output to minimize memory usage
        manualChunks: undefined,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      
      // Disable all optimizations that use memory
      cache: false,
      maxParallelFileOps: 1,
    },
    
    // Disable CSS code splitting
    cssCodeSplit: false,
    
    // Disable asset inlining
    assetsInlineLimit: 0,
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 10000,
  },
  
  // Disable dependency optimization
  optimizeDeps: {
    disabled: true,
  },
  
  // Disable HMR and other dev features
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Minimal logging
  clearScreen: false,
  logLevel: 'error',
}); 