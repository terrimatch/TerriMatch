const { supabase } = require('../config/supabase');
const crypto = require('crypto');

class TelegramAuthService {
    async verifyTelegramAuth(authData) {
        try {
            const { id, first_name, last_name, username, photo_url, auth_date, hash } = authData;
            
            // Verifică dacă utilizatorul există
            const { data: existingUser, error: searchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', id)
                .single();

            if (searchError && searchError.code !== 'PGRST116') {
                throw searchError;
            }

            // Dacă utilizatorul nu există, îl creăm
            if (!existingUser) {
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        telegram_id: id,
                        first_name,
                        last_name,
                        username,
                        photo_url,
                        created_at: new Date(),
                        registration_completed: false
                    })
                    .single();

                if (createError) throw createError;
                return { 
                    user: newUser,
                    isNewUser: true 
                };
            }

            return { 
                user: existingUser,
                isNewUser: false 
            };
        } catch (error) {
            console.error('Error in telegram auth:', error);
            throw error;
        }
    }

    async checkRegistrationStatus(telegramId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();

            if (error) throw error;

            return {
                isRegistered: profile.registration_completed,
                profile
            };
        } catch (error) {
            console.error('Error checking registration status:', error);
            throw error;
        }
    }
}

module.exports = new TelegramAuthService();
