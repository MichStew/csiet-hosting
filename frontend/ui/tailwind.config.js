/** @type {import('tailwindcss').Config} */
export default {
  content: [
      // has to be added for tailwind to work
      "./index.html",
      "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
        colors: {
            'burgundy' : '#733635',
            'cream' : '#EBE3D5FF',
            'burgundy-light' : '#8b4a49'
        },
        animation: {
            'float' : 'float 3s ease-in-out infinite',
            'fade-in-up' : 'fadeInUp 0.6s ease-out'
        },
        keyframes: {
            float: {
                '0%, 100%' : { transform: 'translateY(0px)'},
                '50%' : { transform : 'translateY(-10px)'}
            },
            fadeInUp : {
                'from' : {
                    opacity : '0',
                    transform : 'translateY(30px)'
                },
                'to' : {
                    opacity : 1,
                    transform: 'translateY(0)'
                }
            }
        }
    },
  },
  plugins: [],
}

