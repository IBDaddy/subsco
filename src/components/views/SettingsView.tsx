import { Globe, Download, Upload, Trash2, ExternalLink, Sun, Moon, Monitor, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { validateImportData } from '../../lib/utils';
import { getNotificationPermission, requestNotificationPermission, isNotificationSupported } from '../../lib/notifications';
import { Subscription, HistoryItem, BackupData, Language, Theme, NotifyLeadDays, NotifyFilter } from '../../types';

interface SettingsViewProps {
    lang: Language;
    onLangChange: (lang: Language) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    notifyLeadDays: NotifyLeadDays;
    onNotifyLeadDaysChange: (days: NotifyLeadDays) => void;
    notifyFilter: NotifyFilter;
    onNotifyFilterChange: (filter: NotifyFilter) => void;
    onReset: () => void;
    onImport: (data: BackupData) => void;
    subscriptions: Subscription[];
    history: HistoryItem[];
}

export const SettingsView = ({
    lang, onLangChange, theme, onThemeChange,
    notifyLeadDays, onNotifyLeadDaysChange, notifyFilter, onNotifyFilterChange,
    onReset, onImport, subscriptions, history
}: SettingsViewProps) => {
    const { t } = useTranslation(lang);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>(getNotificationPermission());
    const [notifyExpanded, setNotifyExpanded] = useState(false);

    const handleEnableNotifications = async () => {
        const result = await requestNotificationPermission();
        setNotifyPermission(result);
        if (result === 'granted') setNotifyExpanded(true);
    };

    const THEME_OPTIONS: { value: Theme; icon: typeof Sun }[] = [
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
        { value: 'system', icon: Monitor },
    ];

    const LEAD_OPTIONS: { value: NotifyLeadDays; label: string }[] = [
        { value: 3, label: t('notify.lead3') },
        { value: 7, label: t('notify.lead7') },
        { value: 14, label: t('notify.lead14') },
    ];

    const FILTER_OPTIONS: { value: NotifyFilter; label: string }[] = [
        { value: 'all', label: t('notify.filterAll') },
        { value: 'yearly', label: t('notify.filterYearly') },
        { value: 'large', label: t('notify.filterLarge') },
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

            {/* Notification Settings */}
            {isNotificationSupported() && (
                <div className="bg-skin-card rounded-2xl border border-skin-border shadow-sm overflow-hidden">
                    {/* Header row */}
                    <div className="p-4 flex items-center justify-between">
                        <h3 className="font-bold text-skin-text text-sm flex items-center gap-3"><Bell size={18} /> {t('notify.settingLabel')}</h3>
                        {notifyPermission === 'granted' ? (
                            <button
                                onClick={() => setNotifyExpanded(v => !v)}
                                className="flex items-center gap-1 text-xs font-bold text-emerald-500"
                            >
                                {t('notify.enabled')}
                                {notifyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                        ) : notifyPermission === 'denied' ? (
                            <span className="text-[10px] text-skin-subtext text-right max-w-[50%]">{t('notify.blocked')}</span>
                        ) : (
                            <button onClick={handleEnableNotifications} className="px-3 py-1 text-xs rounded-full border bg-skin-primary text-skin-primary-fg border-skin-primary font-bold">
                                {t('notify.enable')}
                            </button>
                        )}
                    </div>

                    {/* Detail settings (expand when granted) */}
                    {notifyPermission === 'granted' && notifyExpanded && (
                        <div className="px-4 pb-4 space-y-4 border-t border-skin-border pt-4">
                            {/* Lead days */}
                            <div>
                                <p className="text-[11px] font-bold text-skin-subtext mb-2">{t('notify.leadDaysLabel')}</p>
                                <div className="flex gap-2">
                                    {LEAD_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => onNotifyLeadDaysChange(value)}
                                            className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${notifyLeadDays === value ? 'bg-skin-primary text-skin-primary-fg border-skin-primary' : 'bg-skin-base border-skin-border text-skin-subtext'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter */}
                            <div>
                                <p className="text-[11px] font-bold text-skin-subtext mb-2">{t('notify.filterLabel')}</p>
                                <div className="flex flex-col gap-1.5">
                                    {FILTER_OPTIONS.map(({ value, label }) => (
                                        <button
                                            key={value}
                                            onClick={() => onNotifyFilterChange(value)}
                                            className={`w-full py-2 px-3 text-xs font-bold rounded-xl border text-left transition-all flex items-center gap-2 ${notifyFilter === value ? 'bg-skin-primary text-skin-primary-fg border-skin-primary' : 'bg-skin-base border-skin-border text-skin-subtext'}`}
                                        >
                                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${notifyFilter === value ? 'border-white' : 'border-skin-border'}`}>
                                                {notifyFilter === value && <span className="w-2 h-2 rounded-full bg-white" />}
                                            </span>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
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

            <p className="text-center text-[10px] text-skin-subtext mt-6">v13.0.0 Education Analysis & Notify Settings</p>
        </div>
    );
};
