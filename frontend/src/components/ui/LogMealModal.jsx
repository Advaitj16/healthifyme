import { useState } from 'react';
import api from '../../services/api';
import useLogStore from '../../stores/logStore';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const PORTIONS = [
    { label: 'Small', multiplier: 0.75 },
    { label: 'Medium', multiplier: 1.0 },
    { label: 'Large', multiplier: 1.35 },
];

export default function LogMealModal({ onClose }) {
    const addLog = useLogStore((s) => s.addLog);
    const [step, setStep] = useState('search'); // 'search' | 'confirm'
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState(null);
    const [mealType, setMealType] = useState('Breakfast');
    const [portion, setPortion] = useState(1); // index into PORTIONS
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const searchFood = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/nutrition/search?q=${encodeURIComponent(query)}`);
            setResults(res.data.hints || []);
        } catch {
            setError('Could not search foods. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectFood = (food) => {
        setSelected(food);
        setStep('confirm');
    };

    const confirmLog = async () => {
        if (!selected) return;
        setSaving(true);
        const mult = PORTIONS[portion].multiplier;
        const logData = {
            name: selected.food.label,
            mealType,
            kcal: Math.round((selected.food.nutrients?.ENERC_KCAL || 0) * mult),
            protein: Math.round((selected.food.nutrients?.PROCNT || 0) * mult),
            carbs: Math.round((selected.food.nutrients?.CHOCDF || 0) * mult),
            fat: Math.round((selected.food.nutrients?.FAT || 0) * mult),
            portion: PORTIONS[portion].label,
            foodId: selected.food.foodId,
        };
        try {
            const res = await api.post('/logs', logData);
            addLog(res.data.log);
            onClose();
        } catch {
            setError('Could not save log. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const mult = PORTIONS[portion].multiplier;
    const kcal = selected ? Math.round((selected.food.nutrients?.ENERC_KCAL || 0) * mult) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 backdrop-blur-sm">
            <div className="bg-surface-container-lowest rounded-3xl shadow-float w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <h2 className="text-xl font-bold font-headline">
                        {step === 'search' ? 'Search Food' : 'Confirm Meal'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px] text-outline">close</span>
                    </button>
                </div>

                <div className="px-6 pb-6">
                    {step === 'search' ? (
                        <>
                            {/* Meal Type */}
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {MEAL_TYPES.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setMealType(t)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${mealType === t
                                                ? 'vitality-gradient text-white'
                                                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Search Input */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    className="input-field flex-1"
                                    placeholder="e.g. Grilled Chicken, Oats..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchFood()}
                                />
                                <button
                                    onClick={searchFood}
                                    className="btn-primary px-4 py-2.5 text-sm"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                    )}
                                </button>
                            </div>

                            {error && <p className="text-tertiary text-xs mb-3">{error}</p>}

                            {/* Results */}
                            <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                                {results.length === 0 && !loading && (
                                    <p className="text-center text-on-surface-variant text-sm py-8">
                                        Search for a food item to get started
                                    </p>
                                )}
                                {results.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectFood(item)}
                                        className="w-full flex items-center justify-between p-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-left transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">{item.food.label}</p>
                                            <p className="text-[10px] text-on-surface-variant">
                                                {item.food.category} · {Math.round(item.food.nutrients?.ENERC_KCAL || 0)} kcal/100g
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-[18px] text-primary">chevron_right</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Confirm step */}
                            <div className="bg-surface-container-low rounded-2xl p-4 mb-5">
                                <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-1">{mealType}</p>
                                <p className="text-lg font-bold font-headline">{selected?.food.label}</p>
                                <p className="text-3xl font-extrabold text-primary font-headline mt-1">{kcal} <span className="text-sm font-normal text-on-surface-variant">kcal</span></p>
                                <div className="flex gap-4 mt-3 text-xs text-on-surface-variant">
                                    <span>Protein: {Math.round((selected?.food.nutrients?.PROCNT || 0) * mult)}g</span>
                                    <span>Carbs: {Math.round((selected?.food.nutrients?.CHOCDF || 0) * mult)}g</span>
                                    <span>Fat: {Math.round((selected?.food.nutrients?.FAT || 0) * mult)}g</span>
                                </div>
                            </div>

                            {/* Portion */}
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Portion Size</p>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                {PORTIONS.map((p, i) => (
                                    <button
                                        key={p.label}
                                        onClick={() => setPortion(i)}
                                        className={`py-3 rounded-xl text-sm font-bold transition-all ${portion === i
                                                ? 'vitality-gradient text-white shadow-lg shadow-primary/20'
                                                : 'bg-surface-container-low text-on-surface-variant border border-outline-variant hover:border-primary/40'
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>

                            {error && <p className="text-tertiary text-xs mb-3">{error}</p>}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep('search')}
                                    className="flex-1 btn-secondary py-3 justify-center text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={confirmLog}
                                    disabled={saving}
                                    className="flex-1 btn-primary py-3 justify-center text-sm"
                                >
                                    {saving ? 'Saving...' : 'Confirm & Log'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
