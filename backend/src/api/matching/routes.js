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

    // Funcție helper pentru calculul scorului
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

    // Calculează scorul final (0-100)
    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 50;
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
                boost_active_until,
                relationship_goals,
                languages,
                height,
                education_level,
                occupation,
                lifestyle
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

// Get detailed compatibility between users
router.get('/compatibility/:profileId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { profileId } = req.params;

        // Get both profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .in('id', [user.id, profileId]);

        if (profilesError) throw profilesError;

        const currentUser = profiles.find(p => p.id === user.id);
        const otherProfile = profiles.find(p => p.id === profileId);

        if (!currentUser || !otherProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        // Calculate detailed compatibility
        const compatibility = {
            overall: calculateMatchScore(currentUser, otherProfile, currentUser.preferences),
            details: {
                interests: {
                    score: 0,
                    common: []
                },
                location: {
                    score: 0,
                    distance: 0
                },
                relationshipGoals: {
                    score: 0,
                    match: false
                },
                languages: {
                    score: 0,
                    common: []
                },
                lifestyle: {
                    score: 0,
                    matches: {}
                }
            }
        };

        // Calculate interests compatibility
        if (currentUser.interests?.length > 0 && otherProfile.interests?.length > 0) {
            const commonInterests = otherProfile.interests.filter(
                interest => currentUser.interests.includes(interest)
            );
            compatibility.details.interests = {
                score: Math.round((commonInterests.length / currentUser.interests.length) * 100),
                common: commonInterests
            };
        }

        // Calculate location compatibility
        if (currentUser.latitude && otherProfile.latitude) {
            const distance = calculateDistance(
                currentUser.latitude,
                currentUser.longitude,
                otherProfile.latitude,
                otherProfile.longitude
            );
            const maxDistance = currentUser.preferences.distance || 50;
            compatibility.details.location = {
                score: Math.round((1 - (distance / maxDistance)) * 100),
                distance: Math.round(distance)
            };
        }

        // Calculate relationship goals compatibility
        if (currentUser.preferences.relationshipGoals?.length > 0) {
            const match = currentUser.preferences.relationshipGoals.includes(
                otherProfile.relationship_goals
            );
            compatibility.details.relationshipGoals = {
                score: match ? 100 : 0,
                match
            };
        }

        // Calculate languages compatibility
        if (currentUser.preferences.languages?.length > 0 && otherProfile.languages?.length > 0) {
            const commonLanguages = otherProfile.languages.filter(
                lang => currentUser.preferences.languages.includes(lang)
            );
            compatibility.details.languages = {
                score: Math.round((commonLanguages.length / currentUser.preferences.languages.length) * 100),
                common: commonLanguages
            };
        }

        // Calculate lifestyle compatibility
        if (currentUser.preferences.lifestyle && otherProfile.lifestyle) {
            const lifestyleMatches = {};
            let matchCount = 0;
            let totalFactors = 0;

            Object.keys(currentUser.preferences.lifestyle).forEach(factor => {
                if (currentUser.preferences.lifestyle[factor] && otherProfile.lifestyle[factor]) {
                    totalFactors++;
                    const matches = currentUser.preferences.lifestyle[factor] === otherProfile.lifestyle[factor];
                    if (matches) matchCount++;
                    lifestyleMatches[factor] = matches;
                }
            });

            compatibility.details.lifestyle = {
                score: totalFactors > 0 ? Math.round((matchCount / totalFactors) * 100
) : 0,
                matches: lifestyleMatches
            };
        }

        // Add educational compatibility
        if (currentUser.preferences.educationLevel?.length > 0 && otherProfile.education_level) {
            compatibility.details.education = {
                score: currentUser.preferences.educationLevel.includes(otherProfile.education_level) ? 100 : 0,
                level: otherProfile.education_level
            };
        }

        // Add height compatibility
        if (currentUser.preferences.heightRange && otherProfile.height) {
            const inRange = otherProfile.height >= currentUser.preferences.heightRange.min && 
                          otherProfile.height <= currentUser.preferences.heightRange.max;
            compatibility.details.height = {
                score: inRange ? 100 : 0,
                height: otherProfile.height,
                preferred: currentUser.preferences.heightRange
            };
        }

        res.json(compatibility);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get match statistics
router.get('/statistics', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Get total matches
        const { count: matchesCount } = await supabase
            .from('matches')
            .select('*', { count: 'exact' })
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        // Get successful conversations (more than 5 messages)
        const { data: conversations } = await supabase
            .from('conversations')
            .select(`
                id,
                messages:messages(count)
            `)
            .eq('status', 'active')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

        const activeConversations = conversations.filter(conv => conv.messages.count > 5).length;

        // Get likes received
        const { count: likesReceived } = await supabase
            .from('likes')
            .select('*', { count: 'exact' })
            .eq('to_user', user.id);

        // Get likes sent
        const { count: likesSent } = await supabase
            .from('likes')
            .select('*', { count: 'exact' })
            .eq('from_user', user.id);

        res.json({
            matches: matchesCount || 0,
            activeConversations: activeConversations || 0,
            likesReceived: likesReceived || 0,
            likesSent: likesSent || 0,
            matchRate: likesSent ? Math.round((matchesCount / likesSent) * 100) : 0
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
