import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import bot from '../../services/telegramService.js';

const router = express.Router();

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

        if (!verificationCode) {
            return res.status(400).json({ error: 'Verification code is required' });
        }

        // Get verification data
        const { data: verification, error: verifyError } = await supabase
            .from('telegram_verifications')
            .select('*')
            .eq('verification_code', verificationCode)
            .eq('verified', false)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (verifyError || !verification) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        // Check if telegram_id is already linked to another account
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('telegram_id', verification.telegram_chat_id)
            .single();

        if (existingProfile && existingProfile.id !== user.id) {
            return res.status(400).json({ 
                error: 'This Telegram account is already linked to another user' 
            });
        }

        // Update profile with telegram info
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                telegram_id: verification.telegram_chat_id,
                telegram_username: verification.telegram_username
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Create default notification settings
        const { error: settingsError } = await supabase
            .from('telegram_notification_settings')
            .upsert({
                user_id: user.id,
                new_matches: true,
                new_messages: true,
                profile_views: true,
                likes_received: true,
                system_notifications: true
            });

        if (settingsError) throw settingsError;

        // Mark verification as used
        await supabase
            .from('telegram_verifications')
            .update({ verified: true })
            .eq('id', verification.id);

        // Send confirmation message on Telegram
        await bot.sendMessage(verification.telegram_chat_id,
            '✅ Your Telegram account has been successfully linked to TerriMatch!\n\n' +
            'You will now receive notifications here.\n' +
            'Use /settings to customize your notifications.'
        );

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

        // Get current telegram_id before unlinking
        const { data: profile } = await supabase
            .from('profiles')
            .select('telegram_id')
            .eq('id', user.id)
            .single();

        if (profile?.telegram_id) {
            // Send notification on Telegram
            await bot.sendMessage(profile.telegram_id,
                'Your account has been unlinked from TerriMatch.\n' +
                'You will no longer receive notifications here.\n\n' +
                'Use /start to link your account again!'
            );
        }

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                telegram_id: null,
                telegram_username: null
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update notification settings
router.put('/settings', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const settings = req.body;

        // Validate quiet hours format if provided
        if (settings.quiet_hours_start && settings.quiet_hours_end) {
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(settings.quiet_hours_start) || !timeRegex.test(settings.quiet_hours_end)) {
                return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
            }
        }

        // Update settings
        const { data: updatedSettings, error } = await supabase
            .from('telegram_notification_settings')
            .upsert({
                user_id: user.id,
                ...settings,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        res.json(updatedSettings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get notification settings
router.get('/settings', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: settings, error } = await supabase
            .from('telegram_notification_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(settings || {
            new_matches: true,
            new_messages: true,
            profile_views: true,
            likes_received: true,
            system_notifications: true
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get connection status
router.get('/status', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: profile } = await supabase
            .from('profiles')
            .select(`
                telegram_id,
                telegram_username,
                telegram_notification_settings(*)
            `)
            .eq('id', user.id)
            .single();

        res.json({
            connected: !!profile?.telegram_id,
            telegram_username: profile?.telegram_username,
            settings: profile?.telegram_notification_settings
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
