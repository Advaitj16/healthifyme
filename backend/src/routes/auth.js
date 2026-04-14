const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateTDEE } = require('../services/tdee');

const router = express.Router();

const signTokens = (userId) => ({
    accessToken: jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }),
    refreshToken: jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, age, weight, height, activityLevel, goal, dietPreference } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'Email already registered.' });

        // Calculate TDEE & macros
        const { bmr, tdee, targetKcal, macros } = calculateTDEE({ weight, height, age, activityLevel, goal });

        const user = new User({
            name,
            email,
            passwordHash: password, // will be hashed by pre-save hook
            profile: {
                age, weight, height,
                activityLevel: activityLevel || 'moderate',
                goal: goal || 'maintenance',
                dietPreference: dietPreference || 'Standard',
                tdee: targetKcal,
                macros,
            },
        });

        await user.save();

        const { accessToken, refreshToken } = signTokens(user._id);
        res.status(201).json({ user: user.toPublic(), accessToken, refreshToken });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

        const valid = await user.comparePassword(password);
        if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

        const { accessToken, refreshToken } = signTokens(user._id);
        res.json({ user: user.toPublic(), accessToken, refreshToken });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token required.' });
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const { accessToken } = signTokens(decoded.id);
        res.json({ accessToken });
    } catch {
        res.status(401).json({ message: 'Invalid refresh token.' });
    }
});

module.exports = router;
