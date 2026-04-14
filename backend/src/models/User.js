const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const profileSchema = new mongoose.Schema({
    age: { type: Number },
    weight: { type: Number }, // kg
    height: { type: Number }, // cm
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active'],
        default: 'moderate',
    },
    goal: {
        type: String,
        enum: ['cutting', 'maintenance', 'bulking'],
        default: 'maintenance',
    },
    dietPreference: { type: String, default: 'Standard' },
    tdee: { type: Number, default: 2000 },
    macros: {
        protein: { type: Number, default: 150 },
        carbs: { type: Number, default: 200 },
        fat: { type: Number, default: 65 },
    },
    exerciseKcal: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        profile: { type: profileSchema, default: () => ({}) },
    },
    { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

userSchema.methods.toPublic = function () {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        profile: this.profile,
        goal: this.profile?.goal,
    };
};

module.exports = mongoose.model('User', userSchema);
