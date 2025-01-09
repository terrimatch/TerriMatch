import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import webpush from 'web-push';

const router = express.Router();

// Configure web-push
webpush.setVapidDetails(
    'mailto:' + process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Save push subscription
router.post('/subscribe', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const subscription = req.body;

        // Save subscription to database
        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                subscription: subscription,
                updated_at: new Date()
            });

        if (error) throw error;

        res.json({ message: 'Successfully subscribed to push notifications' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;

        res.json({ message: 'Successfully unsubscribed from push notifications' });
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

        const { data, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json(data || {
            messages: true,
            matches: true,
            system: true
        });
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

        const { data, error } = await supabase
            .from('notification_settings')
            .upsert({
                user_id: user.id,
                ...settings,
                updated_at: new Date()
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
