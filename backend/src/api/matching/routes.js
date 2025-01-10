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

const calculateMatchScore = (currentUser, profile, preferences) => {
    let totalScore = 0;
    let totalWeight = 0;

    // Helper function for adding weighted scores
    const addScore = (score, weight) => {
        totalScore += score * weight;
        totalWeight += weight;
    };

    // 1. Interese comune (weight: 3)
    if (preferences.interests?.length > 0 && profile.interests?.length > 0) {
        const commonInterests = profile.interests.filter(
            interest => preferences.interests.includes(interest)
        );
        const interestScore = commonInterests.length / preferences.interests.length;
        addScore(interestScore, 3);
    }

    // 2. Locație/Distanță (weight: 2.5)
    if (currentUser.latitude && currentUser.longitude && profile.latitude && profile.longitude) {
        const distance = calculateDistance(
            currentUser.latitude,
            currentUser.longitude,
            profile.latitude,
            profile.longitude
        );
        const maxDistance = preferences.distance || 50;
        const distanceScore = 1 - (distance / maxDistance);
        addScore(distanceScore, 2.5);
    }

    // 3. Obiective relaționale (weight: 4)
    if (preferences.relationshipGoals?.length > 0 && profile.relationship_goals) {
        const goalScore = preferences.relationshipGoals.includes(profile.relationship_goals) ? 1 : 0;
        addScore(goalScore, 4);
    }

    // 4. Limbi comune (weight: 2)
    if (preferences.languages?.length > 0 && profile.languages?.length > 0) {
        const commonLanguages = profile.languages.filter(
            lang => preferences.languages.includes(lang)
        );
        const languageScore = commonLanguages.length / preferences.languages.length;
        addScore(languageScore, 2);
    }

    // 5. Înălțime (weight: 1)
    if (preferences.heightRange && profile.height) {
        const heightInRange = profile.height >= preferences.heightRange.min && 
                            profile.height <= preferences.heightRange.max;
        addScore(heightInRange ? 1 : 0, 1);
    }

    // 6. Educație (weight: 2)
    if (preferences.educationLevel?.length > 0 && profile.education_level) {
        const educationScore = preferences.educationLevel.includes(profile.education_level) ? 1 : 0;
        addScore(educationScore, 2);
    }

    // 7. Stil de viață (weight: 2.5)
    if (preferences.lifestyle && profile.lifestyle) {
        let lifestyleMatches = 0;
        let lifestyleFactors = 0;
        
        const factors = ['smoking', 'drinking', 'exercise', 'diet'];
        factors.forEach(factor => {
            if (preferences.lifestyle[factor] && profile.lifestyle[factor]) {
                lifestyleFactors++;
                if (preferences.lifestyle[factor] === profile.lifestyle[factor]) {
                    lifestyleMatches++;
                }
            }
        });
        
        if (lifestyleFactors > 0) {
            const lifestyleScore = lifestyleMatches / lifestyleFactors;
            addScore(lifestyleScore, 2.5);
        }
    }

    // 8. Premium status bonus (weight: 0.5)
    if (profile.is_premium) {
        addScore(1, 0.5);
    }

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 50;
};

// Helper function for sorting
function getSortColumn(sortBy) {
    switch (sortBy) {
        case 'newest':
            return 'created_at';
        case 'lastActive':
            return 'last_active';
        case 'likes':
            return 'likes_count';
        default:
            return 'created_at';
    }
}

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
                boost_active_until,
                relationship_goals,
                languages,
                height,
                education_level,
                occupation,
                lifestyle
            `)
            .not('id', 'in', excludeIds);

        // Apply basic filters from preferences
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
        const { data: potentialMatches, error: matchError } = await query.limit(50);

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
        const matchesWithScore = filteredMatches.map(profile => ({
            ...profile,
            matchPercentage: calculateMatchScore(currentUser, profile, preferences)
        }));

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

// Advanced search
router.post('/search', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const {
            ageRange,
            distance,
            gender,
            interests,
            languages,
            heightRange,
            educationLevel,
            relationshipGoals,
            lifestyle,
            isOnline,
            hasPhotos,
            isPremium,
            lastActive,
            keyword,
            sortBy = 'relevance',
            page = 1,
            limit = 20
        } = req.body;

        // Get current user's location for distance calculation
        const { data: currentUser } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Start building the query
        let query = supabase
            .from('profiles')
            .select(`
                *,
                likes:likes(count)
            `)
            .neq('id', user.id);

        // Apply all filters
        if (gender) query = query.eq('gender', gender);
        if (ageRange) {
            const minDate = new Date();
            minDate.setFullYear(minDate.getFullYear() - ageRange.max);
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() - ageRange.min);
            query = query
                .gte('birth_date', minDate.toISOString())
                .lte('birth_date', maxDate.toISOString());
        }
        if (heightRange) {
            query = query
                .gte('height', heightRange.min)
                .lte('height', heightRange.max);
        }
        if (educationLevel) {
            query = query.in('education_level', Array.isArray(educationLevel) ? educationLevel : [educationLevel]);
        }
        if (relationshipGoals) {
            query = query.in('relationship_goals', Array.isArray(relationshipGoals) ? relationshipGoals : [relationshipGoals]);
        }
        if (languages) query = query.contains('languages', languages);
        if (interests) query = query.contains('interests', interests);
        if (hasPhotos) query = query.not('avatar_url', 'is', null);
        if (isPremium) query = query.eq('is_premium', true);
        if (lastActive) {
            const timeAgo = new Date(Date.now() - lastActive * 60 * 60 * 1000).toISOString();
            query = query.gte('last_active', timeAgo);
        }
        if (keyword) {
            query = query.or(`username.ilike.%${keyword}%,bio.ilike.%${keyword}%`);
        }

        // Get results with pagination
        const { data: profiles, error, count } = await query
            .order(getSortColumn(sortBy), { ascending: sortBy !== 'likes' })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        // Post-process results
        let results = profiles;

        // Apply distance filter if specified
        if (distance && currentUser.latitude && currentUser.longitude) {
            results = profiles.filter(profile => {
                if (!profile.latitude || !profile.longitude) return false;
                const dist = calculateDistance(
                    currentUser.latitude,
                    currentUser.longitude,
                    profile.latitude,
                    profile.longitude
                );
                return dist <= distance;
            });
        }

        // Add distance and match percentage to results
        results = results.map(profile =>
         => ({
            ...profile,
            distance: currentUser.latitude && profile.latitude ? 
                Math.round(calculateDistance(
                    currentUser.latitude,
                    currentUser.longitude,
                    profile.latitude,
                    profile.longitude
                )) : null,
            matchPercentage: calculateMatchScore(currentUser, profile, currentUser.preferences)
        }));

        // Final sorting based on sortBy parameter
        if (sortBy === 'distance' && currentUser.latitude) {
            results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        } else if (sortBy === 'matchPercentage') {
            results.sort((a, b) => b.matchPercentage - a.matchPercentage);
        }

        res.json({
            results,
            pagination: {
                page,
                totalPages: Math.ceil(count / limit),
                totalResults: count,
                hasMore: page * limit < count
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Save search filter
router.post('/filters', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { name, filter_data, is_default = false } = req.body;

        if (!name || !filter_data) {
            return res.status(400).json({ error: 'Name and filter data are required' });
        }

        // If this is set as default, remove default flag from other filters
        if (is_default) {
            await supabase
                .from('saved_filters')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('is_default', true);
        }

        // Save new filter
        const { data: savedFilter, error: saveError } = await supabase
            .from('saved_filters')
            .insert([{
                user_id: user.id,
                name,
                filter_data,
                is_default
            }])
            .select()
            .single();

        if (saveError) throw saveError;

        res.status(201).json(savedFilter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get saved filters
router.get('/filters', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: filters, error } = await supabase
            .from('saved_filters')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(filters);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update saved filter
router.put('/filters/:filterId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { filterId } = req.params;
        const { name, filter_data, is_default } = req.body;

        // If setting as default, remove default from others
        if (is_default) {
            await supabase
                .from('saved_filters')
                .update({ is_default: false })
                .eq('user_id', user.id)
                .eq('is_default', true);
        }

        const { data: updatedFilter, error } = await supabase
            .from('saved_filters')
            .update({
                name,
                filter_data,
                is_default,
                updated_at: new Date()
            })
            .eq('id', filterId)
            .eq('user_id', user.id)  // Ensure user owns the filter
            .select()
            .single();

        if (error) throw error;

        res.json(updatedFilter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete saved filter
router.delete('/filters/:filterId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { filterId } = req.params;

        const { error } = await supabase
            .from('saved_filters')
            .delete()
            .eq('id', filterId)
            .eq('user_id', user.id);  // Ensure user owns the filter

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
