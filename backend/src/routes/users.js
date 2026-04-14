const express = require('express');
const User = require('../models/User');
const verifyJWT = require('../middleware/auth');
const { calculateTDEE } = require('../services/tdee');

const router = express.Router();

// GET /api/users/me
router.get('/me', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ user: user.toPublic() });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PATCH /api/users/me
router.patch('/me', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const { name, age, weight, height, activityLevel, goal, dietPreference } = req.body;
        if (name) user.name = name;

        const profileUpdates = { age, weight, height, activityLevel, goal, dietPreference };
        Object.entries(profileUpdates).forEach(([k, v]) => {
            if (v !== undefined) user.profile[k] = v;
        });

        // Recalculate TDEE on profile changes
        const { targetKcal, macros } = calculateTDEE(user.profile);
        user.profile.tdee = targetKcal;
        user.profile.macros = macros;

        await user.save();
        res.json({ user: user.toPublic() });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
