import { useState, useEffect, useMemo, useCallback } from 'react';
import localforage from 'localforage';
import { updateBillingDates } from '../lib/utils';
import { DEFAULT_SUBSCRIPTIONS } from '../lib/constants';

export const useSubscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const savedSubs = await localforage.getItem('subscriptions_pwa');
                const savedHistory = await localforage.getItem('history_pwa');

                if (savedSubs) {
                    setSubscriptions(updateBillingDates(savedSubs));
                } else {
                    setSubscriptions(updateBillingDates(DEFAULT_SUBSCRIPTIONS));
                }

                if (savedHistory) setHistory(savedHistory);
                setIsLoaded(true);
            } catch (err) {
                console.error(err);
                setIsLoaded(true);
            }
        };
        loadData();
    }, []);

    // Save data on change
    useEffect(() => {
        if (isLoaded) localforage.setItem('subscriptions_pwa', subscriptions);
    }, [subscriptions, isLoaded]);

    useEffect(() => {
        if (isLoaded) localforage.setItem('history_pwa', history);
    }, [history, isLoaded]);

    // Actions
    const addSubscription = useCallback((sub) => {
        const newSub = { ...sub, id: Date.now() };
        setSubscriptions(prev => [...prev, newSub]);
        setHistory(prev => [{
            id: Date.now(),
            subId: newSub.id,
            subName: newSub.name,
            action: '新規契約',
            date: new Date().toISOString().split('T')[0],
            amount: newSub.amount,
            cycle: newSub.cycle
        }, ...prev]);
    }, []);

    const updateSubscription = useCallback((updatedSub) => {
        setSubscriptions(prev => prev.map(sub => sub.id === updatedSub.id ? updatedSub : sub));
    }, []);

    const deleteSubscription = useCallback((id) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
        setHistory(prev => prev.filter(h => h.subId !== id));
    }, []);

    const toggleStatus = useCallback((id, resumeAmount = null) => {
        setSubscriptions(prev => {
            const sub = prev.find(s => s.id === id);
            if (!sub) return prev;

            const isResuming = !sub.isActive;
            const newAmount = isResuming && resumeAmount ? resumeAmount : sub.amount;

            setHistory(h => [{
                id: Date.now(),
                subId: id,
                subName: sub.name,
                action: isResuming ? '再契約' : '解約',
                date: new Date().toISOString().split('T')[0],
                amount: newAmount,
                cycle: sub.cycle
            }, ...h]);

            return prev.map(s => s.id === id ? { ...s, isActive: !s.isActive, amount: newAmount } : s);
        });
    }, []);

    const resetData = useCallback(async () => {
        setSubscriptions(DEFAULT_SUBSCRIPTIONS);
        setHistory([]);
        await localforage.clear();
    }, []);

    const importData = useCallback((data) => {
        if (data.subscriptions) setSubscriptions(updateBillingDates(data.subscriptions));
        if (data.history) setHistory(data.history);
    }, []);

    return {
        subscriptions,
        history,
        isLoaded,
        addSubscription,
        updateSubscription,
        deleteSubscription,
        toggleStatus,
        resetData,
        importData,
        setSubscriptions, // For direct manipulation if needed
        setHistory
    };
};
