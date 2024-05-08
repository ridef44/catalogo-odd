/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/views/**/*.hbs"],
  theme: {

  
    extend: {
      colors:{
        'midnight': '#292524',
        'aws': '#d97706',
        'teal': '#14b8a6'
      },
     

    },
  },
  plugins: [],
}


//"tailwind:css": "postcss public/styles/tailwind.css -o public/styles/style.css"
// refrescar estilos tailwind