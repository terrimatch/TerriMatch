const { supabase } = require('../config/supabase');
const notificationService = require('./notificationService');

class ChatService {
    async createMessage(matchId, senderId, content) {
        try {
            // Verifică dacă match-ul există și utilizatorul face parte din el
            const { data: match } = await supabase
                .from('matches')
                .select('*')
                .eq('id', matchId)
                .single();

            if (!match || (match.user1_id !== senderId && match.user2_id !== senderId)) {
                throw new Error('Match invalid sau acces neautorizat');
            }

            // Creează mesajul
            const { data: message, error } = await supabase
                .from('messages')
                .insert({
                    match_id: matchId,
                    sender_id: senderId,
                    content,
                    created_at: new Date()
                })
                .single();

            if (error) throw error;

            // Determină destinatarul
            const recipientId = match.user1_id === senderId ? match.user2_id : match.user1_id;

            // Trimite notificare
            await notificationService.createNotification(
                recipientId,
                'new_message',
                'Ai primit un mesaj nou!',
                { matchId, messageId: message.id }
            );

            return message;
        } catch (error) {
            console.error('Error in chat service:', error);
            throw error;
        }
    }

    async getMessages(matchId, limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id (
                        id,
                        first_name,
                        last_name
                    )
                `)
                .eq('match_id', matchId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async markMessagesAsRead(matchId, userId) {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ read: true, read_at: new Date() })
                .match({ match_id: matchId })
                .neq('sender_id', userId)
                .eq('read', false);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    async getUnreadMessagesCount(userId) {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('read', false)
                .neq('sender_id', userId);

            if (error) throw error;
            return data.length;
        } catch (error) {
            console.error('Error counting unread messages:', error);
            throw error;
        }
    }

    // Subscriberi pentru real-time updates
    subscribeToMessages(matchId, callback) {
        return supabase
            .channel(`messages:${matchId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `match_id=eq.${matchId}`
            }, payload => {
                callback(payload.new);
            })
            .subscribe();
    }
}

module.exports = new ChatService();
