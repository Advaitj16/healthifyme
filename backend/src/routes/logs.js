const express = require('express');
const axios = require('axios');
const FoodLog = require('../models/FoodLog');
const verifyJWT = require('../middleware/auth');

const router = express.Router();

const today = () => new Date().toISOString().split('T')[0];

// GET /api/logs/today
router.get('/today', verifyJWT, async (req, res) => {
    try {
        const date = today();
        const log = await FoodLog.findOne({ userId: req.user.id, date });
        res.json({
            date,
            meals: log?.meals || [],
            totalKcal: log?.totalKcal || 0,
            totalProtein: log?.totalProtein || 0,
            totalCarbs: log?.totalCarbs || 0,
            totalFat: log?.totalFat || 0,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// GET /api/logs?date=YYYY-MM-DD
router.get('/', verifyJWT, async (req, res) => {
    try {
        const { date } = req.query;
        const query = { userId: req.user.id };
        if (date) query.date = date;
        const logs = await FoodLog.find(query).sort({ date: -1 }).limit(30);
        res.json({ logs });
    } catch {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST /api/logs — add a meal to today's log
router.post('/', verifyJWT, async (req, res) => {
    try {
        const { name, mealType, kcal, protein, carbs, fat, portion, foodId } = req.body;
        if (!name) return res.status(400).json({ message: 'Food name is required.' });

        const date = today();
        let log = await FoodLog.findOne({ userId: req.user.id, date });
        if (!log) {
            log = new FoodLog({ userId: req.user.id, date, meals: [] });
        }

        const newMeal = { name, mealType: mealType || 'Snack', kcal: kcal || 0, protein: protein || 0, carbs: carbs || 0, fat: fat || 0, portion: portion || 'Medium', foodId };
        log.meals.push(newMeal);
        await log.save();

        res.status(201).json({ log: log.meals[log.meals.length - 1], totals: { totalKcal: log.totalKcal, totalProtein: log.totalProtein, totalCarbs: log.totalCarbs, totalFat: log.totalFat } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// DELETE /api/logs/:mealId — remove a meal
router.delete('/:mealId', verifyJWT, async (req, res) => {
    try {
        const date = today();
        const log = await FoodLog.findOne({ userId: req.user.id, date });
        if (!log) return res.status(404).json({ message: 'Log not found.' });
        log.meals = log.meals.filter((m) => m._id.toString() !== req.params.mealId);
        await log.save();
        res.json({ message: 'Meal removed.', totalKcal: log.totalKcal });
    } catch {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
