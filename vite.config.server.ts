import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Server-optimized configuration for limited memory environments
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Reduce memory usage during build
    target: 'es2015', // Older target for better compatibility
    minify: 'terser', // Use terser instead of esbuild for lower memory usage
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Simplified chunking for server builds
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          'data-vendor': [
            '@tanstack/react-query',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'zustand',
          ],
          'charts-vendor': ['recharts'],
          'file-vendor': ['exceljs'],
          'db-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 2000,
    // Disable source maps for production to save memory
    sourcemap: false,
  },
  // Optimize for server environment
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
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
}); 