const bcrypt = require('bcrypt');

//Funcion de  busqueda de usuarios
function searchUsers(req, callback) {
  const searchTerm = req.query.search || ''; // Obtener el término de búsqueda de la consulta URL

  let query = `
    SELECT user.id, user.correo, user.nombre, role.role
    FROM user
    LEFT JOIN role ON user.id_role = role.id
    WHERE user.correo <> "admin@odd.digital"
  `;

  const params = []; // Array para almacenar parámetros seguros

   // Aplicar búsqueda si se proporciona un término de búsqueda
   if (searchTerm) {
    query += ` AND (user.nombre LIKE ? OR user.correo LIKE ?) `; // Uso de parámetro para evitar inyección SQL
    params.push(`%${searchTerm}%`, `%${searchTerm}%`); // Agregar término de búsqueda al array de parámetros
  }
  // Lógica para obtener los usuarios que coinciden con el término de búsqueda
  req.getConnection((err, conn) => {
    if (err) {
      return callback(err, null);
    }

    conn.query(query, params, (err, results) => { // Pasar parámetros de forma segura
      if (err) {
        return callback(err, null);
      }
      // Mapear los resultados para asegurar que la estructura sea consistente
      const usuarios = results.map(result => ({
        id: result.id,
        correo: result.correo,
        nombre: result.nombre,
        rol: result.role
      }));

      callback(null, usuarios);
    });
  });
}



//Funcio  para listar a los usuarios
function list(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }
  // Recuperar el rol del usuario desde la sesión
  let correo = req.session.correo;

  // Buscar usuarios
  searchUsers(req, (err, usuarios) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: "Error al obtener los usuarios" });
    }
    
    let name = req.session.nombre;
    if (correo == 'admin@odd.digital') {
      // Renderizar la plantilla para usuarios con correo Sistemas o usuario master
      res.render('user/list_user', { usuarios, name, correo });
    } else {
      // Redireccionar para usuarios con otros roles
      return res.redirect('/');
    }
  });
}


//Funcion para listar los elementos en el form para editar usuario
function edit(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }
  // Recuperar el rol del usuario desde la sesión
  let correo = req.session.correo;
  const id = req.params.id;

  if(correo=='admin@odd.digital'){
    req.getConnection((err, conn) => {
      if (err) {
        console.error('Error al obtener conexión:', err);
        return res.status(500).send('Error del servidor al obtener la conexión');
      }
  
      conn.query('SELECT user.id, user.correo, user.nombre, role.role, user.id_role FROM user LEFT JOIN role ON user.id_role = role.id WHERE user.id = ? AND user.correo <> "admin@odd.digital" ', [id], (err, usuarioResult) => {
        if (err) {
          console.error('Error al consultar la base de datos:', err);
          return res.status(500).send('Error al consultar la base de datos');
        }
  
        if (usuarioResult.length === 0) {
          console.log('Usuario no encontrado con ID:', id);
          return res.status(404).send('Usuario no encontrado');
        }
  
        const usuario = usuarioResult[0];
        const queryRoles = 'SELECT id, role FROM role';
        conn.query(queryRoles, (err, rowsRole) => {
          if (err) {
            console.error('Error al obtener roles:', err);
            return res.status(500).send('Error del servidor al obtener roles');
          }
          
          const roles = rowsRole;
          roles.forEach(role => {
            role.selected = (role.id === usuario.id_role);
          });
          let name = req.session.nombre;
          res.render('user/edit', { usuario, roles, name, correo });
        });
      });
    });

  }else{
    return res.redirect('/');
  }
}

//Funcion para actualizar los elementos

function update(req, res) {
  const id = req.params.id;
  const data = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error del servidor');
    }

    conn.query('UPDATE user SET ? WHERE id = ?', [data, id], (err, rows) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al actualizar la agencia');
      }
        res.redirect('/users');
    });
  });
}


//Funciones para renderizar vista de creacion de usuari9os
function register(req, res){
  let correo = req.session.correo
   // Verificar si el usuario está logueado y si el correo es el permitido
   if (!req.session.loggedIn || correo !== 'admin@odd.digital') {
    return res.redirect('/');
  }
  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
    }
    // Obtener los roles de tabla role
    conn.query('SELECT id, role FROM role', (err, rows) => {
      if (err) {
        console.log(err);
      }
      let name = req.session.nombre;
      res.render('user/register', { name, roles: rows, correo });
      //console.log(rows);
    });
  });
}

//inserta en base de datos al usuario nuevo 
function storeUser(req, res) {
  const data = req.body;
  delete data.password_confirm; // Elimina el campo antes de proceder con cualquier operación de base de datos

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error al conectar con la base de datos.');
    }

    conn.query('SELECT * FROM user WHERE correo = ?', [data.correo], (err, userdata) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Error al consultar la base de datos.');
      }

      if (userdata.length > 0) {
        // Si el usuario ya existe, obtener roles antes de renderizar la vista con error
        conn.query('SELECT id, role FROM role', (err, roles) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Error al consultar la base de datos.');
          }
          let name = req.session.nombre;
          let correo = req.session.correo;
          res.render('user/register', { name, roles, correo, error: 'Correo registrado. Por favor, usar otra dirección' });
        });
      } else {
        bcrypt.hash(data.password, 12).then(hash => {
          data.password = hash;
          conn.query('INSERT INTO user SET ?', [data], (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).send('Error al registrar el usuario.');
            }
            setTimeout(() => {
              res.redirect('/users');
            }, 3000);
          });
        }).catch(hashError => {
          console.log(hashError);
          res.status(500).send('Error al hashear la contraseña.');
        });
      }
    });
  });
}


// Función para cambiar la contraseña del usuario
function changePassword(req, res) {
  const { password } = req.body; // Recibe la nueva contraseña desde el cuerpo de la solicitud
  const userId = req.params.id; // Suponemos que el ID del usuario se pasa como parámetro en la ruta

  // Verificar si el usuario está logueado y si tiene permisos para modificar este usuario específico
  /*if (!req.session.loggedIn || req.session.userId !== userId) {
    return res.redirect('/login'); // Redireccionar si no está autenticado o no tiene permiso
  } */

  if (!req.session.loggedIn) {
    return res.redirect('/'); // Redireccionar si no está autenticado o no tiene permiso
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error("Error al conectar a la base de datos:", err);
      return res.status(500).send('Error al conectar con la base de datos.');
    }

    // Hashear la nueva contraseña antes de guardarla en la base de datos
    bcrypt.hash(password, 12, (err, hashedPassword) => {
      if (err) {
        console.error("Error al hashear la contraseña:", err);
        return res.status(500).send('Error al hashear la contraseña.');
      }

      // Actualizar la contraseña en la base de datos para el usuario especificado
      conn.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, userId], (err, results) => {
        if (err) {
          console.error("Error al actualizar la contraseña:", err);
          return res.status(500).send('Error al actualizar la contraseña.');
        }
        // Redirigir a alguna página de confirmación o al perfil del usuario
        res.redirect('/users'); 
      });
    });
  });
}


//Funcion para listar los elementos en el form para editar usuario
function editPassword(req, res) {
  if (!req.session.loggedIn) {
    return res.redirect('/');
  }
  // Recuperar el rol del usuario desde la sesión
  let correo = req.session.correo;
  const id = req.params.id;

  if(correo=='admin@odd.digital'){
    req.getConnection((err, conn) => {
      if (err) {
        console.error('Error al obtener conexión:', err);
        return res.status(500).send('Error del servidor al obtener la conexión');
      }
  
      conn.query('SELECT user.id, user.correo, user.nombre, role.role, user.id_role FROM user LEFT JOIN role ON user.id_role = role.id WHERE user.id = ? AND user.correo <> "admin@odd.digital" ', [id], (err, usuarioResult) => {
        if (err) {
          console.error('Error al consultar la base de datos:', err);
          return res.status(500).send('Error al consultar la base de datos');
        }
  
        if (usuarioResult.length === 0) {
          console.log('Usuario no encontrado con ID:', id);
          return res.status(404).send('Usuario no encontrado');
        }
  
        const usuario = usuarioResult[0];
          let name = req.session.nombre;
          res.render('user/password', { usuario, correo, name });
        ;
      });
    });

  }else{
    return res.redirect('/');
  }
}

//Borrar usuarios
function deleteUser(req, res) {
  const id = req.params.id;

  if (!req.session.loggedIn ) {
    return res.redirect('/'); 
}

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error de servidor');
    }
      conn.query('DELETE FROM user WHERE id = ?', [id], (err, rows) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Error de servidor');
        }
        setTimeout(() => {
          res.redirect('/users');
        }, 3000);
        
      });
    });
  }




  module.exports={
    register,
    storeUser,
    list,
    edit,
    update,
    changePassword,
    editPassword,
    deleteUser
  }