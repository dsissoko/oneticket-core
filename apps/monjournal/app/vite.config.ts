import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // React plugin with Fast Refresh
    react(),
    // Gzip compression for production build
    compression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],

  // Base path for GitHub Pages deployment
  // Adjust to match repository name if deployed as subdirectory
  // e.g., https://username.github.io/monjournal/
  base: process.env.VITE_BASE_URL || '/monjournal/',

  build: {
    // Output directory for production build
    outDir: 'dist',
    
    // Enable source maps in development
    sourcemap: !process.env.VITE_DISABLE_SOURCEMAP,

    // Tree-shaking: remove unused code
    // Only works with ES modules (our codebase uses import/export)
    rollupOptions: {
      output: {
        // Code-splitting configuration
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'primer-vendor': ['@primer/react', '@primer/primitives'],
        },
        // Minified output filenames
        entryFileNames: 'js/[name].[hash].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg|webp|ico/.test(ext)) {
            return `assets/[name].[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name].[hash][extname]`;
          } else if (ext === 'css') {
            return `css/[name].[hash][extname]`;
          }
          return `[name].[hash][extname]`;
        },
      },
      // Enable tree-shaking in production
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },

    // Minification configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.VITE_DROP_CONSOLE !== 'false', // Remove console.log in prod
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: false,
      },
    },

    // CSS minification
    cssMinify: true,

    // Chunk size warning threshold (500KB)
    chunkSizeWarningLimit: 500,

    // Report compressed file size
    reportCompressedSize: true,

    // Target ES2020 with native features
    target: 'es2020',

    // Enable lib mode if needed in future
    // lib: {
    //   entry: 'src/index.ts',
    //   name: 'MonJournal',
    //   formats: ['umd', 'es'],
    // },
  },

  // Development server configuration
  server: {
    port: 5173,
    open: true,
    // Enable CORS for development
    cors: true,
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // Optimize dependencies (pre-bundling)
  optimizeDeps: {
    include: ['react', 'react-dom', '@primer/react'],
  },
});
