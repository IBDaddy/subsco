import { Globe, Download, Upload, Trash2, ExternalLink, Sun, Moon, Monitor, Bell } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { validateImportData } from '../../lib/utils';
import { getNotificationPermission, requestNotificationPermission, isNotificationSupported } from '../../lib/notifications';
import { Subscription, HistoryItem, BackupData, Language, Theme } from '../../types';

interface SettingsViewProps {
    lang: Language;
    onLangChange: (lang: Language) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    onReset: () => void;
    onImport: (data: BackupData) => void;
    subscriptions: Subscription[];
    history: HistoryItem[];
}

export const SettingsView = ({ lang, onLangChange, theme, onThemeChange, onReset, onImport, subscriptions, history }: SettingsViewProps) => {
    const { t } = useTranslation(lang);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>(getNotificationPermission());

    const handleEnableNotifications = async () => {
        const result = await requestNotificationPermission();
        setNotifyPermission(result);
    };

    const THEME_OPTIONS: { value: Theme; icon: typeof Sun }[] = [
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
        { value: 'system', icon: Monitor },
    ];

    const handleExport = () => {
        const data = { subscriptions, history, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subs_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                const parsed = JSON.parse(result);
                const validation = validateImportData(parsed);
                if (validation.valid) {
                    onImport(validation.data);
                } else {
                    alert(`Error: ${validation.error}`);
                }
            } catch {
                alert('Error: Read failed');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-3">
            {/* Donation (Top Priority) */}
            {/* Author Link */}
            <a href="https://note.com/ibdaddy" target="_blank" rel="noopener noreferrer" className="w-full bg-[#2c2c2c] text-white p-4 rounded-2xl border border-[#2c2c2c] shadow-sm flex items-center justify-between text-sm font-bold hover:brightness-110 transition-all mb-4">
                <span className="flex items-center gap-3"><span className="text-xl">📝</span> {t('settings.note')}</span>
                <ExternalLink size={16} className="opacity-80" />
            </a>

            {/* Language Switch */}
            <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-sm flex items-center justify-between">
                <h3 className="font-bold text-skin-text text-sm flex items-center gap-3"><Globe size={18} /> {t('settings.language')}</h3>
                <div className="flex gap-2">
                    <button onClick={() => onLangChange('ja')} className={`px-3 py-1 text-xs rounded-full border transition-all ${lang === 'ja' ? 'bg-skin-primary text-skin-primary-fg border-skin-primary' : 'bg-skin-base border-skin-border text-skin-subtext'}`}>JP</button>
                    <button onClick={() => onLangChange('en')} className={`px-3 py-1 text-xs rounded-full border transition-all ${lang === 'en' ? 'bg-skin-primary text-skin-primary-fg border-skin-primary' : 'bg-skin-base border-skin-border text-skin-subtext'}`}>EN</button>
                </div>
            </div>

            {/* Theme Switch */}
            <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-sm flex items-center justify-between">
                <h3 className="font-bold text-skin-text text-sm flex items-center gap-3"><Sun size={18} /> {t('theme.title')}</h3>
                <div className="flex gap-1 bg-skin-base p-1 rounded-full border border-skin-border">
                    {THEME_OPTIONS.map(({ value, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => onThemeChange(value)}
                            aria-label={t(`theme.${value}`)}
                            aria-pressed={theme === value}
                            className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1 text-xs font-bold ${theme === value ? 'bg-skin-primary text-skin-primary-fg' : 'text-skin-subtext hover:text-skin-text'}`}
                        >
                            <Icon size={14} /> {t(`theme.${value}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification Toggle */}
            {isNotificationSupported() && (
                <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-sm flex items-center justify-between">
                    <h3 className="font-bold text-skin-text text-sm flex items-center gap-3"><Bell size={18} /> {t('notify.settingLabel')}</h3>
                    {notifyPermission === 'granted' ? (
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">{t('notify.enabled')}</span>
                    ) : notifyPermission === 'denied' ? (
                        <span className="text-[10px] text-skin-subtext text-right max-w-[50%]">{t('notify.blocked')}</span>
                    ) : (
                        <button onClick={handleEnableNotifications} className="px-3 py-1 text-xs rounded-full border bg-skin-primary text-skin-primary-fg border-skin-primary font-bold">
                            {t('notify.enable')}
                        </button>
                    )}
                </div>
            )}

            <button onClick={handleExport} className="w-full bg-skin-card p-4 rounded-2xl border border-skin-border shadow-sm flex items-center justify-between text-sm font-bold hover:bg-skin-base transition-colors">
                <span className="flex items-center gap-3"><Download size={18} /> {t('settings.backup')}</span>
            </button>

            <div className="relative w-full">
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={handleImportClick} className="w-full bg-skin-card p-4 rounded-2xl border border-skin-border shadow-sm flex items-center justify-between text-sm font-bold hover:bg-skin-base transition-colors">
                    <span className="flex items-center gap-3"><Upload size={18} /> {t('settings.restore')}</span>
                </button>
            </div>

            <button onClick={onReset} className="w-full bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50 flex items-center justify-between text-sm font-bold text-rose-600 hover:opacity-80 transition-colors mt-8">
                <span className="flex items-center gap-3"><Trash2 size={18} /> {t('settings.reset')}</span>
            </button>

            <p className="text-center text-[10px] text-skin-subtext mt-6">v12.0.0 Dark Mode & Reminders</p>
        </div>
    );
};
