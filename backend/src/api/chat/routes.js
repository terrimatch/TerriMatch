import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                match:matches (
                    id,
                    user1:profiles!matches_user1_id_fkey (id, username, avatar_url),
                    user2:profiles!matches_user2_id_fkey (id, username, avatar_url)
                )
            `)
            .eq('match.status', 'active')
            .or(`match.user1_id.eq.${user.id},match.user2_id.eq.${user.id}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        res.json(conversations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get messages for a specific conversation
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId } = req.params;

        // Verify user has access to this conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('match:matches(user1_id, user2_id)')
            .eq('id', conversationId)
            .single();

        if (convError) throw convError;

        if (!conversation.match) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.match.user1_id !== user.id && conversation.match.user2_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey (id, username, avatar_url)
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (msgError) throw msgError;

        res.json(messages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Send a message
router.post('/messages', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId, content, type = 'text' } = req.body;

        // Verify user has access to this conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select('match:matches(user1_id, user2_id)')
            .eq('id', conversationId)
            .single();

        if (convError) throw convError;

        if (!conversation.match) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.match.user1_id !== user.id && conversation.match.user2_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert([
                {
                    conversation_id: conversationId,
                    sender_id: user.id,
                    content,
                    message_type: type
                }
            ])
            .select(`
                *,
                sender:profiles!messages_sender_id_fkey (id, username, avatar_url)
            `)
            .single();

        if (msgError) throw msgError;

        // Update conversation's last message
        const { error: updateError } = await supabase
            .from('conversations')
            .update({
                last_message: content,
                last_message_at: new Date()
            })
            .eq('id', conversationId);

        if (updateError) throw updateError;

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;