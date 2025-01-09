// Image validation middleware
const validateImage = (req, res, next) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const file = req.files.image;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxDimensions = {
        width: 2048,
        height: 2048
    };

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

// Update the send-image route to use the middleware
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
                metadata: {
                    originalName: name,
                    size: buffer.length,
                    type: mimetype
                }
            }])
            .select()
            .single();

        if (msgError) throw msgError;

        res.json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
