import { supabase } from '../config/supabaseClient.js';

export const createNotification = async (userId, type, content, data = {}) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: userId,
                    type,
                    content,
                    data
                }
            ]);

        if (error) throw error;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export const notifyMatch = async (user1Id, user2Id) => {
    // Get both users' profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', [user1Id, user2Id]);

    if (error) throw error;

    const user1 = profiles.find(p => p.id === user1Id);
    const user2 = profiles.find(p => p.id === user2Id);

    // Create notifications for both users
    await createNotification(
        user1Id,
        'new_match',
        `You matched with ${user2.username}!`,
        { matchedUserId: user2Id }
    );

    await createNotification(
        user2Id,
        'new_match',
        `You matched with ${user1.username}!`,
        { matchedUserId: user1Id }
    );
};