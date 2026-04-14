const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Snack' },
    kcal: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    portion: { type: String, default: 'Medium' },
    foodId: { type: String },
    loggedAt: { type: Date, default: Date.now },
});

const foodLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        date: { type: String, required: true, index: true }, // YYYY-MM-DD
        meals: [mealItemSchema],
        totalKcal: { type: Number, default: 0 },
        totalProtein: { type: Number, default: 0 },
        totalCarbs: { type: Number, default: 0 },
        totalFat: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Recalculate totals before save
foodLogSchema.pre('save', function (next) {
    this.totalKcal = this.meals.reduce((s, m) => s + (m.kcal || 0), 0);
    this.totalProtein = this.meals.reduce((s, m) => s + (m.protein || 0), 0);
    this.totalCarbs = this.meals.reduce((s, m) => s + (m.carbs || 0), 0);
    this.totalFat = this.meals.reduce((s, m) => s + (m.fat || 0), 0);
    next();
});

module.exports = mongoose.model('FoodLog', foodLogSchema);
