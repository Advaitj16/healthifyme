import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuthStore from './stores/authStore';
import Dashboard from './pages/Dashboard';
import FoodScanner from './pages/FoodScanner';
import DietPlanner from './pages/DietPlanner';
import AICoach from './pages/AICoach';
import Login from './pages/Login';
import Register from './pages/Register';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 1000 * 30, retry: 1 },
    },
});

function ProtectedRoute({ children }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                    {/* Protected */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/scanner" element={<ProtectedRoute><FoodScanner /></ProtectedRoute>} />
                    <Route path="/planner" element={<ProtectedRoute><DietPlanner /></ProtectedRoute>} />
                    <Route path="/coach" element={<ProtectedRoute><AICoach /></ProtectedRoute>} />

                    {/* Default */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}
