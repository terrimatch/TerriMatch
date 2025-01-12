const { supabase } = require('../config/supabase');

class TerriCoinService {
    async getBalance(userId) {
        try {
            const { data: wallet, error } = await supabase
                .from('wallets')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return wallet.balance;
        } catch (error) {
            console.error('Error getting balance:', error);
            throw error;
        }
    }

    async addCoins(userId, amount) {
        try {
            const { data: wallet, error } = await supabase
                .from('wallets')
                .upsert({
                    user_id: userId,
                    balance: supabase.raw(`balance + ${amount}`),
                    updated_at: new Date()
                })
                .single();

            if (error) throw error;

            // Înregistrează tranzacția
            await this.recordTransaction(null, userId, amount, 'purchase');

            return wallet;
        } catch (error) {
            console.error('Error adding coins:', error);
            throw error;
        }
    }

    async checkMessagePayment(fromUserId, toUserId) {
        try {
            // Verifică numărul de mesaje trimise
            const { count } = await supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('from_user_id', fromUserId)
                .eq('to_user_id', toUserId);

            // Dacă sunt sub 20 de mesaje, e gratuit
            if (count < 20) {
                return true;
            }

            // Verifică balanța
            const balance = await this.getBalance(fromUserId);
            return balance >= 0.5;
        } catch (error) {
            console.error('Error checking message payment:', error);
            throw error;
        }
    }

    async processMessagePayment(fromUserId, toUserId) {
        try {
            // Verifică dacă e necesar plata
            const needsPayment = await this.checkMessagePayment(fromUserId, toUserId);
            if (!needsPayment) {
                throw new Error('Insufficient TerriCoin balance');
            }

            // Procesează plata dacă nu e gratuit
            const { count } = await supabase
                .from('messages')
                .select('id', { count: 'exact' })
                .eq('from_user_id', fromUserId)
                .eq('to_user_id', toUserId);

            if (count >= 20) {
                await supabase.rpc('process_message_payment', {
                    from_id: fromUserId,
                    amount: 0.5
                });

                await this.recordTransaction(fromUserId, toUserId, 0.5, 'message');
            }

            return true;
        } catch (error) {
            console.error('Error processing message payment:', error);
            throw error;
        }
    }

    async startVideoChat(fromUserId, toUserId) {
        try {
            // Verifică balanța pentru minim 1 minut
            const balance = await this.getBalance(fromUserId);
            if (balance < 1) {
                throw new Error('Insufficient balance for video chat');
            }

            const { data, error } = await supabase
                .from('video_sessions')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    start_time: new Date(),
                    is_paid: false
                })
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error starting video chat:', error);
            throw error;
        }
    }

    async endVideoChat(sessionId) {
        try {
            // Calculează durata și costul
            const { data: session } = await supabase
                .from('video_sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            const endTime = new Date();
            const duration = Math.ceil((endTime - new Date(session.start_time)) / 60000); // în minute
            const cost = duration * 1; // 1 TerriCoin per minut

            // Procesează plata
            await supabase.rpc('process_video_payment', {
                from_id: session.from_user_id,
                amount: cost
            });

            // Actualizează sesiunea
            const { error } = await supabase
                .from('video_sessions')
                .update({
                    end_time: endTime,
                    duration: duration * 60, // salvează în secunde
                    total_cost: cost,
                    is_paid: true
                })
                .eq('id', sessionId);

            if (error) throw error;

            await this.recordTransaction(
                session.from_user_id,
                session.to_user_id,
                cost,
                'video_chat'
            );

            return { duration, cost };
        } catch (error) {
            console.error('Error ending video chat:', error);
            throw error;
        }
    }

    async recordTransaction(fromUserId, toUserId, amount, type) {
        try {
            const { error } = await supabase
                .from('transactions')
                .insert({
                    from_user_id: fromUserId,
                    to_user_id: toUserId,
                    amount,
                    type,
                    created_at: new Date()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error recording transaction:', error);
            throw error;
        }
    }
}

module.exports = new TerriCoinService();
