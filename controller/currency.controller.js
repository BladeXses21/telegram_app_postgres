const db = require('../db');

class CurrencyController {
    async createCurrency(req, res) {
        const { name, total_capacity } = req.body;

        try {
            const result = await db.query(
                'INSERT INTO currency (name, total_capacity, currency_capacity) VALUES ($1, $2, $3) RETURNING *',
                [name, total_capacity, total_capacity]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating currency:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new CurrencyController();
