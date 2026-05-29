import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration — React SPA
 *
 * Configures Vite for development and production builds.
 *
 * Key Settings:
 * - React plugin: Fast Refresh enabled (HMR on file changes)
 * - Dev server: Runs on port 5173 (or next available if in use)
 * - Build output: Optimized JS/CSS/HTML to dist/
 * - Minification: Terser (faster than esbuild for large bundles)
 *
 * @see {@link https://vitejs.dev/config/ Vite Config Documentation}
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',

  /**
   * Vite plugins to extend build functionality
   *
   * @vitejs/plugin-react:
   * - Adds JSX/TSX support
   * - Enables React Fast Refresh (instant HMR on code changes)
   * - Uses SWC for faster compilation than Babel
   */
  plugins: [react()],

  /**
   * Development server configuration
   *
   * port: 5173 — Default port (standard for Vite)
   * strictPort: false — Auto-increment if port in use (5174, 5175, etc.)
   * open: false — Don't auto-open browser (let user decide)
   */
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },

  /**
   * Production build configuration
   *
   * outDir: 'dist/' — Where bundled files are written
   * sourcemap: false — Don't generate source maps in production (reduces bundle size)
   * minify: 'terser' — Minify with Terser (good for React, smaller than esbuild)
   *
   * Other minifiers:
   * - 'esbuild' — Faster but slightly larger output
   * - 'lightningcss' — Experimental CSS-only minifier
   */
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
});
