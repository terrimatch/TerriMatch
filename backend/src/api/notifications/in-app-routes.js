import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Get user's in-app notifications
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Get unread notifications first, then read ones, limit to 50 total
        const { data: notifications, error } = await supabase
            .from('in_app_notifications')
            .select(`
                *,
                sender:profiles!sender_id(
                    id,
                    username,
                    avatar_url
                )
            `)
            .eq('recipient_id', user.id)
            .order('read', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(notifications);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { notificationId } = req.params;

        const { data, error } = await supabase
            .from('in_app_notifications')
            .update({ 
                read: true,
                read_at: new Date()
            })
            .eq('id', notificationId)
            .eq('recipient_id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { error } = await supabase
            .from('in_app_notifications')
            .update({ 
                read: true,
                read_at: new Date()
            })
            .eq('recipient_id', user.id)
            .eq('read', false);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { notificationId } = req.params;

        const { error } = await supabase
            .from('in_app_notifications')
            .delete()
            .eq('id', notificationId)
            .eq('recipient_id', user.id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get unread notification count
router.get('/unread-count', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { count, error } = await supabase
            .from('in_app_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('read', false);

        if (error) throw error;

        res.json({ count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
