import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SideNavBar from '../components/layout/SideNavBar';
import TopNavBar from '../components/layout/TopNavBar';
import VitalityRing from '../components/ui/VitalityRing';
import MacroBar from '../components/ui/MacroBar';
import LogMealModal from '../components/ui/LogMealModal';
import useAuthStore from '../stores/authStore';
import useLogStore from '../stores/logStore';
import api from '../services/api';

const QUICK_LOG_SLOTS = [
    { label: 'Breakfast', icon: 'breakfast_dining' },
    { label: 'Lunch', icon: 'lunch_dining' },
    { label: 'Dinner', icon: 'dinner_dining' },
    { label: 'Snacks', icon: 'cookie' },
];

const MEAL_GRADES = { 0: 'A+', 1: 'A', 2: 'B+', 3: 'B' };
const GRADE_COLORS = { 'A+': 'text-primary', A: 'text-primary', 'B+': 'text-emerald-600', B: 'text-secondary' };

export default function Dashboard() {
    const { user } = useAuthStore();
    const { totalKcal, macros, setTodayLogs, recentScans } = useLogStore();
    const [showModal, setShowModal] = useState(false);

    const tdee = user?.profile?.tdee || 2500;
    const consumed = totalKcal;
    const remaining = Math.max(tdee - consumed, 0);
    const percent = Math.min((consumed / tdee) * 100, 100);

    const macroTargets = user?.profile?.macros || { protein: 120, carbs: 250, fat: 60 };

    // Fetch today's logs
    useQuery({
        queryKey: ['logs-today'],
        queryFn: async () => {
            const res = await api.get('/logs/today');
            setTodayLogs(res.data.meals || []);
            return res.data;
        },
        refetchInterval: 30000,
    });

    // Group logs by meal type for quick log section
    const logsByMeal = (useLogStore.getState().todayLogs || []).reduce((acc, log) => {
        acc[log.mealType] = (acc[log.mealType] || []).concat(log);
        return acc;
    }, {});

    return (
        <div className="flex min-h-screen bg-surface">
            <SideNavBar />

            <div className="flex-1 pl-64">
                <TopNavBar onLogMeal={() => setShowModal(true)} />

                <main className="pt-4 pb-16 px-8 max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 mt-4 flex items-end justify-between">
                        <div>
                            <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
                                Welcome back, {user?.name?.split(' ')[0] || 'Friend'}.
                            </h2>
                            <p className="text-on-surface-variant font-medium">
                                {percent > 75
                                    ? "You're close to your daily target — stay on track!"
                                    : "Your metabolic performance is right on track today."}
                            </p>
                        </div>
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            Log Meal
                        </button>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-12 gap-6">

                        {/* 1. Energy Balance — 8 cols */}
                        <div className="col-span-12 lg:col-span-8 card p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold font-headline mb-1">Energy Balance</h3>
                                <p className="text-on-surface-variant text-sm mb-8">
                                    Clinical data · updated live
                                </p>
                                <VitalityRing
                                    value={percent}
                                    consumed={consumed}
                                    remaining={remaining}
                                    exercise={user?.profile?.exerciseKcal || 0}
                                />
                            </div>
                            {/* Ghost Icon */}
                            <div className="absolute -right-10 -bottom-10 opacity-[0.04] pointer-events-none">
                                <span className="material-symbols-outlined filled text-[200px]">monitor_heart</span>
                            </div>
                        </div>

                        {/* 2. Macro Nutrients — 4 cols */}
                        <div className="col-span-12 lg:col-span-4 card-surface p-8">
                            <h3 className="text-lg font-bold font-headline mb-6">Macro Nutrients</h3>
                            <div className="space-y-8">
                                <MacroBar label="Protein" current={macros.protein} target={macroTargets.protein} colorClass="bg-emerald-700" />
                                <MacroBar label="Carbs" current={macros.carbs} target={macroTargets.carbs} colorClass="bg-emerald-400" />
                                <MacroBar label="Fats" current={macros.fat} target={macroTargets.fat} colorClass="bg-emerald-200" />
                            </div>
                        </div>

                        {/* 3. Today's Insights — 5 cols */}
                        <div className="col-span-12 lg:col-span-5 bg-primary-gradient rounded-3xl p-8 text-on-primary shadow-lg">
                            <div className="flex items-start justify-between mb-6">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                                    <span className="material-symbols-outlined filled text-[22px]">lightbulb</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                                    AI Coach
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold font-headline mb-4">Today's Insights</h3>
                            <p className="text-emerald-50 text-sm leading-relaxed mb-6">
                                {macros.protein < macroTargets.protein * 0.5
                                    ? `Your protein intake is low for your activity level. Consider a high-protein snack to support muscle recovery.`
                                    : `Great work! Your macros are on track. Keep hydrated and aim for your protein goal before dinner.`}
                            </p>
                            <button className="bg-surface-container-lowest text-primary px-6 py-2 rounded-xl text-sm font-bold hover:scale-[0.98] transition-transform">
                                Chat with Coach →
                            </button>
                        </div>

                        {/* 4. Quick Log — 7 cols */}
                        <div className="col-span-12 lg:col-span-7 card p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold font-headline">Quick Log</h3>
                                <button className="text-primary text-xs font-bold hover:underline uppercase tracking-widest">
                                    View All
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {QUICK_LOG_SLOTS.map(({ label, icon }) => {
                                    const logged = logsByMeal[label]?.length > 0;
                                    const slotKcal = logsByMeal[label]?.reduce((s, l) => s + l.kcal, 0) || 0;
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => setShowModal(true)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl text-left transition-all group ${logged
                                                    ? 'bg-surface-container-low hover:bg-surface-container'
                                                    : 'bg-surface-container-low border-2 border-dashed border-outline-variant hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                                <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${logged ? 'text-on-surface' : 'text-outline'}`}>{label}</p>
                                                <p className="text-[10px] text-on-surface-variant">
                                                    {logged ? `${slotKcal} kcal logged` : 'Not logged yet'}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Recent Activity — 12 cols */}
                        <div className="col-span-12 card p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold font-headline">Recent Activity</h3>
                                <span className="text-xs text-on-surface-variant font-medium">Logged Foods</span>
                            </div>
                            <div className="overflow-x-auto no-scrollbar">
                                <div className="flex gap-6 min-w-max">
                                    {useLogStore.getState().todayLogs.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center w-full py-8 text-on-surface-variant">
                                            <span className="material-symbols-outlined text-4xl mb-2 text-outline">restaurant</span>
                                            <p className="text-sm">No meals logged today. Start by logging a meal!</p>
                                        </div>
                                    ) : (
                                        useLogStore.getState().todayLogs.slice(0, 6).map((log, i) => (
                                            <div key={i} className="w-44 group cursor-pointer shrink-0">
                                                <div className="w-44 h-28 rounded-2xl overflow-hidden mb-3 relative bg-surface-container-low flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl text-outline">restaurant</span>
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-primary">
                                                        {MEAL_GRADES[i % 4]} GRADE
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold truncate text-on-surface">{log.name}</h4>
                                                <p className="text-xs text-on-surface-variant">{log.kcal} kcal · {log.mealType}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {showModal && <LogMealModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
