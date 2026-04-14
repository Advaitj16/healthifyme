import { create } from 'zustand';

const useLogStore = create((set, get) => ({
    todayLogs: [],
    totalKcal: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    recentScans: [],

    setTodayLogs: (logs) => {
        const total = logs.reduce((sum, l) => sum + (l.kcal || 0), 0);
        const macros = logs.reduce(
            (acc, l) => ({
                protein: acc.protein + (l.protein || 0),
                carbs: acc.carbs + (l.carbs || 0),
                fat: acc.fat + (l.fat || 0),
            }),
            { protein: 0, carbs: 0, fat: 0 }
        );
        set({ todayLogs: logs, totalKcal: total, macros });
    },

    addLog: (log) => {
        const logs = [...get().todayLogs, log];
        get().setTodayLogs(logs);
    },

    setRecentScans: (scans) => set({ recentScans: scans }),

    clearLogs: () =>
        set({ todayLogs: [], totalKcal: 0, macros: { protein: 0, carbs: 0, fat: 0 } }),
}));

export default useLogStore;
