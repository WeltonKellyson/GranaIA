/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],

  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'gradient-x': 'gradientMove 4s ease infinite',
      },
      gradientMove: {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
      },
       backgroundSize: {
        '200%': '200%',
      },
    },
  },
};

