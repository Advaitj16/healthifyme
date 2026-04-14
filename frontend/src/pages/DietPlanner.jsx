import { useMemo, useState } from 'react';
import SideNavBar from '../components/layout/SideNavBar';
import TopNavBar from '../components/layout/TopNavBar';
import useAuthStore from '../stores/authStore';
import MacroBar from '../components/ui/MacroBar';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const mealTemplates = {
    Breakfast: 'Greek Yogurt Bowl',
    Lunch: 'Quinoa Power Salad',
    Dinner: 'Grilled Salmon Plate',
    Snack: 'Protein Smoothie',
};

export default function DietPlanner() {
    const user = useAuthStore((s) => s.user);
    const [activeDay, setActiveDay] = useState(0);
    const [goal, setGoal] = useState(user?.profile?.goal || 'maintenance');
    const [preference, setPreference] = useState(user?.profile?.dietPreference || 'Standard');
    const [refreshSeed, setRefreshSeed] = useState(0);

    const targets = user?.profile?.macros || { protein: 140, carbs: 220, fat: 70 };
    const tdee = user?.profile?.tdee || 2200;

    const plan = useMemo(() => {
        const delta = refreshSeed * 10 + activeDay * 15;
        return MEALS.map((meal, index) => ({
            meal,
            name: `${mealTemplates[meal]} ${preference === 'Standard' ? '' : `(${preference})`}`.trim(),
            kcal: Math.round(tdee / 4 + delta + index * 35),
            protein: Math.round(targets.protein / 4 + index * 3),
        }));
    }, [activeDay, preference, refreshSeed, tdee, targets.protein]);

    const dayCalories = plan.reduce((sum, meal) => sum + meal.kcal, 0);

    return (
        <div className="flex min-h-screen bg-surface">
            <SideNavBar />
            <div className="flex-1 pl-64">
                <TopNavBar />
                <main className="pt-8 pb-16 px-8 max-w-6xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-8 gap-4">
                        <div>
                            <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Weekly Nutrition Strategy</span>
                            <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Diet Planner</h2>
                            <p className="text-on-surface-variant">Generate and tune your weekly meal structure.</p>
                        </div>
                        <button className="btn-primary" onClick={() => setRefreshSeed((s) => s + 1)}>
                            <span className="material-symbols-outlined text-[18px]">refresh</span>
                            Regenerate Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <section className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="card p-4">
                                <div className="grid grid-cols-7 gap-2">
                                    {DAYS.map((day, idx) => (
                                        <button
                                            key={day}
                                            onClick={() => setActiveDay(idx)}
                                            className={activeDay === idx ? 'py-3 text-sm font-bold text-primary border-b-4 border-primary' : 'py-3 text-sm font-bold text-on-surface-variant'}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {plan.map((meal) => (
                                    <div key={meal.meal} className="card p-5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary">{meal.meal}</p>
                                        <h3 className="font-headline text-lg font-bold mt-2">{meal.name}</h3>
                                        <div className="mt-3 flex gap-3 text-xs">
                                            <span className="bg-surface-container-low px-2 py-1 rounded-lg">{meal.kcal} kcal</span>
                                            <span className="bg-surface-container-low px-2 py-1 rounded-lg">{meal.protein}g protein</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <aside className="col-span-12 lg:col-span-4 space-y-6">
                            <div className="card p-5">
                                <h3 className="font-headline text-lg font-bold mb-4">Plan Settings</h3>
                                <div className="space-y-3">
                                    {['cutting', 'maintenance', 'bulking'].map((option) => (
                                        <label key={option} className="flex items-center gap-2 text-sm">
                                            <input type="radio" name="goal" checked={goal === option} onChange={() => setGoal(option)} />
                                            <span className="capitalize">{option}</span>
                                        </label>
                                    ))}
                                    <select className="input-field mt-2" value={preference} onChange={(e) => setPreference(e.target.value)}>
                                        <option>Standard</option>
                                        <option>Vegan</option>
                                        <option>Keto</option>
                                        <option>Paleo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="card p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">TDEE Details</p>
                                <p className="text-3xl font-headline font-extrabold">{tdee} kcal</p>
                                <p className="text-sm text-on-surface-variant mt-1">Planned day total: {dayCalories} kcal</p>
                                <div className="mt-5 space-y-4">
                                    <MacroBar label="Protein" current={targets.protein} target={targets.protein} colorClass="bg-emerald-700" />
                                    <MacroBar label="Carbs" current={targets.carbs} target={targets.carbs} colorClass="bg-emerald-400" />
                                    <MacroBar label="Fats" current={targets.fat} target={targets.fat} colorClass="bg-emerald-200" />
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
