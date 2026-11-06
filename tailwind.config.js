/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './index.tsx', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        surface: v('surface'),
        card: v('card'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        soft: v('soft'),
      },
      keyframes: {
        'sheet-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'pop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.35)' }, '100%': { transform: 'scale(1)' } },
        'orbit': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } },
        'float': { '0%,100%': { transform: 'translateY(0)', opacity: 0.25 }, '50%': { transform: 'translateY(-14px)', opacity: 0.6 } },
        'toast': { '0%': { transform: 'translateY(-120%)' }, '10%,90%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(-120%)' } },
      },
      animation: {
        'sheet-up': 'sheet-up .35s cubic-bezier(.2,.8,.2,1)',
        'fade-in': 'fade-in .25s ease-out',
        'pop': 'pop .35s ease-out',
        'orbit': 'orbit 3s linear infinite',
        'orbit-slow': 'orbit 5s linear infinite reverse',
        'float': 'float 3s ease-in-out infinite',
        'toast': 'toast 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
