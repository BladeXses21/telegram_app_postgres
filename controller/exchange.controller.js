const db = require('../db');

class ExchangeController {
    async getTotalGoldAmount(req, res) {
        try {
            const result = await db.query('SELECT total_capacity FROM currency WHERE uid = 2');
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Total Gold not found' });
            }
        } catch (error) {
            console.error('Error when receiving gold:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getCurrencyGoldAmount(req, res) {
        try {
            const result = await db.query('SELECT currency_capacity FROM currency WHERE uid = 2');
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'Currency Gold amount not found' });
            }
        } catch (error) {
            console.error('Error when receiving currency gold:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async updateExchangeRate(req, res) {
        const { exchange_rate } = req.body;
        try {
            const sourceCurrencyUid = 2; // UID золота
            const targetCurrencyUid = 1; // UID срібла

            const result = await db.query(
                'UPDATE exchange_rate SET rate = $1 WHERE source_currency_uid = $2 AND target_currency_uid = $3 RETURNING *',
                [exchange_rate, sourceCurrencyUid, targetCurrencyUid]
            );

            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'No exchange rate found for update' });
            }
        } catch (error) {
            console.error('Error when updating the exchange rate:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async buyGold(req, res) {
        const { userUid, amount } = req.body; // Користувач та кількість золота для покупки
        try {
            const goldCurrencyUid = 2; // UID золота
            const silverCurrencyUid = 1; // UID срібла

            // Отримання курсу обміну з золота на срібло
            const rateResult = await db.query(
                'SELECT rate FROM exchange_rate WHERE source_currency_uid = $1 AND target_currency_uid = $2',
                [goldCurrencyUid, silverCurrencyUid]
            );

            if (rateResult.rows.length === 0) {
                return res.status(404).json({ message: 'Exchange rate not found' });
            }

            const exchangeRate = rateResult.rows[0].rate;

            // Розрахунок кількості срібла для зняття
            const totalSilverCost = amount * exchangeRate;

            // Перевірка наявності достатньої кількості золота в базі
            const goldResult = await db.query(
                'SELECT currency_capacity FROM currency WHERE uid = $1',
                [goldCurrencyUid]
            );

            if (goldResult.rows.length === 0) {
                return res.status(404).json({ message: 'Gold currency not found' });
            }

            const currentGoldCapacity = goldResult.rows[0].currency_capacity;

            if (currentGoldCapacity < amount) {
                return res.status(400).json({ message: 'Not enough gold available' });
            }

            // Перевірка наявності достатньої кількості срібла на рахунку користувача
            const silverBalanceResult = await db.query(
                'SELECT quantity FROM balance WHERE user_uid = $1 AND currency_uid = $2',
                [userUid, silverCurrencyUid]
            );

            if (silverBalanceResult.rows.length === 0) {
                return res.status(404).json({ message: 'Silver balance not found for user' });
            }

            const currentSilverBalance = silverBalanceResult.rows[0].quantity;

            if (currentSilverBalance < totalSilverCost) {
                return res.status(400).json({ message: 'Not enough silver balance' });
            }

            // Оновлення кількості золота в таблиці currency
            await db.query(
                'UPDATE currency SET currency_capacity = currency_capacity - $1 WHERE uid = $2',
                [amount, goldCurrencyUid]
            );

            // Оновлення кількості срібла на рахунку користувача
            await db.query(
                'UPDATE balance SET quantity = quantity - $1 WHERE user_uid = $2 AND currency_uid = $3',
                [totalSilverCost, userUid, silverCurrencyUid]
            );

            // Оновлення або створення запису в таблиці balance для золота
            const goldBalanceResult = await db.query(
                'SELECT quantity FROM balance WHERE user_uid = $1 AND currency_uid = $2',
                [userUid, goldCurrencyUid]
            );

            if (goldBalanceResult.rows.length > 0) {
                // Оновлення існуючого запису
                await db.query(
                    'UPDATE balance SET quantity = quantity + $1 WHERE user_uid = $2 AND currency_uid = $3',
                    [amount, userUid, goldCurrencyUid]
                );
            } else {
                // Додавання нового запису
                await db.query(
                    'INSERT INTO balance (user_uid, currency_uid, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
                    [userUid, goldCurrencyUid, amount]
                );
            }

            res.json({ message: 'Gold purchased successfully' });
        } catch (error) {
            console.error('Error in buying gold:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async sellGold(req, res) {
        const { userUid, amount } = req.body; // Користувач та кількість золота для продажу
        try {
            const goldCurrencyUid = 2; // UID золота
            const silverCurrencyUid = 1; // UID срібла

            // Отримання курсу обміну з золота на срібло
            const rateResult = await db.query(
                'SELECT rate FROM exchange_rate WHERE source_currency_uid = $1 AND target_currency_uid = $2',
                [goldCurrencyUid, silverCurrencyUid]
            );

            if (rateResult.rows.length === 0) {
                return res.status(404).json({ message: 'Exchange rate not found' });
            }

            const exchangeRate = rateResult.rows[0].rate;

            // Розрахунок кількості срібла для отримання
            const totalSilverAmount = amount * exchangeRate;

            // Перевірка наявності достатньої кількості золота на рахунку користувача
            const goldBalanceResult = await db.query(
                'SELECT quantity FROM balance WHERE user_uid = $1 AND currency_uid = $2',
                [userUid, goldCurrencyUid]
            );

            if (goldBalanceResult.rows.length === 0) {
                return res.status(404).json({ message: 'Gold balance not found for user' });
            }

            const currentGoldBalance = goldBalanceResult.rows[0].quantity;

            if (currentGoldBalance < amount) {
                return res.status(400).json({ message: 'Not enough gold balance' });
            }

            // Оновлення кількості золота на рахунку користувача
            await db.query(
                'UPDATE balance SET quantity = quantity - $1 WHERE user_uid = $2 AND currency_uid = $3',
                [amount, userUid, goldCurrencyUid]
            );

            // Оновлення кількості золота в таблиці currency
            await db.query(
                'UPDATE currency SET currency_capacity = currency_capacity + $1 WHERE uid = $2',
                [amount, goldCurrencyUid]
            );

            // Оновлення або створення запису в таблиці balance для срібла
            const silverBalanceResult = await db.query(
                'SELECT quantity FROM balance WHERE user_uid = $1 AND currency_uid = $2',
                [userUid, silverCurrencyUid]
            );

            if (silverBalanceResult.rows.length > 0) {
                // Оновлення існуючого запису
                await db.query(
                    'UPDATE balance SET quantity = quantity + $1 WHERE user_uid = $2 AND currency_uid = $3',
                    [totalSilverAmount, userUid, silverCurrencyUid]
                );
            } else {
                // Додавання нового запису
                await db.query(
                    'INSERT INTO balance (user_uid, currency_uid, quantity, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
                    [userUid, silverCurrencyUid, totalSilverAmount]
                );
            }

            res.json({ message: 'Gold sold successfully' });
        } catch (error) {
            console.error('Error in selling gold:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getExchangeRate(req, res) {
        try {
            const sourceCurrencyUid = 2; // UID золота
            const targetCurrencyUid = 1; // UID срібла

            const result = await db.query(
                'SELECT rate FROM exchange_rate WHERE source_currency_uid = $1 AND target_currency_uid = $2',
                [sourceCurrencyUid, targetCurrencyUid]
            );

            console.log('Query result:', result.rows);
            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'No exchange rate found' });
            }
        } catch (error) {
            console.error('Error when receiving the exchange rate:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new ExchangeController();
