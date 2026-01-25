import { useState, useEffect } from 'react';
import localforage from 'localforage';

export const useSettings = () => {
    const [lang, setLang] = useState('ja');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedLang = await localforage.getItem('language_pwa');
                const savedIncome = await localforage.getItem('monthly_income_pwa');

                if (savedLang) setLang(savedLang);
                if (savedIncome) setMonthlyIncome(Number(savedIncome));

                setIsLoaded(true);
            } catch (err) {
                console.error(err);
                setIsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        if (isLoaded) localforage.setItem('language_pwa', lang);
    }, [lang, isLoaded]);

    useEffect(() => {
        if (isLoaded) localforage.setItem('monthly_income_pwa', monthlyIncome);
    }, [monthlyIncome, isLoaded]);

    // Theme handling could be here too, but often it's handled on body class
    // We'll keep it simple and just expose the state if we needed persistence, 
    // but the original code didn't explicit persist theme to storage, only in memory? 
    // Wait, the original code had `darkMode: 'class'` in tailwind config but no explicit theme toggle logic in the prompt's provided code?
    // Actually, I don't see a dark mode toggle in the UI code provided in the prompt. 
    // The CSS has `.dark` styles, but I don't see a button to switch it. 
    // I will add system preference detection or a toggle later if requested.
    // For now, I'll stick to what was there.

    return {
        lang,
        setLang,
        monthlyIncome,
        setMonthlyIncome,
        isLoaded
    };
};
