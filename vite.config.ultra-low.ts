import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Ultra-low memory configuration for servers with 4GB RAM
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Use older target for better compatibility and lower memory usage
    target: 'es2015',
    
    // Disable source maps to save memory
    sourcemap: false,
    
    // Use terser with aggressive optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 1, // Reduce passes to save memory
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    
    rollupOptions: {
      // Disable tree-shaking for some modules to reduce memory usage
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      
      output: {
        // Minimal chunking to reduce memory overhead
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui-core': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          'data-core': [
            '@tanstack/react-query',
            'react-hook-form',
            'zod',
            'zustand',
          ],
          'charts': ['recharts'],
          'utils': ['exceljs', '@supabase/supabase-js'],
        },
        
        // Reduce chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      
      // External dependencies to reduce bundle size
      external: [],
      
      // Reduce memory usage during build
      maxParallelFileOps: 1,
      cache: false,
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 3000,
    
    // Disable CSS code splitting to save memory
    cssCodeSplit: false,
    
    // Reduce asset inline limit
    assetsInlineLimit: 0,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@supabase/supabase-js'], // Exclude heavy dependencies
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
  
  // Reduce memory usage
  clearScreen: false,
  logLevel: 'error', // Only show errors to reduce output
}); 