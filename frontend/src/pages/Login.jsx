import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

export default function Login() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            setAuth(res.data.user, res.data.accessToken);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary-gradient flex-col justify-between p-12 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-white font-headline tracking-tight">HealthifyMe</h1>
                    <p className="text-emerald-100/70 text-sm font-bold uppercase tracking-widest mt-1">Clinical Atelier</p>
                </div>
                <div className="relative z-10">
                    <blockquote className="text-white text-3xl font-bold font-headline leading-snug mb-4">
                        "Intelligence meets wellness."
                    </blockquote>
                    <p className="text-emerald-100/80 text-sm leading-relaxed">
                        AI-powered food tracking, dynamic meal planning, and a personal digital coach — all in one clinical-grade platform.
                    </p>
                </div>
                {/* Decorative rings */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[40px] border-white/5" />
                <div className="absolute -bottom-4 -right-4 w-48 h-48 rounded-full border-[24px] border-white/5" />
                <div className="absolute top-20 right-0 w-32 h-32 rounded-full border-[16px] border-white/5" />
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold font-headline text-on-surface mb-2">Welcome back</h2>
                        <p className="text-on-surface-variant">Sign in to your HealthifyMe account</p>
                    </div>

                    {error && (
                        <div className="mb-5 px-4 py-3 bg-error-container rounded-xl text-tertiary text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary justify-center py-3.5 text-base mt-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
