const express = require('express');
const router = express.Router();
const notificationService = require('../../services/notificationService');

// Obținere notificări necitite
router.get('/notifications/unread/:userId', async (req, res) => {
    try {
        const notifications = await notificationService.getUnreadNotifications(req.params.userId);
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Eroare la obținerea notificărilor' });
    }
});

// Marcare notificare ca citită
router.post('/notifications/mark-read', async (req, res) => {
    try {
        const { notificationId, userId } = req.body;
        await notificationService.markAsRead(notificationId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Eroare la marcarea notificării' });
    }
});

// Actualizare setări notificări
router.post('/notifications/settings', async (req, res) => {
    try {
        const { userId, settings } = req.body;
        await notificationService.updateNotificationSettings(userId, settings);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ error: 'Eroare la actualizarea setărilor' });
    }
});

module.exports = router;
