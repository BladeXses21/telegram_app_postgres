const Router = require('express');
const router = new Router();
const balanceController = require('../controller/balance.controller');

router.get('/user/:uid/balance', balanceController.getBalanceByUid);

module.exports = router;
