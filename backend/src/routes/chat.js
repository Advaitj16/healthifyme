const express = require('express');
const verifyJWT = require('../middleware/auth');
const FoodLog = require('../models/FoodLog');
const User = require('../models/User');

const router = express.Router();

const today = () => new Date().toISOString().split('T')[0];

const buildReply = ({ message, user, totalKcal }) => {
    const target = user?.profile?.tdee || 2200;
    const remaining = Math.max(target - totalKcal, 0);
    const lower = message.toLowerCase();

    if (lower.includes('water')) {
        return `Hydration target for today: 2.5L. Spread it across the next ${Math.max(remaining > 0 ? 4 : 2, 2)} windows and pair with your meals.`;
    }

    if (lower.includes('snack')) {
        return `You have about ${remaining} kcal remaining today. A smart snack: Greek yogurt with berries (~220 kcal, high protein).`;
    }

    return `You are currently at ${totalKcal}/${target} kcal. Remaining budget is ${remaining} kcal. Keep your next meal protein-forward to stay aligned.`;
};

router.post('/', verifyJWT, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        const [user, log] = await Promise.all([
            User.findById(req.user.id),
            FoodLog.findOne({ userId: req.user.id, date: today() }),
        ]);

        const totalKcal = log?.totalKcal || 0;
        const reply = buildReply({ message, user, totalKcal });
        res.json({ reply, suggestedActions: ['Log next meal', 'Open planner', 'Set hydration reminder'] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

router.get('/history', verifyJWT, async (req, res) => {
    res.json({ messages: [] });
});

module.exports = router;
