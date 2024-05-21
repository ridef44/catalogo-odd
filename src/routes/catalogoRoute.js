const express = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = express.Router();

//vista para administracion
router.get('/catalogo', catalogoController.renderHtml)

//ruta para archivos de lectura
router.get('/lectura', catalogoController.renderUser)

router.get('/noacces', catalogoController.noacces)

//router.get('/testing', catalogoController.testing)



module.exports = router;