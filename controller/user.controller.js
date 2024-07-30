const db = require('../db')

class UserController {
    async createUser(req, res) {
        const { username, telegram_id } = req.body;
        const initialBalance = 1000; // Початковий баланс срібла

        try {
            // Перевірка чи існує користувач
            const existingUser = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
            if (existingUser.rows.length > 0) {
                return res.status(409).json({ message: 'Користувач вже існує' });
            }

            // Створення нового користувача
            const newUser = await db.query(
                'INSERT INTO users (username, telegram_id) VALUES ($1, $2) RETURNING *',
                [username, telegram_id]
            );

            // Отримання ID новоствореного користувача
            const userId = newUser.rows[0].uid;

            // Знаходження UID для срібла
            const currencyResult = await db.query('SELECT uid FROM currency WHERE name = $1', ['Silver']);
            const currencyUid = currencyResult.rows[0].uid;

            // Додавання початкового балансу
            await db.query(
                'INSERT INTO balance (user_uid, currency_uid, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_uid, currency_uid) DO UPDATE SET quantity = balance.quantity + EXCLUDED.quantity',
                [userId, currencyUid, initialBalance]
            );

            res.json(newUser.rows[0]);
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ message: 'Помилка створення користувача' });
        }
    }

    async getUserIdByTelegramId(req, res) {
        const { telegram_id } = req.params;

        try {
            const user = await db.query('SELECT uid FROM users WHERE telegram_id = $1', [telegram_id]);
            if (user.rows.length > 0) {
                res.json(user.rows[0]);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error retrieving user ID:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getUserBalance(req, res) {
        const { uid } = req.params;

        try {
            const balanceQuery = `
                SELECT c.name AS currency_name, b.quantity
                FROM balance b
                JOIN currency c ON b.currency_uid = c.uid
                WHERE b.user_uid = $1
            `;
            const result = await db.query(balanceQuery, [uid]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No balance found for this user' });
            }

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching user balance:', error);
            res.status(500).json({ message: 'Error fetching user balance' });
        }
    }

    async getUsers(req, res) {
        const users = await db.query('SELECT * FROM users')
        res.json(users.rows)
    }

    async getOneUser(req, res) {
        const uid = req.params.uid
        const users = await db.query('SELECT * FROM users where uid = $1', [uid])
        res.json(users.rows[0])
    }

    async updateUser(req, res) {
           const {uid, name, lastname} = req.body
           const user = await db.query('UPDATE users set name = $1, lastname = $2 where uid = $3 RETURNING *', [name, lastname, uid])
           res.json(user.rows[0])
    }

    async deleteUser(req, res) {
        const uid = req.params.uid
        const user = await db.query('DELETE FROM users where uid = $1', [uid])
        res.json(user.rows[0])
    }
}

module.exports = new UserController();