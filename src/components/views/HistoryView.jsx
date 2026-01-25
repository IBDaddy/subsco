import { History } from 'lucide-react';
import { TRANSLATIONS } from '../../lib/constants';

export const HistoryView = ({ history, lang }) => {
    const t = (path) => path.split('.').reduce((obj, key) => obj && obj[key], TRANSLATIONS[lang]) || path;

    return (
        <div className="bg-skin-card rounded-2xl p-6 border border-skin-border shadow-skin">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><History size={18} /> {t('history.title')}</h3>
            <div className="space-y-0">
                {history.length > 0 ? history.map((h) => (
                    <div key={h.id} className="timeline-line relative pl-6 pb-6 last:pb-0">
                        <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-skin-card ${h.action === '解約' ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                        <p className="text-[10px] text-skin-subtext font-bold mb-0.5">{h.date}</p>
                        <p className="text-sm font-bold">{h.subName} <span className="text-xs font-normal text-skin-subtext">- {t(`history.labels.${h.action === '解約' ? 'cancel' : h.action === '再契約' ? 'resume' : 'new'}`) || h.action}</span></p>
                    </div>
                )) : <p className="text-center text-xs text-skin-subtext py-4">{t('history.noHistory')}</p>}
            </div>
        </div>
    );
};
