const { supabase } = require('../config/supabase');

class SignalService {
    constructor() {
        this.activeConnections = new Map();
    }

    // Gestionează primirea ofertei pentru apel video
    async handleOffer(fromUserId, toUserId, offer) {
        try {
            // Salvează oferta în baza de date
            const { data, error } = await supabase
                .from('video_signals')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    offer: offer,
                    type: 'offer',
                    created_at: new Date()
                });

            if (error) throw error;

            // Trimite notificare către destinatar
            await this.sendNotification(toUserId, {
                type: 'video_call_offer',
                from: fromUserId,
                offer: offer
            });

            return data;
        } catch (error) {
            console.error('Error handling offer:', error);
            throw error;
        }
    }

    // Gestionează primirea răspunsului la apel
    async handleAnswer(fromUserId, toUserId, answer) {
        try {
            const { data, error } = await supabase
                .from('video_signals')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    answer: answer,
                    type: 'answer',
                    created_at: new Date()
                });

            if (error) throw error;

            // Trimite notificare către inițiatorul apelului
            await this.sendNotification(toUserId, {
                type: 'video_call_answer',
                from: fromUserId,
                answer: answer
            });

            return data;
        } catch (error) {
            console.error('Error handling answer:', error);
            throw error;
        }
    }

    // Gestionează ice candidates
    async handleIceCandidate(fromUserId, toUserId, candidate) {
        try {
            const { data, error } = await supabase
                .from('video_signals')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    ice_candidate: candidate,
                    type: 'ice_candidate',
                    created_at: new Date()
                });

            if (error) throw error;

            // Trimite notificare către destinatar
            await this.sendNotification(toUserId, {
                type: 'ice_candidate',
                from: fromUserId,
                candidate: candidate
            });

            return data;
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            throw error;
        }
    }

    // Trimite notificare prin Supabase Realtime
    async sendNotification(userId, payload) {
        try {
            await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    type: 'video_call',
                    payload: payload,
                    created_at: new Date()
                });
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }
}

module.exports = new SignalService();
