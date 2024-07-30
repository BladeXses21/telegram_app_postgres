const Router = require('express')
const CurrencyController = require('../controller/currency.controller');
const router = new Router()

router.post('/currency', (req, res) => CurrencyController.createCurrency(req, res));

module.exports = router;
