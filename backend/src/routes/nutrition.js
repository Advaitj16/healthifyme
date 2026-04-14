const express = require('express');
const axios = require('axios');
const verifyJWT = require('../middleware/auth');

const router = express.Router();

// GET /api/nutrition/search?q=chicken
router.get('/search', verifyJWT, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'Query parameter q is required.' });

        const { EDAMAM_APP_ID, EDAMAM_APP_KEY } = process.env;

        const response = await axios.get('https://api.edamam.com/api/food-database/v2/parser', {
            params: {
                app_id: EDAMAM_APP_ID,
                app_key: EDAMAM_APP_KEY,
                ingr: q,
                'nutrition-type': 'cooking',
            },
        });

        res.json({ hints: response.data.hints?.slice(0, 10) || [] });
    } catch (err) {
        console.error('Edamam error:', err.response?.data || err.message);
        // Return mock data if API not configured
        res.json({
            hints: [
                { food: { foodId: 'mock1', label: `${req.query.q} (mock)`, category: 'Generic foods', nutrients: { ENERC_KCAL: 180, PROCNT: 20, CHOCDF: 10, FAT: 6 } } },
                { food: { foodId: 'mock2', label: `Grilled ${req.query.q}`, category: 'Generic foods', nutrients: { ENERC_KCAL: 165, PROCNT: 31, CHOCDF: 0, FAT: 3.6 } } },
            ],
        });
    }
});

module.exports = router;
