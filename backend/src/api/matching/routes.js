import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import { applyBoostToMatching } from '../../services/boostService.js';

const router = express.Router();

// Calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

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

        // Get current user's profile and preferences
        const { data: currentUser, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError) throw userError;

        const preferences = currentUser.preferences || {};
        
        // Get already liked or disliked profiles
        const { data: interactions } = await supabase
            .from('likes')
            .select('to_user')
            .eq('from_user', user.id);

        const excludeIds = interactions?.map(i => i.to_user) || [];
        excludeIds.push(user.id); // exclude self

        // Build query based on preferences
        let query = supabase
            .from('profiles')
            .select(`
                id,
                username,
                avatar_url,
                bio,
                gender,
                birth_date,
                interests,
                latitude,
                longitude,
                is_premium,
                boost_active_until
            `)
            .not('id', 'in', excludeIds);

        // Apply filters based on preferences
        if (preferences.gender) {
            query = query.eq('gender', preferences.gender);
        }

        if (preferences.ageRange) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - preferences.ageRange.max);
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - preferences.ageRange.min);
            
            query = query
                .gte('birth_date', minDate.toISOString())
                .lte('birth_date', maxDate.toISOString());
        }

        // Get potential matches
        const { data: potentialMatches, error: matchError } = await query
            .limit(50); // Get more initially to allow for filtering

        if (matchError) throw matchError;

        // Filter by distance and interests
        const filteredMatches = potentialMatches.filter(profile => {
            // Check distance if location is available
            if (currentUser.latitude && currentUser.longitude && profile.latitude && profile.longitude) {
                const distance = calculateDistance(
                    currentUser.latitude,
                    currentUser.longitude,
                    profile.latitude,
                    profile.longitude
                );
                if (distance > (preferences.distance || 50)) {
                    return false;
                }
            }

            // Check interests if specified
            if (preferences.interests && preferences.interests.length > 0 && profile.interests) {
                const commonInterests = profile.interests.filter(
                    interest => preferences.interests.includes(interest)
                );
                if (commonInterests.length === 0) {
                    return false;
                }
            }

            return true;
        });

        // Calculate match percentage for each profile
        const matchesWithScore = filteredMatches.map(profile => {
            let score = 0;
            let factors = 0;

            // Interest matching
            if (preferences.interests && preferences.interests.length > 0 && profile.interests) {
                const commonInterests = profile.interests.filter(
                    interest => preferences.interests.includes(interest)
                );
                score += (commonInterests.length / preferences.interests.length);
                factors++;
            }

            // Distance scoring
            if (currentUser.latitude && currentUser.longitude && profile.latitude && profile.longitude) {
                const distance = calculateDistance(
                    currentUser.latitude,
                    currentUser.longitude,
                    profile.latitude,
                    profile.longitude
                );
                const maxDistance = preferences.distance || 50;
                score += 1 - (distance / maxDistance);
                factors++;
            }

            // Premium users get a small boost
            if (profile.is_premium) {
                score += 0.1;
                factors += 0.5;
            }

            const matchPercentage = factors > 0 
                ? Math.round((score / factors) * 100) 
                : 50;

            return {
                ...profile,
                matchPercentage
            };
        });

        // Get active boosts
        const { data: boostedProfiles } = await supabase
            .from('profiles')
            .select('id, boost_active_until')
            .gt('boost_active_until', new Date().toISOString());

        // Apply boosts and sort
        const finalMatches = applyBoostToMatching(matchesWithScore, boostedProfiles || [])
            .sort((a, b) => b.matchPercentage - a.matchPercentage)
            .slice(0, 20); // Return only top 20 matches

        res.json(finalMatches);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update preferences
router.put('/preferences', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const preferences = req.body;

        // Validate preferences
        if (preferences.ageRange) {
            if (preferences.ageRange.min < 18) {
                return res.status(400).json({ error: 'Minimum age must be 18 or above' });
            }
            if (preferences.ageRange.max < preferences.ageRange.min) {
                return res.status(400).json({ error: 'Maximum age must be greater than minimum age' });
            }
        }

        // Update preferences
        const { data, error } = await supabase
            .from('profiles')
            .update({ preferences })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update location
router.put('/location', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ 
                latitude,
                longitude,
                location_updated_at: new Date()
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
