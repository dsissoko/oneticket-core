import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for AppShell
 *
 * Features:
 * - React plugin for JSX/TSX support and Fast Refresh (HMR)
 * - Base path configuration via VITE_BASE_PATH environment variable
 * - Standard build optimizations (code splitting, minification, etc.)
 * - Development server configuration for local development
 */
export default defineConfig({
  plugins: [react()],

  base: process.env.VITE_BASE_PATH || '/',

  build: {
    // Output directory for production build
    outDir: 'dist',
    // Clear output directory before build
    emptyOutDir: true,
    // Enable source maps for production debugging
    sourcemap: false,
    // Minification target
    target: 'ES2020',
    // Code splitting configuration
    rollupOptions: {
      output: {
        // Chunk naming convention
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        // Asset naming convention
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]';
          } else if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  server: {
    // Port for development server
    port: 5173,
    // Enable HMR (Hot Module Replacement)
    hmr: true,
    // Open browser on server start
    open: false,
  },

  resolve: {
    // Alias configuration for cleaner imports (optional)
    alias: {
      '@': '/src',
    },
  },
});
