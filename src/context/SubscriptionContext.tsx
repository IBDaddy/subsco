import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localforage from 'localforage';
import { Subscription, HistoryItem, BackupData, Language, Theme } from '../types';
import { updateBillingDates } from '../lib/utils';
import { DEFAULT_SUBSCRIPTIONS } from '../lib/constants';
import { notifyUpcomingBillings } from '../lib/notifications';

interface SubscriptionContextType {
    subscriptions: Subscription[];
    history: HistoryItem[];
    isLoaded: boolean;
    lang: Language;
    theme: Theme;
    monthlyIncome: number | '';
    setLang: (lang: Language) => void;
    setTheme: (theme: Theme) => void;
    setMonthlyIncome: (income: number | '') => void;
    addSubscription: (sub: Omit<Subscription, 'id'>) => void;
    updateSubscription: (sub: Subscription) => void;
    deleteSubscription: (id: number) => void;
    toggleStatus: (id: number, resumeAmount?: number) => void;
    resetData: () => Promise<void>;
    importData: (data: BackupData) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [lang, setLang] = useState<Language>('ja');
    const [theme, setTheme] = useState<Theme>('system');
    const [monthlyIncome, setMonthlyIncome] = useState<number | ''>('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedSubs = await localforage.getItem<Subscription[]>('subscriptions_pwa');
                const savedHistory = await localforage.getItem<HistoryItem[]>('history_pwa');
                const savedLang = await localforage.getItem<Language>('language_pwa');
                const savedTheme = await localforage.getItem<Theme>('theme_pwa');
                const savedIncome = await localforage.getItem<number | ''>('monthly_income_pwa');

                const loadedSubs = updateBillingDates(savedSubs || DEFAULT_SUBSCRIPTIONS);
                setSubscriptions(loadedSubs);

                if (savedHistory) setHistory(savedHistory);
                if (savedLang) setLang(savedLang);
                if (savedTheme) setTheme(savedTheme);
                if (savedIncome) setMonthlyIncome(savedIncome);

                setIsLoaded(true);

                // Fire a once-per-day reminder for billings due soon (if permitted)
                notifyUpcomingBillings(loadedSubs, savedLang || 'ja');
            } catch (err) {
                console.error(err);
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);

    // Persistence
    useEffect(() => { if (isLoaded) localforage.setItem('subscriptions_pwa', subscriptions); }, [subscriptions, isLoaded]);
    useEffect(() => { if (isLoaded) localforage.setItem('history_pwa', history); }, [history, isLoaded]);
    useEffect(() => { if (isLoaded) localforage.setItem('language_pwa', lang); }, [lang, isLoaded]);
    useEffect(() => { if (isLoaded) localforage.setItem('theme_pwa', theme); }, [theme, isLoaded]);
    useEffect(() => { if (isLoaded) localforage.setItem('monthly_income_pwa', monthlyIncome); }, [monthlyIncome, isLoaded]);

    // Apply theme to <html>, following system preference when set to 'system'
    useEffect(() => {
        const root = document.documentElement;
        const applyTheme = () => {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
            root.classList.toggle('dark', isDark);
        };
        applyTheme();

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            mq.addEventListener('change', applyTheme);
            return () => mq.removeEventListener('change', applyTheme);
        }
    }, [theme]);

    // Actions
    const addSubscription = (subData: Omit<Subscription, 'id'>) => {
        const newSub = { ...subData, id: Date.now() } as Subscription;
        setSubscriptions(prev => [...prev, newSub]);
        setHistory(prev => [{
            id: Date.now(),
            subId: newSub.id,
            subName: newSub.name,
            action: '新規契約', // Ideally mapped in view or here if localized
            date: new Date().toISOString().split('T')[0],
            amount: newSub.amount,
            cycle: newSub.cycle
        }, ...prev]);
    };

    const updateSubscription = (updatedSub: Subscription) => {
        setSubscriptions(prev => prev.map(sub => sub.id === updatedSub.id ? updatedSub : sub));
    };

    const deleteSubscription = (id: number) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
        setHistory(prev => prev.filter(h => h.subId !== id));
    };

    const toggleStatus = (id: number, resumeAmount?: number) => {
        // Use current state from closure
        const sub = subscriptions.find(s => s.id === id);
        if (!sub) return;

        const isResuming = !sub.isActive;
        const newAmount = (isResuming && resumeAmount !== undefined) ? resumeAmount : sub.amount;

        // 1. Update Subscriptions
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive, amount: newAmount } : s));

        // 2. Update History with Deduplication (Prevent double-firing)
        setHistory(prev => {
            const last = prev[0];
            const action = isResuming ? '再契約' : '解約';
            const now = Date.now();

            // If same action for same sub within 2 seconds, ignore
            if (last && last.subId === id && last.action === action && (now - last.id < 2000)) {
                return prev;
            }

            return [{
                id: now,
                subId: id,
                subName: sub.name,
                action: action,
                date: new Date().toISOString().split('T')[0],
                amount: newAmount,
                cycle: sub.cycle
            }, ...prev];
        });
    };

    const resetData = async () => {
        setSubscriptions(DEFAULT_SUBSCRIPTIONS);
        setHistory([]);
        setMonthlyIncome('');
        await localforage.clear();
    };

    const importData = (data: BackupData) => {
        setSubscriptions(updateBillingDates(data.subscriptions));
        setHistory(data.history);
    };

    return (
        <SubscriptionContext.Provider value={{
            subscriptions, history, isLoaded, lang, theme, monthlyIncome,
            setLang, setTheme, setMonthlyIncome,
            addSubscription, updateSubscription, deleteSubscription, toggleStatus, resetData, importData
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscriptionContext = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
    }
    return context;
};
