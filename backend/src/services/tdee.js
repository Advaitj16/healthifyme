/**
 * TDEE Calculator using Mifflin-St Jeor BMR
 * Returns TDEE in kcal and macro split based on goal
 */

const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
};

/**
 * Calculate BMR using Mifflin-St Jeor
 * @param {number} weight - kg
 * @param {number} height - cm
 * @param {number} age - years
 * @param {string} sex - 'male' | 'female' (default male)
 */
function calculateBMR(weight, height, age, sex = 'male') {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'female' ? base - 161 : base + 5;
}

/**
 * Calculate TDEE and macro split
 * @param {Object} profile
 */
function calculateTDEE(profile) {
    const { weight = 75, height = 175, age = 25, activityLevel = 'moderate', goal = 'maintenance' } = profile;

    const bmr = calculateBMR(weight, height, age);
    const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55));

    // Adjust TDEE by goal
    let targetKcal = tdee;
    if (goal === 'cutting') targetKcal = Math.round(tdee * 0.8);       // -20%
    if (goal === 'bulking') targetKcal = Math.round(tdee * 1.1);       // +10%

    // Macro split (protein priority)
    const protein = Math.round(weight * 1.8);  // 1.8g per kg bodyweight
    const fat = Math.round((targetKcal * 0.25) / 9);  // 25% of calories from fat
    const carbs = Math.round((targetKcal - protein * 4 - fat * 9) / 4); // remainder

    return {
        bmr: Math.round(bmr),
        tdee,
        targetKcal,
        macros: { protein, carbs: Math.max(carbs, 50), fat },
    };
}

module.exports = { calculateTDEE, calculateBMR };
