const express = require('express');
const catalogoController = require('../controllers/catalogoController');

const router = express.Router();


router.get('/catalogo', catalogoController.renderHtml)



module.exports = router;