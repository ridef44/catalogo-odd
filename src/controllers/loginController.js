const bcrypt = require('bcrypt');

  
  function login(req, res) {
    if (req.session.loggedIn) {
      res.redirect('/');
     
      // user is logged in.
  }
  else {
    res.render('login/index');
      // user is not logged in.
  }
  }

  //------------------------------
  function auth (req, res){
    const data = req.body
    req.getConnection((err, conn) => {
    conn.query('SELECT * FROM user WHERE correo = ?', [data.correo], (err, userdata) => {
      if(userdata.length > 0) {
        userdata.forEach(element => {
          bcrypt.compare(data.password, element.password,(err, isMatch) =>{
            if(!isMatch){
              res.render('login/index', {error:'Contraseña Incorrecta'})
            }

            else{
              req.session.loggedIn = true;
	            req.session.nombre = element.nombre;
              
              res.redirect('/');
              
            }
          });
          
        });
      } else {
        res.render('login/index', {error:'Usuario NO existe'})
      }
    });
  });
}
//----------------------------

  function register(req, res) {
    if (req.session.loggedIn) {
      res.redirect('/');
      // user is logged in.
  }
  else {
    res.render('login/register');
    
    
      // user is not logged in.
  }
  
    
  }

  function storeUser(req, res){
    const data = req.body;

    req.getConnection((err, conn) => {
      conn.query('SELECT * FROM user WHERE correo = ?', [data.correo], (err, userdata) => {
        if(userdata.length > 0) {
          res.render('login/register', {error:'Usuario ya existe'})
          
        } else {
                    bcrypt.hash(data.password, 12).then(hash =>{
                      data.password = hash;
                      
                      req.getConnection((err, conn) => {
                        conn.query('INSERT INTO user SET ?',[data], (err, rows) =>{
                          res.redirect('/');
                        
                          if (err) {
                            console.log(err);
                          }
                        
                        });
                      });
                
                    });

        }
      });
    });
  }


  function logout(req, res) {
    if (req.session.loggedIn) {
      req.session.destroy();
    }
    res.redirect('/');
  }
  //----------------------------


  module.exports = {
    login,
    register,
    storeUser,
    auth,
    logout
  }