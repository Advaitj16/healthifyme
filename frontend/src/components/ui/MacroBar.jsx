/**
 * MacroBar — Horizontal progress bar for a single macro
 * Props: label, current, target, color ('emerald'|'teal'|'amber')
 */
export default function MacroBar({ label, current = 0, target = 1, colorClass = 'bg-primary' }) {
    const pct = Math.min((current / target) * 100, 100);
    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-on-surface">{label}</span>
                <span className="text-xs text-on-surface-variant font-medium">
                    {Math.round(current)}g / {Math.round(target)}g
                </span>
            </div>
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
