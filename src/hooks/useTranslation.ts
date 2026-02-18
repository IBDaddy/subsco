import { useCallback } from 'react';
import { TRANSLATIONS } from '../lib/constants';
import { Language } from '../types';

type TranslationTree = (typeof TRANSLATIONS)[Language];

/**
 * Safely traverses a nested object by dot-separated path.
 * Returns the value at the path, or the path string itself as fallback.
 */
const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
    const result = path.split('.').reduce<unknown>((current, key) => {
        if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
            return (current as Record<string, unknown>)[key];
        }
        return undefined;
    }, obj);
    return typeof result === 'string' ? result : path;
};

export const useTranslation = (lang: Language) => {
    const translations: TranslationTree = TRANSLATIONS[lang];

    const t = useCallback((path: string): string => {
        return getNestedValue(translations as unknown as Record<string, unknown>, path);
    }, [translations]);

    const getDisplayLabel = useCallback((key: string): string => {
        const dataMap = translations.dataMap;
        return (dataMap as Record<string, string>)[key] || key;
    }, [translations]);

    return { t, getDisplayLabel };
};
