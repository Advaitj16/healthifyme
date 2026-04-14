import { NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

const navItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { to: '/scanner', icon: 'document_scanner', label: 'Food Scanner' },
    { to: '/planner', icon: 'calendar_month', label: 'Diet Planner' },
    { to: '/coach', icon: 'forum', label: 'AI Coach' },
];

export default function SideNavBar() {
    const { user, logout } = useAuthStore();

    return (
        <aside className="h-screen w-64 fixed left-0 top-0 glass-nav flex flex-col py-6 px-4 z-50">
            {/* Brand */}
            <div className="mb-10 px-2">
                <h1 className="text-xl font-bold text-emerald-800 tracking-tight font-headline">
                    HealthifyMe
                </h1>
                <p className="text-[10px] uppercase tracking-widest text-emerald-600/70 font-bold mt-1">
                    Clinical Atelier
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-headline transition-colors ${isActive
                                ? 'text-emerald-700 font-bold border-r-2 border-emerald-600 bg-emerald-100/30'
                                : 'text-neutral-500 hover:text-emerald-600 hover:bg-emerald-100/50'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined text-[22px]">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Upgrade Card */}
            <div className="mt-auto space-y-2">
                <div className="px-3 py-4 mb-2 rounded-2xl bg-emerald-100/40">
                    <p className="text-xs font-bold text-emerald-800 mb-1">Upgrade to Pro</p>
                    <p className="text-[10px] text-emerald-700 mb-3 leading-relaxed">
                        Access clinical-grade insights and advanced macro tracking.
                    </p>
                    <button className="w-full vitality-gradient text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-wider">
                        Upgrade Now
                    </button>
                </div>

                {/* User + Logout */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'User'}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{user?.goal || 'No goal set'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-neutral-400 hover:text-tertiary transition-colors"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
