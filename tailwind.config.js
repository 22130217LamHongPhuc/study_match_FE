/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
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
          DEFAULT: '#B45309',
          light: '#FEF3C7',
          50: '#FFFBEB',
          100: '#FEF3C7',
          600: '#B45309',
          700: '#92400E',
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
