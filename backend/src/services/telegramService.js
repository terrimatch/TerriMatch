import TelegramBot from 'node-telegram-bot-api';
import { supabase } from '../config/supabaseClient.js';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

export const sendTelegramNotification = async (userId, message) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('telegram_id')
            .eq('id', userId)
            .single();

        if (error) throw error;

        if (profile?.telegram_id) {
            await bot.sendMessage(profile.telegram_id, message);
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
};

export const notifyMatch = async (user1Id, user2Id) => {
    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, telegram_id')
            .in('id', [user1Id, user2Id]);

        if (error) throw error;

        const user1 = profiles.find(p => p.id === user1Id);
        const user2 = profiles.find(p => p.id === user2Id);

        if (user1?.telegram_id) {
            await bot.sendMessage(user1.telegram_id,
                `🎉 Ai un nou match cu ${user2.username}! \n\n` +
                `Începe o conversație pentru a vă cunoaște mai bine!`
            );
        }

        if (user2?.telegram_id) {
            await bot.sendMessage(user2.telegram_id,
                `🎉 Ai un nou match cu ${user1.username}! \n\n` +
                `Începe o conversație pentru a vă cunoaște mai bine!`
            );
        }
    } catch (error) {
        console.error('Error sending match notification:', error);
    }
};

export const notifyNewMessage = async (recipientId, senderName) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('telegram_id')
            .eq('id', recipientId)
            .single();

        if (error) throw error;

        if (profile?.telegram_id) {
            await bot.sendMessage(profile.telegram_id,
                `💌 Ai un mesaj nou de la ${senderName}!`
            );
        }
    } catch (error) {
        console.error('Error sending message notification:', error);
    }
};