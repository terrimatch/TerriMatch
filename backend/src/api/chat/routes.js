// Edit message route
router.put('/messages/:messageId', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { messageId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        // Get the message and verify ownership
        const { data: message, error: msgError } = await supabase
            .from('messages')
            .select(`
                *,
                conversation:conversations (
                    match:matches (
                        user1_id,
                        user2_id
                    )
                )
            `)
            .eq('id', messageId)
            .single();

        if (msgError || !message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Verify user owns the message
        if (message.sender_id !== user.id) {
            return res.status(403).json({ error: 'Can only edit your own messages' });
        }

        // Verify message is not too old (e.g., 15 minutes limit)
        const messageTime = new Date(message.created_at).getTime();
        const currentTime = new Date().getTime();
        const timeDiff = (currentTime - messageTime) / 1000 / 60; // difference in minutes

        if (timeDiff > 15) {
            return res.status(400).json({ error: 'Cannot edit messages older than 15 minutes' });
        }

        // Verify message type is 'text' (can't edit image messages)
        if (message.message_type !== 'text') {
            return res.status(400).json({ error: 'Can only edit text messages' });
        }

        // Update the message
        const { data: updatedMessage, error: updateError } = await supabase
            .from('messages')
            .update({
                content,
                edited: true,
                edited_at: new Date(),
                edit_history: message.edit_history 
                    ? [...message.edit_history, { content: message.content, edited_at: message.edited_at }]
                    : [{ content: message.content, edited_at: new Date() }]
            })
            .eq('id', messageId)
            .select(`
                id,
                content,
                message_type,
                created_at,
                edited,
                edited_at,
                edit_history,
                seen_by,
                sender:profiles!messages_sender_id_fkey (
                    id,
                    username,
                    avatar_url
                )
            `)
            .single();

        if (updateError) throw updateError;

        // If this was the last message in the conversation, update the conversation
        const { error: convError } = await supabase
            .from('conversations')
            .update({
                last_message: content
            })
            .eq('id', message.conversation_id)
            .eq('last_message', message.content);

        if (convError) throw convError;

        res.json(updatedMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
