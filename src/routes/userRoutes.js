const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

//Renderiza la vista para creacion de usuarios
router.get('/user', userController.register);


router.post('/user', userController.storeUser);

//Listar usuarios
router.get('/users', userController.list);



//router.get('/user/edit/:id', userController.edit)
router.get('/edit-user/:id', userController.edit)

//router.get('/user/edit/:id', userController.edit)
router.post('/edit-user/:id', userController.update)


//Ruta para vista de edicion de password
router.get('/password/:id', userController.editPassword)

//Metodo post para cambio de contraseña
router.post('/password/:id', userController.changePassword)

//Metodo post para cambio de contraseña
router.post('/delete/:id', userController.deleteUser)

module.exports = router;