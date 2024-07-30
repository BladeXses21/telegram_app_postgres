const Router = require('express');
const router = new Router();
const exchangeController = require('../controller/exchange.controller');

router.get('/total-gold', exchangeController.getTotalGoldAmount);
router.get('/currency-gold', exchangeController.getCurrencyGoldAmount);
router.get('/get-rate', exchangeController.getExchangeRate);
router.post('/update-rate', exchangeController.updateExchangeRate);
router.post('/buy-gold', exchangeController.buyGold);
router.post('/sell-gold', exchangeController.sellGold);

module.exports = router;
