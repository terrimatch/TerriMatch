const express = require('express');
const router = express.Router();
const matchingService = require('../../services/matchingService');

// Creare like nou
router.post('/like', async (req, res) => {
    try {
        const { fromUserId, toUserId } = req.body;
        const result = await matchingService.createLike(fromUserId, toUserId);
        res.json(result);
    } catch (error) {
        console.error('Error creating like:', error);
        res.status(500).json({ error: 'Eroare la crearea like-ului' });
    }
});

// Obținere matches pentru un utilizator
router.get('/matches/:userId', async (req, res) => {
    try {
        const matches = await matchingService.getMatches(req.params.userId);
        res.json(matches);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Eroare la obținerea matches' });
    }
});

// Obținere likes primite
router.get('/likes/received/:userId', async (req, res) => {
    try {
        const likes = await matchingService.getLikes(req.params.userId);
        res.json(likes);
    } catch (error) {
        console.error('Error fetching likes:', error);
        res.status(500).json({ error: 'Eroare la obținerea like-urilor' });
    }
});

module.exports = router;
