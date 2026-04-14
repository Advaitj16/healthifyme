import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class RootErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, message: error?.message || 'Unknown error' };
    }

    componentDidCatch(error) {
        console.error('Root render error:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-surface flex items-center justify-center px-6">
                    <div className="card p-8 max-w-xl w-full">
                        <h1 className="text-2xl font-headline font-bold text-tertiary mb-2">Frontend Runtime Error</h1>
                        <p className="text-on-surface-variant text-sm break-words">{this.state.message}</p>
                        <p className="text-xs text-on-surface-variant mt-4">
                            Open browser devtools console for full stack trace.
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

createRoot(document.getElementById('root')).render(
    
        <RootErrorBoundary>
            <App />
        </RootErrorBoundary>
   
);
