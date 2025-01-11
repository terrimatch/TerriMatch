const express = require('express');
const router = express.Router();
const chatService = require('../../services/chatService');

// Trimitere mesaj nou
router.post('/messages', async (req, res) => {
    try {
        const { matchId, senderId, content } = req.body;
        const message = await chatService.createMessage(matchId, senderId, content);
        res.json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Eroare la trimiterea mesajului' });
    }
});

// Obținere mesaje pentru un match
router.get('/messages/:matchId', async (req, res) => {
    try {
        const { limit, offset } = req.query;
        const messages = await chatService.getMessages(
            req.params.matchId,
            parseInt(limit) || 50,
            parseInt(offset) || 0
        );
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Eroare la obținerea mesajelor' });
    }
});

// Marcare mesaje ca citite
router.post('/messages/mark-read', async (req, res) => {
    try {
        const { matchId, userId } = req.body;
        await chatService.markMessagesAsRead(matchId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Eroare la marcarea mesajelor' });
    }
});

// Obținere număr mesaje necitite
router.get('/messages/unread/count/:userId', async (req, res) => {
    try {
        const count = await chatService.getUnreadMessagesCount(req.params.userId);
        res.json({ count });
    } catch (error) {
        console.error('Error counting unread messages:', error);
        res.status(500).json({ error: 'Eroare la numărarea mesajelor' });
    }
});

module.exports = router;
