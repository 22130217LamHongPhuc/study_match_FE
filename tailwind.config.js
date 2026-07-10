/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
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
          50: '#FAFAF8',
          100: '#F5F5F0',
          200: '#E8E6DF',
          300: '#D4D0C8',
          400: '#B8B3A8',
          500: '#9C9688',
          600: '#8A8475',
          700: '#6B6558',
          800: '#44403C',
          900: '#292524',
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
