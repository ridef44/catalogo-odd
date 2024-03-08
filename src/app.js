const express = require('express');
const exphbs = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql');
const session = require('express-session');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/login');
const catalogoRoutes = require('./routes/catalogoRoute');
const path = require('path');

const app = express();
app.set('port', 4000);

const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
      precompiled: (content, options) => {
          return content;
      }
  }
});

app.engine('.hbs', hbs.engine); // Usar hbs.engine en lugar de engine()
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(myconnection(mysql, {
  host: '127.0.0.1',
  user: 'devops',
  password: 'admin',
  port: 3306,
  database: 'inventario'
}, 'single'));




app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.listen(app.get('port'), () => {
  console.log('Estamos trabajando sobre el puerto', app.get('port'));
});

app.use('/images', express.static(path.join(__dirname, '/views/img')));

app.use('/', loginRoutes);
app.use('/', catalogoRoutes);

app.get('/', (req, res) => {
  if (req.session.loggedIn) {
    let name = req.session.nombre;
    res.render('home', {name});
  } else {
    res.redirect('/login');
  }
});
