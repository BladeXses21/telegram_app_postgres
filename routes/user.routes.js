const Router = require('express')
const router = new Router()
const userController = require('../controller/user.controller')

router.post('/user', userController.createUser)
router.get('/user', userController.getUsers)
router.get('/user/:uid', userController.getOneUser)
router.get('/user/:uid/balance', userController.getUserBalance);
router.get('/user/telegram/:telegram_id', userController.getUserIdByTelegramId)
router.put('/user', userController.updateUser)
router.delete('/user/:uid', userController.deleteUser)

module.exports = router