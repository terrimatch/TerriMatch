import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import { createSystemNotification } from '../../services/notificationService.js';

const router = express.Router();

// Ban user
router.post('/ban/:userId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Verify moderator status
        const { data: moderator, error: modError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (modError || moderator.role !== 'moderator') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { userId } = req.params;
        const { reason, duration } = req.body;

        // Update user status
        const { data: bannedUser, error } = await supabase
            .from('profiles')
            .update({
                status: 'banned',
                banned_until: duration ? new Date(Date.now() + duration) : null,
                banned_reason: reason,
                banned_by: user.id
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Create system notification
        await createSystemNotification(
            userId,
            'Account Banned',
            `Your account has been banned. Reason: ${reason}`
        );

        res.json(bannedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unban user
router.post('/unban/:userId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Verify moderator status
        const { data: moderator, error: modError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (modError || moderator.role !== 'moderator') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { userId } = req.params;

        // Update user status
        const { data: unbannedUser, error } = await supabase
            .from('profiles')
            .update({
                status: 'active',
                banned_until: null,
                banned_reason: null,
                banned_by: null
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Create system notification
        await createSystemNotification(
            userId,
            'Account Unbanned',
            'Your account has been unbanned. You can now use the platform again.'
        );

        res.json(unbannedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get moderation stats
router.get('/stats', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Verify moderator status
        const { data: moderator, error: modError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (modError || moderator.role !== 'moderator') {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get various stats
        const { data: stats, error } = await supabase
            .rpc('get_moderation_stats');

        if (error) throw error;

        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;