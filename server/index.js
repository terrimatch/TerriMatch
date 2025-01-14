const express = require('express');
const cors = require('cors');
const path = require('path');

// Inițializare Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rută pentru servirea paginii principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Rută pentru înregistrare
app.post('/api/register', async (req, res) => {
    try {
        const userData = req.body;
        console.log('Received registration data:', userData);
        res.json({ success: true });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Pentru orice altă rută, servește pagina principală
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Export pentru Vercel
module.exports = app;
