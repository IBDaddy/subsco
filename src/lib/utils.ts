import { Subscription, HistoryItem, BackupData, Language } from '../types';
import { TRANSLATIONS } from './constants';
import { CATEGORIES, SATISFACTION_LEVELS, FREQUENCY_LEVELS, PAYMENT_METHODS } from './constants';

export const updateBillingDates = (subs: Subscription[]): Subscription[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return subs.map(rawSub => {
        // Migrate legacy 'education' type to the new 'fixed' type
        const legacyType = (rawSub as Subscription & { type?: string }).type;
        const sub: Subscription = legacyType === 'education' ? { ...rawSub, type: 'fixed' } : rawSub;

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

// Fixed costs (NHK, insurance, etc.) are mandatory and excluded from cancel review.
export const isFixed = (sub: Subscription): boolean => sub.type === 'fixed';
export const isSubscription = (sub: Subscription): boolean => sub.type !== 'fixed';

/**
 * Computes savings potential: subscriptions (not fixed costs) flagged as cancel
 * candidates (high cancel score), with the yearly amount that could be saved.
 */
export const getSavingsPotential = (subs: Subscription[]) => {
    const candidates = subs
        .filter(s => s.isActive && isSubscription(s) && getCancelScore(s) >= 4)
        .sort((a, b) => getYearlyAmount(b) - getYearlyAmount(a));
    const yearlySavings = candidates.reduce((sum, s) => sum + getYearlyAmount(s), 0);
    const totalActiveYearly = subs
        .filter(s => s.isActive)
        .reduce((sum, s) => sum + getYearlyAmount(s), 0);
    const share = totalActiveYearly > 0 ? (yearlySavings / totalActiveYearly) * 100 : 0;
    return { candidates, yearlySavings, totalActiveYearly, share };
};

export const getCancelScore = (sub: Subscription): number => {
    const satScore: Record<string, number> = { '高': 0, '中': 1, '低': 2 };
    const freqScore: Record<string, number> = { '毎日': 0, '週1': 1, '月1': 2, 'ほぼ未使用': 3 };
    return satScore[sub.satisfaction] + freqScore[sub.frequency];
};

export const getCancelRecommendation = (score: number, lang: Language) => {
    const texts = TRANSLATIONS[lang].rec;
    if (score >= 4) return { label: texts.cancel, color: 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/40 dark:text-rose-400 dark:border-rose-800' };
    if (score >= 3) return { label: texts.check, color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800' };
    return null;
};

export const getUrgencyColor = (days: number): string => {
    if (days < 0) return 'text-skin-subtext';
    if (days <= 3) return 'text-rose-500 font-bold';
    if (days <= 7) return 'text-amber-500 font-bold';
    return 'text-emerald-500';
};

const VALID_CYCLES = ['monthly', 'yearly'] as const;
const VALID_CATEGORIES = CATEGORIES as readonly string[];
const VALID_SATISFACTIONS = SATISFACTION_LEVELS as readonly string[];
const VALID_FREQUENCIES = FREQUENCY_LEVELS as readonly string[];
const VALID_PAYMENT_METHODS = PAYMENT_METHODS as readonly string[];

const isValidSubscription = (sub: unknown): sub is Subscription => {
    if (typeof sub !== 'object' || sub === null) return false;
    const s = sub as Record<string, unknown>;
    return (
        typeof s.id === 'number' &&
        typeof s.name === 'string' && s.name.trim().length > 0 &&
        typeof s.amount === 'number' && s.amount > 0 &&
        typeof s.cycle === 'string' && VALID_CYCLES.includes(s.cycle as typeof VALID_CYCLES[number]) &&
        typeof s.nextBilling === 'string' && !isNaN(new Date(s.nextBilling).getTime()) &&
        typeof s.category === 'string' && VALID_CATEGORIES.includes(s.category) &&
        typeof s.satisfaction === 'string' && VALID_SATISFACTIONS.includes(s.satisfaction) &&
        typeof s.frequency === 'string' && VALID_FREQUENCIES.includes(s.frequency) &&
        (s.paymentMethod === undefined || (typeof s.paymentMethod === 'string' && VALID_PAYMENT_METHODS.includes(s.paymentMethod))) &&
        typeof s.color === 'string' &&
        typeof s.isActive === 'boolean'
    );
};

const isValidHistoryItem = (item: unknown): item is HistoryItem => {
    if (typeof item !== 'object' || item === null) return false;
    const h = item as Record<string, unknown>;
    return (
        typeof h.id === 'number' &&
        typeof h.subId === 'number' &&
        typeof h.subName === 'string' &&
        typeof h.action === 'string' &&
        typeof h.date === 'string' &&
        typeof h.amount === 'number' &&
        typeof h.cycle === 'string' && VALID_CYCLES.includes(h.cycle as typeof VALID_CYCLES[number])
    );
};

export const validateImportData = (data: unknown): { valid: true; data: BackupData } | { valid: false; error: string } => {
    if (typeof data !== 'object' || data === null) {
        return { valid: false, error: 'Invalid data format' };
    }

    const d = data as Record<string, unknown>;

    if (!Array.isArray(d.subscriptions)) {
        return { valid: false, error: 'Missing subscriptions array' };
    }

    const invalidSubs = d.subscriptions.filter((s: unknown) => !isValidSubscription(s));
    if (invalidSubs.length > 0) {
        return { valid: false, error: `${invalidSubs.length} invalid subscription(s) found` };
    }

    const history = Array.isArray(d.history) ? d.history : [];
    const invalidHistory = history.filter((h: unknown) => !isValidHistoryItem(h));
    if (invalidHistory.length > 0) {
        return { valid: false, error: `${invalidHistory.length} invalid history item(s) found` };
    }

    return {
        valid: true,
        data: {
            subscriptions: d.subscriptions as Subscription[],
            history: history as HistoryItem[],
            exportedAt: typeof d.exportedAt === 'string' ? d.exportedAt : new Date().toISOString()
        }
    };
};
