const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/user.routes');
const currencyRouter = require('./routes/currency.routes');
const balanceRouter = require('./routes/balance.routes');
const exchangeRouter = require('./routes/exchange.routes');

const TelegramBot = require('node-telegram-bot-api');

const PORT = process.env.PORT || 8080;
const app = express();

const token =  // todo - замінити token бота
const webAppUrl = 'https://musical-pie-930603.netlify.app';
const apiUrl =  // todo - замінити url

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        const username = msg.from.username;
        const telegram_id = msg.from.id;
        const fetch = await import('node-fetch').then(module => module.default);
        console.log(msg.from);
        try {
            await fetch(`${apiUrl}/api/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, telegram_id })
            });
        } catch (error) {
            console.error('Error registering user:', error);
        }

        await bot.sendMessage(chatId, 'Профіль', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Ваш профіль', web_app: { url: webAppUrl } }]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Сторінка торгівлі', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Перейти на сторінку торгівлі', web_app: { url: webAppUrl + '/product' } }]
                ]
            }
        });
    }
});

app.use(cors());
app.use(express.json());
app.use('/api', userRouter);
app.use('/api', currencyRouter);
app.use('/api', balanceRouter);
app.use('/api', exchangeRouter);

app.listen(PORT, () => console.log(`server started on port ${PORT}`));
