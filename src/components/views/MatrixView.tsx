import { useMemo } from 'react';
import { TRANSLATIONS, SATISFACTION_LEVELS, FREQUENCY_LEVELS } from '../../lib/constants';
import { getMonthlyAmount } from '../../lib/utils';
import { Subscription, Language, Satisfaction, Frequency } from '../../types';

interface MatrixViewProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    lang: Language;
}

export const MatrixView = ({ subscriptions, onEdit, lang }: MatrixViewProps) => {
    const t = (path: string) => path.split('.').reduce((obj: any, key) => obj && obj[key], TRANSLATIONS[lang]) || path;
    const getDisplayLabel = (key: string) => (TRANSLATIONS[lang].dataMap as any)[key] || key;

    const activeSubs = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);

    const matrixData = useMemo(() => {
        const matrix: Record<string, Record<string, Subscription[]>> = {};
        SATISFACTION_LEVELS.forEach(sat => {
            matrix[sat] = {};
            FREQUENCY_LEVELS.forEach(freq => {
                matrix[sat][freq] = activeSubs.filter(sub => sub.satisfaction === sat && sub.frequency === freq);
            });
        });
        return matrix;
    }, [activeSubs]);

    const getMatrixCellColor = (sat: Satisfaction, freq: Frequency) => {
        const score = SATISFACTION_LEVELS.indexOf(sat) + FREQUENCY_LEVELS.indexOf(freq);
        if (score >= 4) return 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800';
        if (score >= 3) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
        if (score >= 2) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800';
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800';
    };

    return (
        <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-skin flex flex-col h-[calc(100vh-140px)] md:h-auto md:min-h-[600px]">
            <p className="text-[10px] md:text-xs text-skin-subtext mb-2 text-center">{t('matrix.description')}</p>

            <div className="flex-1 grid grid-rows-[auto_1fr] gap-1 min-h-0">
                {/* Header Row */}
                <div className="grid grid-cols-[30px_1fr_1fr_1fr_1fr] gap-1 text-center">
                    <div className="flex items-end justify-center pb-1 text-[10px] md:text-xs text-skin-subtext">{t('matrix.axisX')}</div>
                    {FREQUENCY_LEVELS.map(f => (
                        <div key={f} className="text-[10px] md:text-sm font-bold text-skin-text bg-skin-base rounded p-1 flex items-center justify-center leading-tight">
                            {getDisplayLabel(f).replace('毎日', '毎日').replace('週1', '週1').replace('月1', '月1').replace('ほぼ未使用', '稀に')}
                        </div>
                    ))}
                </div>

                {/* Matrix Content */}
                <div className="grid grid-rows-3 gap-1 min-h-0">
                    {SATISFACTION_LEVELS.map(sat => (
                        <div key={sat} className="grid grid-cols-[30px_1fr_1fr_1fr_1fr] gap-1 min-h-0">
                            {/* Y-Axis Label */}
                            <div className="bg-skin-base rounded text-[10px] md:text-sm font-bold text-skin-text flex items-center justify-center writing-vertical-jr">
                                {getDisplayLabel(sat)}
                            </div>

                            {/* Cells */}
                            {FREQUENCY_LEVELS.map(freq => {
                                const subs = matrixData[sat][freq];
                                const cellColor = getMatrixCellColor(sat, freq);
                                return (
                                    <div key={freq} className={`rounded border-2 align-top ${cellColor} border-opacity-50 relative min-h-0 flex flex-col p-0.5 md:p-1`}>
                                        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                                            {subs.map(sub => (
                                                <div key={sub.id} onClick={() => onEdit(sub)} className="bg-white/90 dark:bg-black/40 backdrop-blur-sm rounded p-1 md:p-2 shadow-sm border border-black/5 dark:border-white/10 cursor-pointer hover:scale-[1.02] transition-transform">
                                                    <p className="font-bold truncate text-[9px] md:text-xs text-skin-text leading-tight">{sub.name}</p>
                                                    <p className="text-[8px] md:text-[10px] text-skin-subtext leading-none mt-0.5">{t('currency')}{getMonthlyAmount(sub).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
