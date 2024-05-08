const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/user', userController.register);
router.post('/user', userController.storeUser);
router.get('/users', userController.list);

//Para insertar los datos en el formualrio de editar

//router.get('/user/edit/:id', userController.edit)
router.get('/edit-user/:id', userController.edit)



module.exports = router;