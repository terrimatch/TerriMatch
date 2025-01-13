const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

class SupabaseService {
    async saveProfile(userData) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                    {
                        telegram_id: userData.telegram_id,
                        name: userData.name,
                        birthdate: userData.birthdate,
                        gender: userData.gender,
                        bio: userData.bio,
                        location: userData.location,
                        last_active: new Date(),
                        registration_completed: true
                    }
                ]);

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }

    async getProfile(telegramId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', telegramId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    async uploadPhoto(telegramId, photoFile, index) {
        try {
            const filePath = `${telegramId}/photo${index}`;
            const { error: uploadError } = await supabase.storage
                .from('profile-photos')
                .upload(filePath, photoFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl }, error: urlError } = supabase.storage
                .from('profile-photos')
                .getPublicUrl(filePath);

            if (urlError) throw urlError;

            // Update profile with photo URL
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    [`photo${index}_url`]: publicUrl
                })
                .eq('telegram_id', telegramId);

            if (updateError) throw updateError;

            return publicUrl;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }
}

module.exports = new SupabaseService();
