import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import { createSystemNotification } from '../../services/notificationService.js';

const router = express.Router();

// Create a report
router.post('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { reportedUserId, reason, details } = req.body;

        // Verify reported user exists
        const { data: reportedUser, error: userError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', reportedUserId)
            .single();

        if (userError || !reportedUser) {
            return res.status(404).json({ error: 'Reported user not found' });
        }

        // Create report
        const { data: report, error } = await supabase
            .from('reports')
            .insert([{
                reporter_id: user.id,
                reported_user_id: reportedUserId,
                reason,
                details,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // Notify moderators
        await createSystemNotification(
            'moderator', // You'll need to handle this appropriately
            'New User Report',
            `A new report has been submitted against user ${reportedUser.username}`
        );

        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get reports (for moderators)
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Verify user is a moderator
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile.role !== 'moderator') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { status } = req.query;

        let query = supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reports_reporter_id_fkey(username),
                reported_user:profiles!reports_reported_user_id_fkey(username)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data: reports, error } = await query;

        if (error) throw error;

        res.json(reports);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update report status (for moderators)
router.put('/:reportId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Verify user is a moderator
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile.role !== 'moderator') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { reportId } = req.params;
        const { status, moderator_notes } = req.body;

        const { data: report, error } = await supabase
            .from('reports')
            .update({
                status,
                moderator_notes,
                moderator_id: user.id,
                resolved_at: status === 'resolved' ? new Date() : null
            })
            .eq('id', reportId)
            .select()
            .single();

        if (error) throw error;

        res.json(report);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});