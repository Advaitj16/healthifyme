import { useState } from 'react';
import useAuthStore from '../../stores/authStore';

export default function TopNavBar({ onLogMeal }) {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');

    return (
        <header className="glass-header sticky top-0 z-40 flex justify-between items-center h-16 w-full pl-8 pr-8">
            {/* Search */}
            <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full w-80">
                <span className="material-symbols-outlined text-outline text-[18px] mr-2">search</span>
                <input
                    className="bg-transparent border-none focus:outline-none text-sm font-body w-full placeholder:text-outline text-on-surface"
                    placeholder="Search metrics or meals..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-5">
                <button className="text-neutral-500 hover:text-primary transition-colors relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-tertiary rounded-full border-2 border-white" />
                </button>

                <button className="text-neutral-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">history</span>
                </button>

                {onLogMeal && (
                    <button
                        onClick={onLogMeal}
                        className="btn-primary text-sm py-2 px-4"
                    >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        Log Meal
                    </button>
                )}

                <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
}
