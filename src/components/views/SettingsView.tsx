import { Globe, Download, Upload, Trash2, Coffee, ExternalLink, Wallet } from 'lucide-react';
import { useRef } from 'react';
import { TRANSLATIONS } from '../../lib/constants';
import { Subscription, HistoryItem, Language } from '../../types';

interface SettingsViewProps {
    lang: Language;
    onLangChange: (lang: Language) => void;
    onReset: () => void;
    onImport: (data: any) => void;
    subscriptions: Subscription[];
    history: HistoryItem[];
}

export const SettingsView = ({ lang, onLangChange, onReset, onImport, subscriptions, history }: SettingsViewProps) => {
    const t = (path: string) => path.split('.').reduce((obj: any, key) => obj && obj[key], TRANSLATIONS[lang]) || path;
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                const data = JSON.parse(result);
                if (Array.isArray(data.subscriptions)) {
                    onImport(data);
                } else {
                    alert('Error: Invalid file');
                }
            } catch (err) {
                alert('Error: Read failed');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="space-y-3">
            {/* Donation (Top Priority) */}
            <a href="https://buy.stripe.com/test_9B6eVf984fJ8gHRg950x200" target="_blank" rel="noopener noreferrer" className="w-full bg-[#635BFF] text-white p-4 rounded-2xl border border-[#635BFF] shadow-sm flex items-center justify-between text-sm font-bold hover:brightness-110 transition-all mb-4">
                <span className="flex items-center gap-3"><Wallet size={20} className="text-white" /> {t('settings.btnDonation')}</span>
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

            <p className="text-center text-[10px] text-skin-subtext mt-6">v11.0.0 Dashboard & Donations</p>
        </div>
    );
};
