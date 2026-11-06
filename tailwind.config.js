/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.tsx', './components/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
