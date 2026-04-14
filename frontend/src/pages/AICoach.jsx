import { useState } from 'react';
import SideNavBar from '../components/layout/SideNavBar';
import TopNavBar from '../components/layout/TopNavBar';
import api from '../services/api';

const QUICK_REPLIES = ['Analyze my lunch', 'Suggest a snack', 'Water reminder'];

export default function AICoach() {
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Good to see you. Share your meal details and I will optimize your next intake.' },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);

    const sendMessage = async (text) => {
        const clean = text.trim();
        if (!clean) return;
        setMessages((prev) => [...prev, { role: 'user', text: clean }]);
        setInput('');
        setSending(true);

        try {
            const response = await api.post('/chat', { message: clean });
            const reply = response.data?.reply || 'I could not generate a reply right now.';
            setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: 'Connection issue. Try again in a moment.' },
            ]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-surface">
            <SideNavBar />
            <div className="flex-1 pl-64">
                <TopNavBar />
                <main className="pt-8 pb-16 px-8 max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">AI Coach</h2>
                        <p className="text-on-surface-variant">Chat with your assistant for food and macro guidance.</p>
                    </div>

                    <div className="grid grid-cols-12 gap-6">
                        <section className="col-span-12 lg:col-span-8 card p-5 flex flex-col h-[70vh]">
                            <div className="flex-1 overflow-y-auto no-scrollbar pr-2 space-y-4">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={msg.role === 'user' ? 'max-w-[75%] p-3 rounded-2xl vitality-gradient text-white text-sm' : 'max-w-[75%] p-3 rounded-2xl bg-surface-container-low text-sm text-on-surface'}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {sending && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[75%] p-3 rounded-2xl bg-surface-container-low text-sm text-on-surface-variant">
                                            Typing...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4">
                                <div className="flex gap-2 mb-3 flex-wrap">
                                    {QUICK_REPLIES.map((prompt) => (
                                        <button key={prompt} className="bg-surface-container-low px-3 py-1.5 rounded-full text-xs font-medium" onClick={() => sendMessage(prompt)}>
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-surface-container-lowest rounded-2xl p-2 flex gap-2 items-center">
                                    <input
                                        className="input-field flex-1"
                                        value={input}
                                        placeholder="Ask your coach..."
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                    />
                                    <button className="btn-primary px-4 py-2" onClick={() => sendMessage(input)} disabled={sending}>
                                        Send
                                    </button>
                                </div>
                            </div>
                        </section>

                        <aside className="col-span-12 lg:col-span-4 space-y-4">
                            <div className="card p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Consistency</p>
                                <p className="text-2xl font-headline font-extrabold">6 day streak</p>
                            </div>
                            <div className="card p-5">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Today's Focus</p>
                                <p className="text-sm text-on-surface-variant">Hydration goal: 2.5L</p>
                                <div className="w-full h-2 rounded-full bg-surface-container mt-3">
                                    <div className="h-full rounded-full bg-emerald-700 w-3/5" />
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
