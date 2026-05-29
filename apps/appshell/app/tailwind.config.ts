import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0366d6',
        secondary: '#6f42c1',
        accent: '#28a745',
        destructive: '#d73a49',
        muted: '#6a737d',
        background: '#ffffff',
        foreground: '#24292e',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      fontFamily: {
        sans: 'system-ui, -apple-system, sans-serif',
      },
    },
  },
  plugins: [],
};

export default config;
