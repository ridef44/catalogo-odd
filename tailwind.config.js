/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.hbs"],
  theme: {

  
    extend: {
      colors:{
        'midnight':   '#292524',
        'aws':        '#d97706',
        'teal-500':   '#14b8a6',
        'teal-800':   '#115e59',
        'amber-500':  '#f59e0b',
        'amber-800':  '#92400e',
        'sky-500':    '#0ea5e9',
        'sky-800':    '#075985',
        'rose-500':   '#f43f5e',
        'rose-800':   '#9f1239',
        'stone-500':  '#78716c',
        'stone-800':  '#292524',
      },
     

    },
  },
  plugins: [],
}


//npx tailwindcss -i ./src/views/layouts/input.css -o ./src/views/img/output.css --watch
// refrescar estilos tailwind