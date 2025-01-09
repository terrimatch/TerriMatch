import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import fileUpload from 'express-fileupload';

const router = express.Router();

// Get my profile
router.get('/me', async (req, res) => {
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
            .select(`
                *,
                matches:matches(count),
                likes_received:likes(count)
            `)
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        res.json(profile);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Update profile
router.put('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const updates = req.body;
        const allowedFields = ['username', 'bio', 'location', 'interests', 'preferences'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...filteredUpdates,
                updated_at: new Date()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Upload profile picture
router.post('/avatar', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        if (!req.files || !req.files.avatar) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.files.avatar;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ error: 'Invalid file type. Only JPEG and PNG allowed.' });
        }

        const filename = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filename, file.data, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filename);

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
                avatar_url: publicUrl,
                updated_at: new Date()
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        res.json({ url: publicUrl });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get profile by ID (for viewing other profiles)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Don't allow viewing own profile through this endpoint
        if (id === user.id) {
            return res.status(400).json({ error: 'Use /me endpoint for own profile' });
        }

        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                bio,
                avatar_url,
                location,
                interests,
                created_at,
                matches:matches(count)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Check if there's a match between the users
        const { data: matchData } = await supabase
            .from('matches')
            .select('*')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .or(`user1_id.eq.${id},user2_id.eq.${id}`)
            .single();

        profile.isMatch = !!matchData;

        res.json(profile);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update profile preferences
router.put('/preferences', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { preferences } = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update({
                preferences,
                updated_at: new Date()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
