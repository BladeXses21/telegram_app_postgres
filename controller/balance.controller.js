// balance.controller.js
const db = require('../db');

class BalanceController {
    async getBalanceByUid(req, res) {
        const { uid } = req.params;

        try {
            // Перевірка балансу лише для валюти Silver (id = 1)
            const result = await db.query(
                'SELECT quantity FROM balance WHERE user_uid = $1 AND currency_uid = 1',
                [uid]
            );

            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Balance not found' });
            }
        } catch (error) {
            console.error('Error retrieving balance:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

}

module.exports = new BalanceController();
