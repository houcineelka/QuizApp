/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    './node_modules/preline/dist/*.js',

  ],
  theme: {
    extend: {
      colors: {
        'card-line-transparent': 'rgba(28, 26, 100, 0.08)',
      },
      
      animation: {
        'rotate-y': 'rotateY 2s infinite',
        typing: "typing 5s  infinite alternate, blink .5s infinite",
        'enter-left': 'enterLeft 1s ease-out forwards', 
        enterFromTop: 'enterFromTop 0.5s ease-out forwards',
        enterRight: 'enterRight 0.5s ease-out forwards',


      },
      keyframes: {
        enterRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        enterFromTop: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        enterLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' }, 
          '100%': { transform: 'translateX(0)', opacity: '1' },   
        },
        rotateY: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden"
          },
          "100%": {
            width: "100%"
          }  
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "white"
          }  
        }
      },
    },
  },
  plugins: [
    require('preline/plugin'),

  ],
  
  
}