import express from 'express';
import { supabase } from '../../config/supabaseClient.js';
import fileUpload from 'express-fileupload';

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
                seen_by,
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

// Send a text message
router.post('/send', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId, content } = req.body;

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
                message_type: 'text',
                seen_by: [user.id]
            }])
            .select(`
                id,
                content,
                message_type,
                created_at,
                seen_by,
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

// Image validation middleware
const validateImage = (req, res, next) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const file = req.files.image;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    // Check file size
    if (file.size > maxSize) {
        return res.status(400).json({ 
            error: 'Image size too large. Maximum size is 5MB' 
        });
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
            error: 'Invalid file type. Only JPEG, PNG and GIF allowed' 
        });
    }

    // Create a buffer from the file data
    const buffer = Buffer.from(file.data);
    
    // Add validated file to request
    req.validatedImage = {
        buffer,
        mimetype: file.mimetype,
        name: file.name
    };

    next();
};

// Send image message
router.post('/send-image', validateImage, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId } = req.body;
        const { buffer, mimetype, name } = req.validatedImage;

        // Generate unique filename
        const filename = `chat/${conversationId}/${Date.now()}-${name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(filename, buffer, {
                contentType: mimetype,
                upsert: false
            });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('chat-images')
            .getPublicUrl(filename);

        // Create message with image
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .insert([{
                conversation_id: conversationId,
                sender_id: user.id,
                content: publicUrl,
                message_type: 'image',
                seen_by: [user.id],
                metadata: {
                    originalName: name,
                    size: buffer.length,
                    type: mimetype
                }
            }])
            .select()
            .single();

        if (msgError) throw msgError;

        // Update conversation last message
        const { error: updateError } = await supabase
            .from('conversations')
            .update({
                last_message: '📷 Image',
                last_message_at: new Date()
            })
            .eq('id', conversationId);

        if (updateError) throw updateError;

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Mark messages as seen
router.post('/seen/:conversationId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId } = req.params;

        // Verify user has access to conversation
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

        // Update all unseen messages in conversation
        const { data: messages, error: updateError } = await supabase.rpc(
            'mark_messages_seen',
            { 
                p_conversation_id: conversationId,
                p_user_id: user.id
            }
        );

        if (updateError) throw updateError;

        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get message seen status
router.get('/seen-status/:messageId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { messageId } = req.params;

        const { data: message, error } = await supabase
            .from('messages')
            .select(`
                id,
                seen_by,
                conversation_id,
                conversation:conversations (
                    match:matches (
                        user1_id,
                        user2_id
                    )
                )
            `)
            .eq('id', messageId)
            .single();

        if (error) throw error;

        // Verify access
        const match = message.conversation.match;
        if (match.user1_id !== user.id && match.user2_id !== user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get user details for seen_by
        const seenBy = message.seen_by || [];
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', seenBy);

        if (profilesError) throw profilesError;

        res.json({
            messageId: message.id,
            seenBy: profiles
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
