const path = require('path');

//renderizado de archivos estativos
function renderHtml (req, res){

  if(req.session.loggedIn && req.session.rol ===1){
    res.sendFile(path.join(__dirname, '../public/admin', 'index.html'));
  }
  else{
    return res.redirect('/');
    
  }
  
}


function renderUser (req, res){

  if(!req.session.loggedIn){
    return res.redirect('/');
  }

  else{
    res.sendFile(path.join(__dirname, '../public/explorer', 'index.html'));
  }
  
}

function noacces (req, res){

  if(!req.session.loggedIn){
    return res.redirect('/');
  }

  else{
    res.render('catalogo/no_access')
  }
  
}





module.exports ={
  renderHtml,
  renderUser,
  noacces
 
}