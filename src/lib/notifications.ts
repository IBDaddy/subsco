import { Subscription, Language } from '../types';
import { getDaysUntilBilling } from './utils';
import { TRANSLATIONS } from './constants';

const LAST_NOTIFIED_KEY = 'last_notified_date';

export const isNotificationSupported = (): boolean =>
    typeof window !== 'undefined' && 'Notification' in window;

export const getNotificationPermission = (): NotificationPermission =>
    isNotificationSupported() ? Notification.permission : 'denied';

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!isNotificationSupported()) return 'denied';
    try {
        return await Notification.requestPermission();
    } catch {
        return 'denied';
    }
};

/**
 * Fires a local notification summarizing billings due within the next 3 days.
 * Throttled to once per calendar day (per device) to avoid being noisy.
 */
export const notifyUpcomingBillings = (subscriptions: Subscription[], lang: Language): void => {
    if (!isNotificationSupported() || Notification.permission !== 'granted') return;

    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(LAST_NOTIFIED_KEY) === today) return;

    const upcoming = subscriptions
        .filter(s => s.isActive)
        .map(sub => ({ sub, days: getDaysUntilBilling(sub.nextBilling) }))
        .filter(({ days }) => days >= 0 && days <= 3);

    if (upcoming.length === 0) return;

    const tr = TRANSLATIONS[lang].notify;
    const total = upcoming.reduce((sum, { sub }) => sum + sub.amount, 0);
    const body = upcoming
        .map(({ sub, days }) => `${sub.name} (${days === 0 ? tr.today : tr.inDays.replace('{days}', String(days))}) ¥${sub.amount.toLocaleString()}`)
        .join('\n');

    try {
        new Notification(tr.title.replace('{total}', total.toLocaleString()), {
            body,
            icon: '/pwa-192x192.png',
            tag: 'subsco-billing',
        });
        localStorage.setItem(LAST_NOTIFIED_KEY, today);
    } catch {
        /* notification construction can throw on some platforms; ignore */
    }
};
