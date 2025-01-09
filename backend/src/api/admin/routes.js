import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Middleware to check if user is admin/moderator
const checkModeratorAccess = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !['admin', 'moderator'].includes(profile.role)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        req.moderator = user;
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// Get dashboard overview stats
router.get('/overview', checkModeratorAccess, async (req, res) => {
    try {
        const [
            usersResult,
            reportsResult,
            matchesResult,
            activeUsersResult
        ] = await Promise.all([
            supabase.from('profiles').select('count'),
            supabase.from('reports').select('count'),
            supabase.from('matches').select('count'),
            supabase.from('profiles')
                .select('count')
                .gte('last_active', new Date(Date.now() - 24*60*60*1000).toISOString())
        ]);

        const stats = {
            totalUsers: usersResult.data[0].count,
            totalReports: reportsResult.data[0].count,
            totalMatches: matchesResult.data[0].count,
            activeUsers24h: activeUsersResult.data[0].count
        };

        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get recent reports
router.get('/recent-reports', checkModeratorAccess, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select(`
                *,
                reporter:profiles!reports_reporter_id_fkey(username),
                reported_user:profiles!reports_reported_user_id_fkey(username)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user activity graph data
router.get('/activity-graph', checkModeratorAccess, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
            .from('user_activity_logs')
            .select('activity_date, count')
            .gte('activity_date', startDate.toISOString())
            .order('activity_date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get reported users
router.get('/reported-users', checkModeratorAccess, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                email,
                status,
                reports:reports(count)
            `)
            .gt('reports.count', 0)
            .order('reports.count', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user status (ban/unban/warn)
router.put('/user-status/:userId', checkModeratorAccess, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, reason, duration } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({
                status,
                banned_reason: reason,
                banned_until: duration ? new Date(Date.now() + duration * 1000) : null,
                banned_by: req.moderator.id
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;