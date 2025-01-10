import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    webHook: true
});

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const keyboard = {
            inline_keyboard: [[{
                text: "Deschide TerriMatch",
                web_app: {
                    url: process.env.TELEGRAM_WEBAPP_URL
                }
            }]]
        };

        await bot.sendMessage(chatId, 
            'Bine ai venit la TerriMatch! 👋\n\n' +
            'Apasă butonul de mai jos pentru a deschide aplicația:',
            {
                reply_markup: keyboard
            }
        );
    } catch (error) {
        console.error('Error:', error);
    }
});

export default bot;
