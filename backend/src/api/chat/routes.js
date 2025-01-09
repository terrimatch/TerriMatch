// ... (previous code remains the same until the send message route)

// Send image message
router.post('/send-image', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError) throw authError;

        const { conversationId } = req.body;
        
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const file = req.files.image;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ 
                error: 'Invalid file type. Only JPEG, PNG and GIF allowed.' 
            });
        }

        // Generate unique filename
        const filename = `chat/${conversationId}/${Date.now()}-${file.name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('chat-images')
            .upload(filename, file.data, {
                contentType: file.mimetype,
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
                message_type: 'image'
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
        await supabase
            .from('conversations')
            .update({
                last_message: '📷 Image',
                last_message_at: new Date()
            })
            .eq('id', conversationId);

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
