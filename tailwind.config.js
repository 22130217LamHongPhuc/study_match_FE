/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        orange: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7dd0fc',
          400: '#38bdf8',
          500: '#2563eb', // Royal Blue primary brand color
          600: '#1d4ed8', // Darker Blue hover state
          700: '#1e40af',
          800: '#375ec9ff',
          900: '#0f172a',
        },
        sand: {
          50: '#F8FAFC',  // slate-50
          100: '#F1F5F9', // slate-100
          200: '#E2E8F0', // slate-200
          300: '#CBD5E1', // slate-300
          400: '#94A3B8', // slate-400
          500: '#64748B', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1E293B', // slate-800
          900: '#0F172A', // slate-900
        },
        accent: {
          DEFAULT: '#2563eb',
          light: '#f0f7ff',
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7dd0fc',
          400: '#38bdf8',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        sage: {
          DEFAULT: '#6B8F71',
          light: '#F0FDF4',
          50: '#F0FDF4',
          100: '#DCFCE7',
          600: '#6B8F71',
          700: '#4D7C54',
        },
      },
    },
  },
  plugins: [],
};
