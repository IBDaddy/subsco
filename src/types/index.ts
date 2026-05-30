export type Cycle = 'monthly' | 'yearly';
export type Category = 'エンタメ' | '仕事' | '健康' | '教育' | '生活' | 'その他';
export type Satisfaction = '高' | '中' | '低';
export type Frequency = '毎日' | '週1' | '月1' | 'ほぼ未使用';
export type PaymentMethod = 'credit' | 'googleplay' | 'appstore' | 'bank' | 'other';
export type Currency = 'JPY' | 'USD';
export type Language = 'ja' | 'en';
export type Theme = 'light' | 'dark' | 'system';

export interface Subscription {
    id: number;
    name: string;
    amount: number;
    cycle: Cycle;
    nextBilling: string; // YYYY-MM-DD
    category: Category;
    satisfaction: Satisfaction;
    frequency: Frequency;
    paymentMethod?: PaymentMethod;
    color: string;
    isActive: boolean;
    type?: 'subscription' | 'education';
}

export interface HistoryItem {
    id: number;
    subId: number;
    subName: string;
    action: '新規契約' | '解約' | '再契約' | 'New' | 'Canceled' | 'Resumed'; // Simple string union for now, could be improved with i18n keys
    date: string;
    amount: number;
    cycle: Cycle;
}

export interface BackupData {
    subscriptions: Subscription[];
    history: HistoryItem[];
    exportedAt: string;
}
