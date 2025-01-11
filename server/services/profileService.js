const { supabase } = require('../config/supabase');

class ProfileService {
    async getProfile(userId) {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    notification_settings:telegram_notification_settings(*)
                `)
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return profile;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    }

    async updateProfile(userId, profileData) {
        try {
            // Validare date profil
            if (profileData.phone && !this.validatePhone(profileData.phone)) {
                throw new Error('Număr de telefon invalid');
            }

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...profileData,
                    updated_at: new Date()
                })
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async updateProfilePicture(userId, imageUrl) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    profile_picture: imageUrl,
                    updated_at: new Date()
                })
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating profile picture:', error);
            throw error;
        }
    }

    async getProfilesByFilters(filters, limit = 20, offset = 0) {
        try {
            let query = supabase
                .from('profiles')
                .select('*')
                .eq('profile_completed', true);

            // Aplicare filtre
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }
            if (filters.property_type) {
                query = query.eq('property_type', filters.property_type);
            }
            if (filters.min_price) {
                query = query.gte('price', filters.min_price);
            }
            if (filters.max_price) {
                query = query.lte('price', filters.max_price);
            }

            // Paginare
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profiles by filters:', error);
            throw error;
        }
    }

    async saveProfileFilter(userId, filterData) {
        try {
            const { data, error } = await supabase
                .from('saved_filters')
                .insert({
                    user_id: userId,
                    filter_data: filterData,
                    created_at: new Date()
                })
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving filter:', error);
            throw error;
        }
    }

    async getSavedFilters(userId) {
        try {
            const { data, error } = await supabase
                .from('saved_filters')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching saved filters:', error);
            throw error;
        }
    }

    validatePhone(phone) {
        // Implementează validare număr telefon
        const phoneRegex = /^(\+4|)?(07[0-8]{1}[0-9]{1}|02[0-9]{2}|03[0-9]{2}){1}?(\s|\.|\-)?([0-9]{3}(\s|\.|\-|)){2}$/;
        return phoneRegex.test(phone);
    }
}

module.exports = new ProfileService();
