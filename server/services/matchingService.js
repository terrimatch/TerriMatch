const { supabase } = require('../config/supabase');
const notificationService = require('./notificationService');

class MatchingService {
    async createLike(fromUserId, toUserId) {
        try {
            // Verifică dacă like-ul există deja
            const { data: existingLike } = await supabase
                .from('likes')
                .select('*')
                .eq('from_user_id', fromUserId)
                .eq('to_user_id', toUserId)
                .single();

            if (existingLike) {
                return { status: 'already_exists', like: existingLike };
            }

            // Creează noul like
            const { data: like, error } = await supabase
                .from('likes')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    created_at: new Date()
                })
                .single();

            if (error) throw error;

            // Verifică dacă există un match
            const { data: mutualLike } = await supabase
                .from('likes')
                .select('*')
                .eq('from_user_id', toUserId)
                .eq('to_user_id', fromUserId)
                .single();

            if (mutualLike) {
                // Creează match
                const { data: match, error: matchError } = await supabase
                    .from('matches')
                    .insert({
                        user1_id: fromUserId,
                        user2_id: toUserId,
                        created_at: new Date()
                    })
                    .single();

                if (matchError) throw matchError;

                // Notifică ambii utilizatori
                await notificationService.createNotification(
                    fromUserId,
                    'new_match',
                    'Ai un nou match! 🎉'
                );
                await notificationService.createNotification(
                    toUserId,
                    'new_match',
                    'Ai un nou match! 🎉'
                );

                return { status: 'match_created', match, like };
            }

            // Notifică utilizatorul care a primit like-ul
            await notificationService.createNotification(
                toUserId,
                'new_like',
                'Cineva ți-a apreciat profilul! 👍'
            );

            return { status: 'like_created', like };
        } catch (error) {
            console.error('Error in matching service:', error);
            throw error;
        }
    }

    async getMatches(userId) {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    id,
                    created_at,
                    user1:user1_id (id, first_name, last_name),
                    user2:user2_id (id, first_name, last_name)
                `)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching matches:', error);
            throw error;
        }
    }

    async getLikes(userId) {
        try {
            const { data, error } = await supabase
                .from('likes')
                .select(`
                    id,
                    created_at,
                    from_user:from_user_id (id, first_name, last_name),
                    to_user:to_user_id (id, first_name, last_name)
                `)
                .eq('to_user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching likes:', error);
            throw error;
        }
    }
}

module.exports = new MatchingService();
