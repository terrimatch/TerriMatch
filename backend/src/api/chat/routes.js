import express from 'express';
import { supabase } from '../../config/supabase.js';
import { auth } from '../../middleware/auth.js';

const router = express.Router();

// Get chat list for user
router.get('/conversations', auth, async (req, res) => {
  try {
    const { data: chats, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!conversations_user1_id_fkey (username, avatar),
        profiles!conversations_user2_id_fkey (username, avatar)
      `)
      .or(`user1_id.eq.${req.userId},user2_id.eq.${req.userId}`);

    if (error) throw error;

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for specific chat
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles:sender_id (username, avatar)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/messages', auth, async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;

    const { data: message, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: req.userId,
          content,
          message_type: messageType,
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({ 
        last_message: content,
        last_message_at: new Date()
      })
      .eq('id', conversationId);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
