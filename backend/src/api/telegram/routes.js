import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Инициализация бота
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const code = Math.random().toString(36).substring(7);
    
    try {
        await supabase
            .from('telegram_verify')
            .insert([{
                telegram_chat_id: chatId.toString(),
                verification_code: code,
                created_at: new Date()
            }]);

        bot.sendMessage(chatId, 
            `Bine ai venit la TerriMatch!\n\n` +
            `Codul tău de verificare este: ${code}\n\n` +
            `Te rog introdu acest cod în aplicație pentru a conecta contul tău de Telegram.`
        );
    } catch (error) {
        console.error('Error saving verification code:', error);
        bot.sendMessage(chatId, 'A apărut o eroare. Te rog încearcă din nou.');
    }
});

// Link Telegram account
router.post('/link', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { verificationCode } = req.body;

        // Verifică codul
        const { data: verifyData, error: verifyError } = await supabase
            .from('telegram_verify')
            .select('telegram_chat_id')
            .eq('verification_code', verificationCode)
            .single();

        if (verifyError || !verifyData) {
            return res.status(400).json({ error: 'Cod de verificare invalid' });
        }

        // Actualizează profilul cu ID-ul de Telegram
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ telegram_id: verifyData.telegram_chat_id })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Șterge codul de verificare folosit
        await supabase
            .from('telegram_verify')
            .delete()
            .eq('verification_code', verificationCode);

        // Trimite mesaj de confirmare pe Telegram
        bot.sendMessage(verifyData.telegram_chat_id, 
            'Contul tău a fost conectat cu succes la TerriMatch! Vei primi notificări aici.');

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unlink Telegram account
router.post('/unlink', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Get current telegram_id
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('telegram_id')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        if (profile.telegram_id) {
            // Trimite mesaj de deconectare
            bot.sendMessage(profile.telegram_id, 
                'Contul tău a fost deconectat de la TerriMatch. Nu vei mai primi notificări aici.');
        }

        // Remove telegram_id from profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ telegram_id: null })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;