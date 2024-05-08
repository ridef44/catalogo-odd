const bcrypt = require('bcrypt');

/*
function register(req, res) {

    if (!req.session.loggedIn) {
      res.redirect('/');
      // user is logged in.
  }
  else {
    res.render('user/register');
      // user is not logged in.
  }
  }
*/

function searchUsers(req, callback) {
  const searchTerm = req.query.search || ''; // Obtener el término de búsqueda de la consulta URL

  let query = `
    SELECT user.id, user.correo, user.nombre, role.role
    FROM user
    LEFT JOIN role ON user.id_role = role.id
  `;

  // Aplicar búsqueda si se proporciona un término de búsqueda
  if (searchTerm) {
    query += ` WHERE user.nombre LIKE '%${searchTerm}%'`;
  }

  // Lógica para obtener los usuarios que coinciden con el término de búsqueda
  req.getConnection((err, conn) => {
    if (err) {
      return callback(err, null);
    }

    conn.query(query, (err, results) => {
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




function list(req, res) {
  searchUsers(req, (err, usuarios) => {
    if (err) {
      return res.status(500).json({ message: "Error al obtener los usuarios" });
    }
    
    let name = req.session.nombre;
    res.render('user/list_user', { usuarios, name });
  });
}


function edit(req, res) {
  const id = req.params.id;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error al obtener conexión:', err);
      return res.status(500).send('Error del servidor al obtener la conexión');
    }

    conn.query('SELECT user.id, user.correo, user.nombre, role.role, user.id_role FROM user LEFT JOIN role ON user.id_role = role.id WHERE user.id = ?', [id], (err, usuarioResult) => {
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
        res.render('user/edit', { usuario, roles });
      });
    });
  });
}



function register(req, res){

  req.getConnection((err, conn) => {
    if (err) {
      console.log(err);
    }
    // Obtener los roles de tabla role
    co222nn.query('SELECT id, role FROM role', (err, rows) => {
      if (err) {
        console.log(err);
      }
      let name = req.session.nombre;
      res.render('user/register', { name, roles: rows });
      //console.log(rows);
    });
  });
}

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
        res.render('user/register', {error: 'Usuario ya existe'});
      } else {
        bcrypt.hash(data.password, 12).then(hash => {
          data.password = hash;
          conn.query('INSERT INTO user SET ?', [data], (err, rows) => {
            if (err) {
              console.log(err);
              return res.status(500).send('Error al registrar el usuario.');
            }
            res.redirect('/users');
          });
        }).catch(hashError => {
          console.log(hashError);
          res.status(500).send('Error al hashear la contraseña.');
        });
      }
    });
  });
}


  module.exports={
    register,
    storeUser,
    list,
    edit
  }