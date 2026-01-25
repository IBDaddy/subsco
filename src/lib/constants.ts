import { Category, Satisfaction, Frequency, Subscription } from '../types';

export const TRANSLATIONS = {
    ja: {
        appTitle: 'Subsco',
        appDesc: '満足度×頻度で最適化',
        currency: '¥',
        cycle: { monthly: '月額', yearly: '年額', mo: '月', yr: '年' },
        tab: { list: '一覧', matrix: '分析', analysis: 'グラフ', history: '履歴', settings: '設定' },
        stats: { total: '合計支出', active: '契約中', savings: '削減余地', items: '件', chart: '内訳' },
        sort: { date: '更新が近い順', price: '金額が高い順', satisfaction: '満足度が低い順' },
        card: { expired: '期限切れ', today: '今日請求', daysLeft: 'あと{days}日' },
        status: { paused: '停止中', resume: '再開', stop: '停止' },
        matrix: { axisX: '満足度', axisY: '頻度', description: '右下にあるサービスほど\n見直しの優先度が高いです' },
        analysis: {
            budgetCheck: '家計負担率チェック', incomeLabel: '手取り月収を入力', ratio: '固定費率',
            category: 'カテゴリ別', satisfaction: '満足度別', ranking: '支出ランキング (カテゴリ)'
        },
        history: { title: '活動履歴', noHistory: '履歴はありません', labels: { cancel: '解約', resume: '再契約', new: '新規契約' } },
        settings: {
            theme: 'デザインテーマ', language: '言語 / Language',
            backup: 'バックアップ', backupDesc: 'データをファイルに保存します。', btnBackup: 'データを保存',
            restore: '復元', restoreDesc: '保存したファイルからデータを復元します。', restoreWarn: '※上書きされます', btnRestore: 'ファイルを選択',
            reset: 'データ初期化', btnReset: 'すべてのデータを削除',
            donation: '開発等を支援', btnDonation: '開発者を支援する (励みになります！)',
            note: '開発者のNote (ibdaddy)'
        },
        modal: {
            add: '新規追加', edit: '編集', update: '更新する', addBtn: '追加する',
            deleteTitle: '削除の確認', deleteMsg: '完全に削除しますか？履歴も削除されます。', deleteBtn: '削除',
            resumeTitle: 'サービスの再開', resumeMsg: '再開後の金額を入力してください', resumeBtn: '再開する',
            restoreTitle: 'データの復元', restoreMsg: 'バックアップデータを復元しますか？現在のデータは上書きされます。', restoreBtn: '復元する',
            resetTitle: '初期化の確認', resetMsg: 'すべてのデータを削除しますか？この操作は取り消せません。', resetBtn: '削除する',
            cancel: 'キャンセル'
        },
        form: {
            name: 'サービス名', amount: '金額', cycle: 'サイクル', nextBilling: '次回請求',
            category: 'カテゴリ', satisfaction: '満足度', frequency: '使用頻度',
            placeholderName: '例: Netflix', placeholderAmount: '0'
        },
        dataMap: {
            'エンタメ': 'エンタメ', '仕事': '仕事', '健康': '健康', '教育': '教育', '生活': '生活', 'その他': 'その他',
            '高': '高', '中': '中', '低': '低',
            '毎日': '毎日', '週1': '週1', '月1': '月1', 'ほぼ未使用': 'ほぼ未使用'
        },
        rec: {
            cancel: '解約検討', check: '要確認', wait: '様子見', keep: '継続'
        },
        budget: {
            great: '素晴らしい！余裕があります 💰',
            good: '適正範囲内です ✅',
            warning: '少し高いかも…見直し検討 🤔',
            danger: '使いすぎの可能性！要見直し 🚨',
            hint: '適正目安(5%):'
        }
    },
    en: {
        appTitle: 'Subsco',
        appDesc: 'Optimize with Satisfaction x Frequency',
        currency: '¥',
        cycle: { monthly: 'Monthly', yearly: 'Yearly', mo: 'mo', yr: 'yr' },
        tab: { list: 'List', matrix: 'Matrix', analysis: 'Charts', history: 'History', settings: 'Settings' },
        stats: { total: 'Total Expenses', active: 'Active', savings: 'Potential Savings', items: '', chart: 'Chart' },
        sort: { date: 'Renew Date', price: 'Price: High to Low', satisfaction: 'Satisfaction: Low to High' },
        card: { expired: 'Expired', today: 'Today', daysLeft: '{days} days' },
        status: { paused: 'Paused', resume: 'Resume', stop: 'Stop' },
        matrix: { axisX: 'Satisfaction', axisY: 'Frequency', description: 'Services in the bottom right\nare high priority for review' },
        analysis: {
            budgetCheck: 'Budget Health Check', incomeLabel: 'Monthly Net Income', ratio: 'Fixed Cost Ratio',
            category: 'By Category', satisfaction: 'By Satisfaction', ranking: 'Spending Ranking (Category)'
        },
        history: { title: 'Activity Log', noHistory: 'No History', labels: { cancel: 'Canceled', resume: 'Resumed', new: 'New' } },
        settings: {
            theme: 'Theme', language: 'Language / 言語',
            backup: 'Backup', backupDesc: 'Save data to a file.', btnBackup: 'Download Data',
            restore: 'Restore', restoreDesc: 'Restore data from a file.', restoreWarn: '*Overwrites current data', btnRestore: 'Select File',
            reset: 'Reset Data', btnReset: 'Delete All Data',
            donation: 'Support Developer', btnDonation: 'Support the Developer (It helps!)'
        },
        modal: {
            add: 'New Service', edit: 'Edit Service', update: 'Update', addBtn: 'Add',
            deleteTitle: 'Confirm Delete', deleteMsg: 'Are you sure you want to delete this? History will also be deleted.', deleteBtn: 'Delete',
            resumeTitle: 'Resume Service', resumeMsg: 'Please enter the amount after resuming.', resumeBtn: 'Resume',
            restoreTitle: 'Restore Data', restoreMsg: 'Do you want to restore backup data? Current data will be overwritten.', restoreBtn: 'Restore',
            resetTitle: 'Confirm Reset', resetMsg: 'Are you sure you want to delete all data? This action cannot be undone.', resetBtn: 'Delete',
            cancel: 'Cancel'
        },
        form: {
            name: 'Service Name', amount: 'Amount', cycle: 'Cycle', nextBilling: 'Next Billing',
            category: 'Category', satisfaction: 'Satisfaction', frequency: 'Frequency',
            placeholderName: 'e.g. Netflix', placeholderAmount: '0'
        },
        dataMap: {
            'エンタメ': 'Entertainment', '仕事': 'Work', '健康': 'Health', '教育': 'Education', '生活': 'Life', 'その他': 'Other',
            '高': 'High', 'High': 'High', '中': 'Mid', 'Mid': 'Mid', '低': 'Low', 'Low': 'Low',
            '毎日': 'Daily', 'Daily': 'Daily', '週1': 'Weekly', 'Weekly': 'Weekly', '月1': 'Monthly', 'Monthly': 'Monthly', 'ほぼ未使用': 'Rarely', 'Rarely': 'Rarely'
        },
        rec: {
            cancel: 'Cancel?', check: 'Check', wait: 'Wait', keep: 'Keep'
        },
        budget: {
            great: 'Great! You have budget to spare 💰',
            good: 'Within reasonable range ✅',
            warning: 'A bit high... Consider reviewing 🤔',
            danger: 'Potential overspending! Review needed 🚨',
            hint: 'Ideal (5%):'
        }
    }
} as const;

interface Preset {
    amount: number;
    category: Category;
    color: string;
}

export const PRESETS: Record<string, Preset> = {
    'Netflix': { amount: 1490, category: 'エンタメ', color: '#64748b' },
    'Spotify': { amount: 980, category: 'エンタメ', color: '#10b981' },
    'YouTube Premium': { amount: 1280, category: 'エンタメ', color: '#ef4444' },
    'Amazon Prime': { amount: 600, category: '生活', color: '#0ea5e9' },
    'Apple Music': { amount: 1080, category: 'エンタメ', color: '#f59e0b' },
    'iCloud+': { amount: 130, category: '生活', color: '#0ea5e9' },
    'ChatGPT Plus': { amount: 3000, category: '仕事', color: '#10b981' },
    'Adobe CC': { amount: 7780, category: '仕事', color: '#ef4444' },
    'DAZN': { amount: 4200, category: 'エンタメ', color: '#10b981' },
};

export const DEFAULT_SUBSCRIPTIONS: Subscription[] = [
    { id: 1, name: 'Netflix', amount: 1490, cycle: 'monthly', nextBilling: '2026-02-20', category: 'エンタメ', color: '#64748b', satisfaction: '高', frequency: '週1', isActive: true },
    { id: 2, name: 'Adobe CC', amount: 65760, cycle: 'yearly', nextBilling: '2026-03-15', category: '仕事', color: '#0ea5e9', satisfaction: '高', frequency: '毎日', isActive: true },
];

export const CATEGORIES: Category[] = ['エンタメ', '仕事', '健康', '教育', '生活', 'その他'];
export const COLOR_PALETTE = [
    '#64748b', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

export const CATEGORY_COLORS: Record<string, string> = {
    'エンタメ': '#f43f5e', '仕事': '#3b82f6', '健康': '#10b981',
    '教育': '#f59e0b', '生活': '#0ea5e9', 'その他': '#64748b'
};

export const SATISFACTION_LEVELS: Satisfaction[] = ['高', '中', '低'];
export const SATISFACTION_COLORS: Record<Satisfaction, string> = { '高': '#10b981', '中': '#f59e0b', '低': '#ef4444' };

export const FREQUENCY_LEVELS: Frequency[] = ['毎日', '週1', '月1', 'ほぼ未使用'];

