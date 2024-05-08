const bcrypt = require('bcrypt');

const password = process.argv[2]; // Toma la contraseña del primer argumento de la línea de comandos

bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error('Error al hashear:', err);
    return;
  }
  console.log('Hashed Password:', hash);
});

//node hashPassword.js 123
