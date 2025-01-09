import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import { activateBoost, getBoostStatus } from '../../services/boostService.js';

const router = express.Router();

// Get boost status
router.get('/status', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const status = await getBoostStatus(user.id);
        res.json(status);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Activate boost
router.post('/activate', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { boostType } = req.body;

        if (!['daily', 'premium', 'super'].includes(boostType)) {
            return res.status(400).json({ error: 'Invalid boost type' });
        }

        const result = await activateBoost(user.id, boostType);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get boost history
router.get('/history', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: boosts, error } = await supabase
            .from('profile_boosts')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(boosts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
