const express = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = express.Router();


router.get('/catalogo', catalogoController.renderHtml)
router.get('/lectura', catalogoController.renderUser)
router.get('/noacces', catalogoController.noacces)



module.exports = router;