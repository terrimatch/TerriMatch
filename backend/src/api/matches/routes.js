import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Get potential matches
router.get('/potential', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Get user's preferences first
        const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        // Get users that match preferences and haven't been liked/disliked
        const { data: potentialMatches, error: matchError } = await supabase
            .from('profiles')
            .select('id, username, bio, avatar_url, location, interests')
            .neq('id', user.id)
            .not('id', 'in', (
                supabase
                    .from('likes')
                    .select('to_user')
                    .eq('from_user', user.id)
            ))
            .limit(20);

        if (matchError) throw matchError;

        res.json(potentialMatches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like a profile
router.post('/like/:profileId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { profileId } = req.params;

        // Add like
        const { error: likeError } = await supabase
            .from('likes')
            .insert([
                { 
                    from_user: user.id,
                    to_user: profileId
                }
            ]);

        if (likeError) throw likeError;

        // Check if it's a match
        const { data: matchData, error: matchCheckError } = await supabase
            .from('likes')
            .select('*')
            .eq('from_user', profileId)
            .eq('to_user', user.id)
            .single();

        if (matchCheckError && matchCheckError.code !== 'PGRST116') {
            throw matchCheckError;
        }

        if (matchData) {
            // It's a match! Create a match record
            const { data: match, error: createMatchError } = await supabase
                .from('matches')
                .insert([
                    {
                        user1_id: user.id,
                        user2_id: profileId,
                        status: 'active'
                    }
                ])
                .select()
                .single();

            if (createMatchError) throw createMatchError;

            // Create a conversation for the match
            const { error: convError } = await supabase
                .from('conversations')
                .insert([
                    {
                        match_id: match.id
                    }
                ]);

            if (convError) throw convError;

            return res.json({ 
                match: true, 
                matchData: match 
            });
        }

        res.json({ match: false });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get my matches
router.get('/my-matches', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select(`
                *,
                user1:profiles!matches_user1_id_fkey(
                    id, username, avatar_url
                ),
                user2:profiles!matches_user2_id_fkey(
                    id, username, avatar_url
                ),
                conversations(id, last_message, last_message_at)
            `)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (matchError) throw matchError;

        res.json(matches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unmatch
router.post('/unmatch/:matchId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { matchId } = req.params;

        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'ended' })
            .eq('id', matchId)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        if (updateError) throw updateError;

        res.json({ message: 'Unmatched successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;