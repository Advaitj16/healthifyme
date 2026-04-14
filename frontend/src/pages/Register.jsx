import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

const STEPS = ['Personal Info', 'Body Stats', 'Goals'];

const ACTIVITY_LEVELS = [
    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', desc: '1–3 days/week' },
    { value: 'moderate', label: 'Moderately Active', desc: '3–5 days/week' },
    { value: 'active', label: 'Very Active', desc: '6–7 days/week' },
];

const GOALS = [
    { value: 'cutting', label: 'Weight Loss', icon: 'trending_down', desc: 'Lose fat in a caloric deficit' },
    { value: 'maintenance', label: 'Maintenance', icon: 'balance', desc: 'Maintain current weight' },
    { value: 'bulking', label: 'Muscle Gain', icon: 'fitness_center', desc: 'Build muscle in surplus' },
];

const PREFERENCES = ['Standard', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'High-Protein'];

export default function Register() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        name: '', email: '', password: '',
        age: '', weight: '', height: '',
        activityLevel: 'moderate',
        goal: 'maintenance',
        dietPreference: 'Standard',
    });

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const back = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/register', form);
            setAuth(res.data.user, res.data.accessToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-extrabold font-headline text-primary mb-1">HealthifyMe</h1>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Clinical Atelier</p>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'bg-primary text-white' :
                                        i === step ? 'bg-primary-gradient text-white shadow-lg shadow-primary/30' :
                                            'bg-surface-container-high text-on-surface-variant'
                                    }`}>
                                    {i < step ? (
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                    ) : i + 1}
                                </div>
                                <span className="text-xs font-bold hidden sm:block">{label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-12 h-0.5 rounded-full ${i < step ? 'bg-primary' : 'bg-surface-container-high'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="card p-8">
                    {error && (
                        <div className="mb-5 px-4 py-3 bg-error-container rounded-xl text-tertiary text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Step 0 — Personal Info */}
                    {step === 0 && (
                        <div className="space-y-5">
                            <h2 className="text-2xl font-bold font-headline mb-6">Personal Info</h2>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Full Name</label>
                                <input className="input-field" placeholder="Alex Johnson" value={form.name} onChange={(e) => set('name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Email</label>
                                <input type="email" className="input-field" placeholder="alex@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Password</label>
                                <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {/* Step 1 — Body Stats */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-2xl font-bold font-headline mb-6">Body Stats</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Age</label>
                                    <input type="number" className="input-field" placeholder="25" value={form.age} onChange={(e) => set('age', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Weight (kg)</label>
                                    <input type="number" className="input-field" placeholder="75" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Height (cm)</label>
                                    <input type="number" className="input-field" placeholder="175" value={form.height} onChange={(e) => set('height', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Activity Level</label>
                                <div className="space-y-2">
                                    {ACTIVITY_LEVELS.map((a) => (
                                        <label key={a.value} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${form.activityLevel === a.value ? 'bg-primary/10 border border-primary/20' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                                            <input type="radio" name="activity" value={a.value} checked={form.activityLevel === a.value} onChange={() => set('activityLevel', a.value)} className="text-primary focus:ring-primary/20" />
                                            <div>
                                                <p className="text-sm font-bold">{a.label}</p>
                                                <p className="text-[10px] text-on-surface-variant">{a.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Goals */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold font-headline mb-6">Your Goals</h2>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Primary Goal</label>
                                <div className="space-y-2">
                                    {GOALS.map((g) => (
                                        <label key={g.value} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${form.goal === g.value ? 'bg-primary-gradient text-white' : 'bg-surface-container-low hover:bg-surface-container'}`}>
                                            <input type="radio" name="goal" value={g.value} checked={form.goal === g.value} onChange={() => set('goal', g.value)} className="text-primary" />
                                            <span className="material-symbols-outlined text-[22px]">{g.icon}</span>
                                            <div>
                                                <p className="text-sm font-bold">{g.label}</p>
                                                <p className={`text-[10px] ${form.goal === g.value ? 'text-emerald-100' : 'text-on-surface-variant'}`}>{g.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Diet Preference</label>
                                <div className="flex flex-wrap gap-2">
                                    {PREFERENCES.map((p) => (
                                        <button key={p} type="button" onClick={() => set('dietPreference', p)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${form.dietPreference === p ? 'vitality-gradient text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        {step > 0 && (
                            <button onClick={back} className="flex-1 btn-secondary justify-center py-3">
                                Back
                            </button>
                        )}
                        {step < STEPS.length - 1 ? (
                            <button onClick={next} className="flex-1 btn-primary justify-center py-3">
                                Continue
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="flex-1 btn-primary justify-center py-3">
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                        Create Account
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center text-sm text-on-surface-variant mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
