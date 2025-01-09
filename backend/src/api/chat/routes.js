import express from 'express';
import { supabase } from '../../config/supabaseClient.js';

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        // Get all conversations from matches
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                id,
                last_message,
                last_message_at,
                created_at,
                match:matches (
                    id,
                    user1:profiles!matches_user1_id_fkey (id, username, avatar_url),
                    user2:profiles!matches_user2_id_fkey (id, username, avatar_url)
                )
            `)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Filter conversations to only include those where the user is part of the match
        const userConversations = conversations.filter(conv => {
            const match = conv.match;
            return match.user1.id === user.id || match.user2.id === user.id;
        });

        res.json(userConversations);
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

        // First verify user has access to this conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select(`
                id,
                match:matches (
                    user1_id,
                    user2_id
                )
            `)
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Verify user is part of the match
        if (conversation.match.user1_id !== user.id && conversation.match.user2_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get messages
        const { data: messages, error: msgError } = await supabase
            .from('messages')
            .select(`
                id,
                content,
                message_type,
                created_at,
                sender:profiles!messages_sender_id_fkey (
                    id,
                    username,
                    avatar_url
                )
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
router.post('/send', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId, content, messageType = 'text' } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Verify access to conversation
        const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select(`
                id,
                match:matches (
                    user1_id,
                    user2_id
                )
            `)
            .eq('id', conversationId)
            .single();

        if (convError || !conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.match.user1_id !== user.id && conversation.match.user2_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Send message
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                sender_id: user.id,
                content,
                message_type: messageType
            }])
            .select(`
                id,
                content,
                message_type,
                created_at,
                sender:profiles!messages_sender_id_fkey (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (msgError) throw msgError;

        // Update conversation last message
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
