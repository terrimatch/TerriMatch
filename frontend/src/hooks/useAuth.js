import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Inițializare Telegram WebApp
        const tg = window.Telegram.WebApp;
        if (tg) {
            const initData = tg.initData;
            const user = tg.initDataUnsafe?.user;
            
            if (user) {
                checkOrCreateUser(user);
            }
        }
        setLoading(false);
    }, []);

    const checkOrCreateUser = async (telegramUser) => {
        try {
            // Verifică dacă utilizatorul există
            let { data: existingUser, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('telegram_id', telegramUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!existingUser) {
                // Creează utilizator nou
                const { data: newUser, error: createError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            telegram_id: telegramUser.id,
                            first_name: telegramUser.first_name,
                            last_name: telegramUser.last_name,
                            username: telegramUser.username,
                            created_at: new Date(),
                            registration_completed: false
                        }
                    ])
                    .single();

                if (createError) throw createError;
                setUser(newUser);
            } else {
                setUser(existingUser);
            }
        } catch (error) {
            console.error('Error in auth:', error);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    ...profileData,
                    registration_completed: true,
                    updated_at: new Date()
                })
                .eq('telegram_id', user.telegram_id)
                .single();

            if (error) throw error;
            setUser(data);
            return data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    return {
        user,
        loading,
        updateProfile
    };
};

export default useAuth;
