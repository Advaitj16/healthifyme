import { useMemo, useState } from 'react';
import SideNavBar from '../components/layout/SideNavBar';
import TopNavBar from '../components/layout/TopNavBar';
import api from '../services/api';
import useLogStore from '../stores/logStore';

const PORTION_OPTIONS = [
    { key: 'S', label: 'Small', multiplier: 0.8 },
    { key: 'M', label: 'Medium', multiplier: 1.0 },
    { key: 'L', label: 'Large', multiplier: 1.25 },
];

const fallbackItems = [
    { name: 'Grilled Chicken Breast', weight_g: 130, kcal: 214, protein: 40, carbs: 0, fat: 5 },
    { name: 'Steamed Broccoli', weight_g: 120, kcal: 42, protein: 4, carbs: 7, fat: 0.5 },
    { name: 'Brown Rice', weight_g: 140, kcal: 170, protein: 3.5, carbs: 36, fat: 1.2 },
];

export default function FoodScanner() {
    const addLog = useLogStore((s) => s.addLog);
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedPortion, setSelectedPortion] = useState(1);
    const [analysis, setAnalysis] = useState(null);
    const [tip, setTip] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const portion = PORTION_OPTIONS[selectedPortion];
    const adjustedItems = useMemo(() => {
        if (!analysis?.items) return [];
        return analysis.items.map((item) => ({
            ...item,
            kcal: Math.round(item.kcal * portion.multiplier),
            protein: Math.round(item.protein * portion.multiplier),
            carbs: Math.round(item.carbs * portion.multiplier),
            fat: Math.round(item.fat * portion.multiplier),
        }));
    }, [analysis, portion]);

    const totals = adjustedItems.reduce(
        (acc, item) => ({
            kcal: acc.kcal + item.kcal,
            protein: acc.protein + item.protein,
            carbs: acc.carbs + item.carbs,
            fat: acc.fat + item.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const analyzeImage = async () => {
        if (!file) return;
        setError('');
        setProgress(0);
        setIsAnalyzing(true);

        let value = 0;
        const timer = setInterval(() => {
            value = Math.min(value + 10, 95);
            setProgress(value);
        }, 250);

        try {
            const parsedName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            setAnalysis({
                meal_name: parsedName || 'Scanned Meal',
                items: fallbackItems,
            });
            setTip('Great meal balance. Add a fiber-rich side if this is your post-workout meal.');
            setProgress(100);
        } catch {
            setError('Could not analyze this image. Try another file.');
        } finally {
            clearInterval(timer);
            setTimeout(() => setIsAnalyzing(false), 350);
        }
    };

    const confirmLogMeal = async () => {
        if (adjustedItems.length === 0) return;
        setSaving(true);
        setError('');
        try {
            for (const item of adjustedItems) {
                const response = await api.post('/logs', {
                    name: item.name,
                    mealType: 'Lunch',
                    kcal: item.kcal,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat,
                    portion: portion.label,
                });
                addLog(response.data.log);
            }
        } catch {
            setError('Meal analysis worked, but logging failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-surface">
            <SideNavBar />
            <div className="flex-1 pl-64">
                <TopNavBar />
                <main className="pt-8 pb-16 px-8 max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Food AI Scanner</h2>
                        <p className="text-on-surface-variant">Upload a meal photo, review detection, and log in one flow.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <section className="col-span-12 lg:col-span-7 card p-6">
                            <label
                                htmlFor="meal-upload"
                                className="cursor-pointer relative block rounded-3xl bg-surface-container-low p-10 text-center overflow-hidden"
                            >
                                <input
                                    id="meal-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-2xl" />
                                <div className="absolute -bottom-8 -right-8 w-36 h-36 rounded-full bg-primary-container/40 blur-2xl" />
                                <span className="material-symbols-outlined text-5xl text-primary relative">add_a_photo</span>
                                <p className="mt-3 font-bold text-on-surface relative">
                                    {file ? file.name : 'Drag a photo here or click to select'}
                                </p>
                                <p className="text-sm text-on-surface-variant relative">PNG / JPG / WEBP</p>
                            </label>

                            <div className="mt-5 flex gap-3 items-center">
                                <button className="btn-primary" onClick={analyzeImage} disabled={!file || isAnalyzing}>
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze Meal'}
                                </button>
                                {error && <span className="text-tertiary text-sm">{error}</span>}
                            </div>

                            {isAnalyzing && (
                                <div className="mt-4 bg-surface-container-low rounded-xl p-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Analysis Queue</p>
                                    <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                                        <div className="h-full vitality-gradient transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="col-span-12 lg:col-span-5 card p-6">
                            <h3 className="font-headline text-xl font-bold mb-2">Detected Items</h3>
                            <p className="text-sm text-on-surface-variant mb-4">{analysis?.meal_name || 'No meal analyzed yet'}</p>
                            <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
                                {adjustedItems.length === 0 ? (
                                    <p className="text-sm text-on-surface-variant py-6">Upload and analyze an image to see results.</p>
                                ) : (
                                    adjustedItems.map((item) => (
                                        <div key={item.name} className="bg-surface-container-low rounded-2xl p-3">
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs text-on-surface-variant">{item.weight_g}g detected</p>
                                            <p className="text-xs mt-1">{item.kcal} kcal</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-5 bg-primary/5 rounded-2xl p-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Macro Summary</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div><p className="text-on-surface-variant">Protein</p><p className="font-bold">{totals.protein}g</p></div>
                                    <div><p className="text-on-surface-variant">Carbs</p><p className="font-bold">{totals.carbs}g</p></div>
                                    <div><p className="text-on-surface-variant">Fat</p><p className="font-bold">{totals.fat}g</p></div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Portion Accuracy</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {PORTION_OPTIONS.map((opt, idx) => (
                                        <button
                                            key={opt.key}
                                            onClick={() => setSelectedPortion(idx)}
                                            className={selectedPortion === idx ? 'py-2 rounded-xl vitality-gradient text-white text-sm font-bold' : 'py-2 rounded-xl bg-surface-container-low text-sm font-bold text-on-surface-variant'}
                                        >
                                            {opt.key}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-primary w-full justify-center mt-5" onClick={confirmLogMeal} disabled={saving || adjustedItems.length === 0}>
                                {saving ? 'Logging Meal...' : 'Confirm & Log Meal'}
                            </button>

                            {tip && (
                                <div className="mt-4 bg-primary/5 rounded-2xl p-4">
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">AI Health Tip</p>
                                    <p className="text-sm text-on-surface-variant">{tip}</p>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
