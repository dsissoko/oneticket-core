import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration
 *
 * Defines frozen design tokens (colors, spacing, typography) for the application.
 * All styling must use these tokens to ensure visual consistency.
 *
 * Key Principle: "Design by Constraint"
 * - Colors, spacing, and fonts are defined here (not scattered in components)
 * - No inline colors or arbitrary values in component classes
 * - All components use @apply or Tailwind utility classes referencing these tokens
 *
 * @see {@link https://tailwindcss.com/docs/configuration Tailwind Config Docs}
 * @see {@link https://tailwindcss.com/docs/theme Tailwind Theme Reference}
 */
const config: Config = {
  /**
   * Content paths — files where Tailwind scans for used classes
   *
   * Vite serves index.html and SPA routes
   * All *.tsx and *.ts files in src/ may contain Tailwind classes
   *
   * If you add new file types or directories, update these paths
   * to avoid "styles not applied" issues
   */
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  /**
    * Theme configuration with extended design tokens
    *
    * "extend" mode allows us to add to Tailwind's defaults without replacing them
    * (e.g., we add "primary" but keep all built-in colors like "blue-500")
    */
  theme: {
    extend: {
      /**
        * Color palette
        *
        * These colors are frozen and should not change mid-project.
        * Inspired by GitHub's Primer design system.
        *
        * Usage:
        * - text-primary, bg-primary, border-primary
        * - text-secondary, bg-secondary, border-secondary
        * - text-accent, bg-accent
        * - text-destructive, bg-destructive (error/delete states)
        * - text-muted, text-gray-400 (subtle/disabled text)
        * - bg-background, text-foreground (base colors)
        *
        * Dark mode: Automatically inverted via next-themes
        * (light mode uses #ffffff bg, dark mode uses #1c2128 or similar)
        */
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },

      /**
       * Spacing scale
       *
       * Custom spacing multiples for margins, padding, gaps.
       * Starts at xs (¼rem) and scales up to xl (2rem).
       *
       * Usage:
       * - p-md (padding 1rem), m-lg (margin 1.5rem)
       * - gap-xs (gap ¼rem), space-y-sm (vertical spacing)
       *
       * Also includes Tailwind's built-in: 1, 2, 3, 4, ... (0.25rem increments)
       */
      spacing: {
        xs: '0.25rem',   // ¼rem — small gaps between tight elements
        sm: '0.5rem',    // ½rem — compact spacing
        md: '1rem',      // 1rem — default paragraph spacing
        lg: '1.5rem',    // 1.5rem — section spacing
        xl: '2rem',      // 2rem — large vertical gaps
      },

      /**
       * Font family configuration
       *
       * Uses system font stack for optimal performance and native look.
       * Falls back through modern browsers' native fonts.
       *
       * @example
       * .sans-serif = "system-ui, -apple-system, BlinkMacSystemFont, ..."
       * (renders native fonts on each OS: San Francisco on macOS, Segoe on Windows)
       */
      fontFamily: {
        sans: 'system-ui, -apple-system, sans-serif',
      },
    },
  },

  /**
   * Dark mode strategy
   *
   * Using 'class' strategy to work with next-themes
   */
  darkMode: ['class'],

  /**
   * Tailwind plugins
   *
   * Plugins extend Tailwind with custom utilities or component classes.
   * Currently empty; add as needed (e.g., @tailwindcss/typography, @tailwindcss/forms)
   *
   * @example
   * plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')]
   */
  plugins: [],
};

export default config;
