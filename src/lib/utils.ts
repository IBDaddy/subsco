import { Subscription, Language } from '../types';
import { TRANSLATIONS } from './constants';

export const updateBillingDates = (subs: Subscription[]): Subscription[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return subs.map(sub => {
        let billing = new Date(sub.nextBilling);
        if (isNaN(billing.getTime())) return sub;
        if (billing >= today) return sub;
        while (billing < today) {
            if (sub.cycle === 'monthly') {
                billing.setMonth(billing.getMonth() + 1);
            } else {
                billing.setFullYear(billing.getFullYear() + 1);
            }
        }
        return { ...sub, nextBilling: billing.toISOString().split('T')[0] };
    });
};

export const getDaysUntilBilling = (date: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billing = new Date(date);
    billing.setHours(0, 0, 0, 0);
    return Math.ceil((billing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getMonthlyAmount = (sub: Subscription): number => sub.cycle === 'yearly' ? Math.round(sub.amount / 12) : sub.amount;
export const getYearlyAmount = (sub: Subscription): number => sub.cycle === 'monthly' ? sub.amount * 12 : sub.amount;

export const getCancelScore = (sub: Subscription): number => {
    const satScore: Record<string, number> = { '高': 0, '中': 1, '低': 2 };
    const freqScore: Record<string, number> = { '毎日': 0, '週1': 1, '月1': 2, 'ほぼ未使用': 3 };
    return satScore[sub.satisfaction] + freqScore[sub.frequency];
};

export const getCancelRecommendation = (score: number, lang: Language) => {
    const texts = TRANSLATIONS[lang].rec;
    if (score >= 4) return { label: texts.cancel, color: 'bg-rose-100 text-rose-600 border-rose-200' };
    if (score >= 3) return { label: texts.check, color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return null;
};

export const getUrgencyColor = (days: number): string => {
    if (days < 0) return 'text-skin-subtext';
    if (days <= 3) return 'text-rose-500 font-bold';
    if (days <= 7) return 'text-amber-500 font-bold';
    return 'text-emerald-500';
};
