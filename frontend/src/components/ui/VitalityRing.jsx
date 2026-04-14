/**
 * VitalityRing — SVG circular progress component
 * Props:
 *   value: 0–100 (percent consumed)
 *   consumed: number (kcal consumed)
 *   remaining: number (kcal remaining)
 */
export default function VitalityRing({ value = 0, consumed = 0, remaining = 0, exercise = 0 }) {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex items-center gap-12">
            {/* Ring */}
            <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
                    {/* Track */}
                    <circle
                        cx="96" cy="96" r={radius}
                        fill="transparent"
                        stroke="#e1e3e2"
                        strokeWidth="16"
                    />
                    {/* Progress */}
                    <circle
                        cx="96" cy="96" r={radius}
                        fill="transparent"
                        stroke="#006e2d"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-700 ease-out"
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-extrabold text-on-surface tracking-tighter font-headline">
                        {remaining.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        Kcal Left
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-6">
                <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                        CONSUMED
                    </p>
                    <p className="text-2xl font-extrabold text-on-surface font-headline">
                        {consumed.toLocaleString()}{' '}
                        <span className="text-sm font-normal text-on-surface-variant">kcal</span>
                    </p>
                </div>
                <div>
                    <p className="text-xs font-bold text-on-surface-variant mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-tertiary inline-block" />
                        EXERCISE
                    </p>
                    <p className="text-2xl font-extrabold text-on-surface font-headline">
                        {exercise}{' '}
                        <span className="text-sm font-normal text-on-surface-variant">kcal</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
