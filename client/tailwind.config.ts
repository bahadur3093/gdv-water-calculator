import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8f4fd',
          100: '#b8dff9',
          200: '#88caf5',
          400: '#3b9ee8',
          500: '#1e80d8',
          600: '#1565b0',
          800: '#0c4480',
          900: '#0a2d5c',
        },
      },
    },
  },
  plugins: [],
};

export default config;
