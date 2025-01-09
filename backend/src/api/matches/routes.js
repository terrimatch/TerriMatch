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

        // Get user preferences
        const { data: currentUser, error: userError } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

        if (userError) throw userError;

        // Get users who haven't been liked or matched yet
        const { data: potentialMatches, error: matchError } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                bio,
                avatar_url,
                location,
                interests,
                created_at
            `)
            .neq('id', user.id)
            .not('id', 'in', (
                supabase
                    .from('likes')
                    .select('to_user_id')
                    .eq('from_user_id', user.id)
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

        // Check if already liked
        const { data: existingLike, error: likeError } = await supabase
            .from('likes')
            .select('*')
            .eq('from_user_id', user.id)
            .eq('to_user_id', profileId)
            .single();

        if (existingLike) {
            return res.status(400).json({ error: 'Profile already liked' });
        }

        // Add like
        const { error: newLikeError } = await supabase
            .from('likes')
            .insert([{
                from_user_id: user.id,
                to_user_id: profileId
            }]);

        if (newLikeError) throw newLikeError;

        // Check if it's a match
        const { data: matchData, error: matchCheckError } = await supabase
            .from('likes')
            .select('*')
            .eq('from_user_id', profileId)
            .eq('to_user_id', user.id)
            .single();

        if (matchCheckError && matchCheckError.code !== 'PGRST116') {
            throw matchCheckError;
        }

        if (matchData) {
            // It's a match! Create match record
            const { data: match, error: createMatchError } = await supabase
                .from('matches')
                .insert([{
                    user1_id: user.id,
                    user2_id: profileId,
                    status: 'active'
                }])
                .select()
                .single();

            if (createMatchError) throw createMatchError;

            // Create chat conversation
            const { error: chatError } = await supabase
                .from('conversations')
                .insert([{
                    match_id: match.id
                }]);

            if (chatError) throw chatError;

            return res.json({ match: true, matchData: match });
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
                user1:user1_id(id, username, avatar_url),
                user2:user2_id(id, username, avatar_url),
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

        // Verify user is part of the match
        const { data: match, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .single();

        if (matchError || !match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Update match status
        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'ended' })
            .eq('id', matchId);

        if (updateError) throw updateError;

        res.json({ message: 'Successfully unmatched' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
