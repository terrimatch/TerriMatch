const express = require('express');
const router = express.Router();
const profileService = require('../../services/profileService');

// Obținere profil
router.get('/:userId', async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.params.userId);
        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Eroare la obținerea profilului' });
    }
});

// Actualizare profil
router.put('/:userId', async (req, res) => {
    try {
        const profile = await profileService.updateProfile(req.params.userId, req.body);
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Eroare la actualizarea profilului' });
    }
});

// Actualizare poză profil
router.put('/:userId/picture', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        const profile = await profileService.updateProfilePicture(req.params.userId, imageUrl);
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Eroare la actualizarea pozei de profil' });
    }
});

// Căutare profiluri după filtre
router.get('/search/filters', async (req, res) => {
    try {
        const { limit, offset, ...filters } = req.query;
        const profiles = await profileService.getProfilesByFilters(
            filters,
            parseInt(limit) || 20,
            parseInt(offset) || 0
        );
        res.json(profiles);
    } catch (error) {
        console.error('Error searching profiles:', error);
        res.status(500).json({ error: 'Eroare la căutarea profilurilor' });
    }
});

// Salvare filtru
router.post('/filters/save', async (req, res) => {
    try {
        const { userId, filterData } = req.body;
        const savedFilter = await profileService.saveProfileFilter(userId, filterData);
        res.json(savedFilter);
    } catch (error) {
        console.error('Error saving filter:', error);
        res.status(500).json({ error: 'Eroare la salvarea filtrului' });
    }
});

// Obținere filtre salvate
router.get('/filters/saved/:userId', async (req, res) => {
    try {
        const filters = await profileService.getSavedFilters(req.params.userId);
        res.json(filters);
    } catch (error) {
        console.error('Error fetching saved filters:', error);
        res.status(500).json({ error: 'Eroare la obținerea filtrelor salvate' });
    }
});

module.exports = router;
