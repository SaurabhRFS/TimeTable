/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['"Tenor Sans"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'shimmer': 'shimmer 2s infinite',
        'wander-1': 'wander1 15s infinite ease-in-out alternate',
        'wander-2': 'wander2 20s infinite ease-in-out alternate',
        'wander-3': 'wander3 25s infinite ease-in-out alternate',
        'wander-slow-1': 'wander1 35s infinite ease-in-out alternate',
        'wander-slow-2': 'wander2 40s infinite ease-in-out alternate',
        'shine': 'shine 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        shine: {
          '100%': { left: '125%' },
        },
        wander1: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(30vw, 20vh) scale(1.2)' },
          '100%': { transform: 'translate(-10vw, 40vh) scale(0.9)' },
        },
        wander2: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-40vw, -10vh) scale(1.1)' },
          '100%': { transform: 'translate(20vw, 10vh) scale(0.9)' },
        },
        wander3: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(10vw, -30vh) scale(1.3)' },
          '100%': { transform: 'translate(-20vw, 20vh) scale(0.8)' },
        }
      }
    },
  },
  plugins: [],
}