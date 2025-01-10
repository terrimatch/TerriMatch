import TelegramBot from 'node-telegram-bot-api';
import { supabase } from '../config/supabaseClient.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Creăm butonul care va deschide Web App-ul
        const keyboard = {
            inline_keyboard: [[{
                text: "Deschide TerriMatch",
                web_app: {
                    url: process.env.TELEGRAM_WEBAPP_URL // URL-ul aplicației tale
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
        console.error('Telegram start error:', error);
        await bot.sendMessage(chatId, 'Ne pare rău, a apărut o eroare. Te rugăm să încerci din nou.');
    }
});
// Generate verification code
const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Check if it's during quiet hours
const isDuringQuietHours = async (userId) => {
    const { data: settings } = await supabase
        .from('telegram_notification_settings')
        .select('quiet_hours_start, quiet_hours_end')
        .eq('user_id', userId)
        .single();

    if (!settings?.quiet_hours_start || !settings?.quiet_hours_end) {
        return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = new Date('1970-01-01T' + settings.quiet_hours_start).getHours() * 60 +
                     new Date('1970-01-01T' + settings.quiet_hours_start).getMinutes();
    const endTime = new Date('1970-01-01T' + settings.quiet_hours_end).getHours() * 60 +
                   new Date('1970-01-01T' + settings.quiet_hours_end).getMinutes();

    return currentTime >= startTime && currentTime <= endTime;
};

// Initialize bot commands
bot.setMyCommands([
    { command: '/start', description: 'Start and link your account' },
    { command: '/stop', description: 'Unlink your account' },
    { command: '/settings', description: 'Notification settings' },
    { command: '/status', description: 'Check connection status' },
    { command: '/help', description: 'Get help' }
]);

// Handle /start command
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Check if already linked
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('telegram_id', chatId.toString())
            .single();

        if (profile) {
            return bot.sendMessage(chatId, 
                `Your Telegram account is already linked to TerriMatch as ${profile.username}.\n` +
                'Use /status to check your connection or /stop to unlink.'
            );
        }

        // Generate verification code
        const verificationCode = generateVerificationCode();

        // Save verification data
        await supabase
            .from('telegram_verifications')
            .insert([{
                verification_code: verificationCode,
                telegram_chat_id: chatId.toString()
            }]);

        await bot.sendMessage(chatId, 
            'Welcome to TerriMatch! 👋\n\n' +
            'To link your account, enter this code in the TerriMatch app:\n\n' +
            `Code: ${verificationCode}\n\n` +
            'This code will expire in 30 minutes.'
        );
    } catch (error) {
        console.error('Telegram start error:', error);
        await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});

// Handle /stop command
bot.onText(/\/stop/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ 
                telegram_id: null,
                telegram_username: null 
            })
            .eq('telegram_id', chatId.toString());

        if (error) throw error;

        await bot.sendMessage(chatId, 
            'Your account has been unlinked from TerriMatch.\n' +
            'You will no longer receive notifications here.\n\n' +
            'You can always use /start to link your account again!'
        );
    } catch (error) {
        console.error('Telegram stop error:', error);
        await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});

// Handle /settings command
bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('telegram_id', chatId.toString())
            .single();

        if (!profile) {
            return bot.sendMessage(chatId, 
                'Your Telegram account is not linked to TerriMatch.\n' +
                'Use /start to link your account.'
            );
        }

        const { data: settings } = await supabase
            .from('telegram_notification_settings')
            .select('*')
            .eq('user_id', profile.id)
            .single();

        const keyboard = {
            inline_keyboard: [
                [
                    { 
                        text: `New Matches ${settings?.new_matches ? '✅' : '❌'}`,
                        callback_data: 'toggle_new_matches'
                    }
                ],
                [
                    { 
                        text: `New Messages ${settings?.new_messages ? '✅' : '❌'}`,
                        callback_data: 'toggle_new_messages'
                    }
                ],
                [
                    { 
                        text: `Profile Views ${settings?.profile_views ? '✅' : '❌'}`,
                        callback_data: 'toggle_profile_views'
                    }
                ],
                [
                    { 
                        text: `Likes Received ${settings?.likes_received ? '✅' : '❌'}`,
                        callback_data: 'toggle_likes_received'
                    }
                ],
                [
                    { 
                        text: 'Set Quiet Hours',
                        callback_data: 'set_quiet_hours'
                    }
                ]
            ]
        };

        await bot.sendMessage(chatId, 
            'Notification Settings:\n\n' +
            'Tap to toggle notifications:',
            { reply_markup: keyboard }
        );
    } catch (error) {
        console.error('Telegram settings error:', error);
        await bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again later.');
    }
});

// Handle settings callbacks
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const action = callbackQuery.data;

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('telegram_id', chatId.toString())
            .single();

        if (!profile) return;

        if (action.startsWith('toggle_')) {
            const setting = action.replace('toggle_', '');
            const { data: settings } = await supabase
                .from('telegram_notification_settings')
                .update({ [setting]: supabase.raw(`NOT ${setting}`) })
                .eq('user_id', profile.id)
                .select()
                .single();

            // Update keyboard
            const keyboard = {
                inline_keyboard: [
                    [{ 
                        text: `New Matches ${settings.new_matches ? '✅' : '❌'}`,
                        callback_data: 'toggle_new_matches'
                    }],
                    [{ 
                        text: `New Messages ${settings.new_messages ? '✅' : '❌'}`,
                        callback_data: 'toggle_new_messages'
                    }],
                    [{ 
                        text: `Profile Views ${settings.profile_views ? '✅' : '❌'}`,
                        callback_data: 'toggle_profile_views'
                    }],
                    [{ 
                        text: `Likes Received ${settings.likes_received ? '✅' : '❌'}`,
                        callback_data: 'toggle_likes_received'
                    }],
                    [{
                        text: 'Set Quiet Hours',
                        callback_data: 'set_quiet_hours'
                    }]
                ]
            };

            await bot.editMessageReplyMarkup(keyboard, {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id
            });
        }
    } catch (error) {
        console.error('Telegram callback error:', error);
    }
});

// Export notification functions
export const sendTelegramNotification = async (userId, text, type = 'system') => {
    try {
        // Get user's telegram ID and notification settings
        const { data: profile } = await supabase
            .from('profiles')
            .select(`
                telegram_id,
                telegram_notification_settings!inner(*)
            `)
            .eq('id', userId)
            .single();

        if (!profile?.telegram_id || !profile.telegram_notification_settings[type]) {
            return;
        }

        // Check quiet hours
        if (await isDuringQuietHours(userId)) {
            return;
        }

        await bot.sendMessage(profile.telegram_id, text);
    } catch (error) {
        console.error('Send telegram notification error:', error);
    }
};

export const notifyNewMatch = async (userId, matchedUser) => {
    await sendTelegramNotification(
        userId,
        `🎉 You have a new match with ${matchedUser.username}!\n\n` +
        'Open TerriMatch to start chatting.',
        'new_matches'
    );
};

export const notifyNewMessage = async (userId, sender, messagePreview) => {
    await sendTelegramNotification(
        userId,
        `💌 New message from ${sender.username}:\n\n` +
        `${messagePreview}\n\n` +
        'Open TerriMatch to reply.',
        'new_messages'
    );
};

export const notifyProfileView = async (userId, viewer) => {
    await sendTelegramNotification(
        userId,
        `👀 ${viewer.username} viewed your profile!`,
        'profile_views'
    );
};

export const notifyLikeReceived = async (userId, liker) => {
    await sendTelegramNotification(
        userId,
        `❤️ ${liker.username} liked your profile!`,
        'likes_received'
    );
};

export default bot;
