const path = require('path');

//renderizado de archivos estativos

function renderHtml (req, res){

  if(!req.session.loggedIn){
    return res.redirect('/');
  }

  else{
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  }
  
}




module.exports ={
  renderHtml
 
}