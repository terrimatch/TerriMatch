import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { supabase } from '../../config/supabase.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Link Telegram account
router.post('/link', auth, async (req, res) => {
  try {
    const { telegramId } = req.body;
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ telegram_id: telegramId })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;

    // Send welcome message to Telegram user
    await bot.sendMessage(telegramId, 
      'Your Telegram account has been successfully linked to TerriMatch! ' +
      'You will now receive notifications here.');

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unlink Telegram account
router.post('/unlink', auth, async (req, res) => {
  try {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('user_id', req.userId)
      .single();

    if (currentProfile?.telegram_id) {
      await bot.sendMessage(currentProfile.telegram_id, 
        'Your Telegram account has been unlinked from TerriMatch.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ telegram_id: null })
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send test notification
router.post('/test-notification', auth, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('telegram_id')
      .eq('user_id', req.userId)
      .single();

    if (!profile?.telegram_id) {
      return res.status(400).json({ 
        error: 'No Telegram account linked' 
      });
    }

    await bot.sendMessage(profile.telegram_id, 
      'This is a test notification from TerriMatch! 👋');

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
