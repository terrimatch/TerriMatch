import { supabase } from '../config/supabaseClient.js';

// Boost durations in hours
const BOOST_DURATIONS = {
    daily: 24,
    premium: 48,
    super: 72
};

// Boost multipliers for match visibility
const BOOST_MULTIPLIERS = {
    daily: 2,
    premium: 3,
    super: 5
};

export const activateBoost = async (userId, boostType) => {
    try {
        // Get user's profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        // Check if user can use this boost
        if (boostType !== 'daily' && !profile.is_premium) {
            throw new Error('Premium subscription required for this boost type');
        }

        // Check if user has active boost
        if (profile.boost_active_until && new Date(profile.boost_active_until) > new Date()) {
            throw new Error('You already have an active boost');
        }

        // For daily boost, check if used in last 24 hours
        if (boostType === 'daily' && profile.last_boost_at) {
            const lastBoost = new Date(profile.last_boost_at);
            const hoursElapsed = (new Date() - lastBoost) / (1000 * 60 * 60);
            if (hoursElapsed < 24) {
                throw new Error('Daily boost can only be used once every 24 hours');
            }
        }

        // Calculate boost duration
        const duration = BOOST_DURATIONS[boostType];
        const endsAt = new Date();
        endsAt.setHours(endsAt.getHours() + duration);

        // Create boost record
        const { error: boostError } = await supabase
            .from('profile_boosts')
            .insert([{
                profile_id: userId,
                boost_type: boostType,
                ends_at: endsAt
            }]);

        if (boostError) throw boostError;

        // Update profile
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                boost_count: profile.boost_count + 1,
                last_boost_at: new Date(),
                boost_active_until: endsAt
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return {
            success: true,
            endsAt,
            multiplier: BOOST_MULTIPLIERS[boostType]
        };
    } catch (error) {
        console.error('Error activating boost:', error);
        throw error;
    }
};

export const getBoostStatus = async (userId) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('boost_active_until, last_boost_at, is_premium')
            .eq('id', userId)
            .single();

        if (error) throw error;

        const now = new Date();
        const boostActive = profile.boost_active_until && new Date(profile.boost_active_until) > now;
        const canUseDailyBoost = !profile.last_boost_at || 
            (now - new Date(profile.last_boost_at)) / (1000 * 60 * 60) >= 24;

        return {
            boostActive,
            boostEndsAt: profile.boost_active_until,
            canUseDailyBoost,
            canUsePremiumBoost: profile.is_premium,
            canUseSuperBoost: profile.is_premium
        };
    } catch (error) {
        console.error('Error getting boost status:', error);
        throw error;
    }
};

export const applyBoostToMatching = (profiles, boostedProfiles) => {
    // Create a map of boosted profiles with their multipliers
    const boostMap = new Map();
    boostedProfiles.forEach(bp => {
        if (bp.boost_active_until && new Date(bp.boost_active_until) > new Date()) {
            // Calculate remaining boost time percentage
            const timeLeft = new Date(bp.boost_active_until) - new Date();
            const maxDuration = Math.max(...Object.values(BOOST_DURATIONS)) * 60 * 60 * 1000;
            const timeMultiplier = Math.max(0.5, timeLeft / maxDuration);
            
            boostMap.set(bp.id, timeMultiplier);
        }
    });

    // Apply boost to match scores
    return profiles.map(profile => {
        if (boostMap.has(profile.id)) {
            const boostMultiplier = boostMap.get(profile.id);
            return {
                ...profile,
                matchPercentage: Math.min(
                    100,
                    Math.round(profile.matchPercentage * (1 + boostMultiplier))
                )
            };
        }
        return profile;
    });
};
