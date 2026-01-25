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
        <div className="bg-skin-card rounded-2xl p-6 border border-skin-border shadow-skin">
            <p className="text-xs text-skin-subtext mb-4 whitespace-pre-wrap">{t('matrix.description')}</p>
            <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full min-w-[400px] text-xs">
                    <thead>
                        <tr>
                            <th className="p-2 text-left w-14 text-skin-subtext font-normal">{t('matrix.axisX')}</th>
                            {FREQUENCY_LEVELS.map(f => <th key={f} className="p-2 text-center font-bold text-skin-text bg-skin-base rounded-t-lg mx-1">{getDisplayLabel(f)}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {SATISFACTION_LEVELS.map(sat => (
                            <tr key={sat}>
                                <td className="p-2 font-bold text-skin-text bg-skin-base rounded-l-lg">{getDisplayLabel(sat)}</td>
                                {FREQUENCY_LEVELS.map(freq => {
                                    const subs = matrixData[sat][freq];
                                    const cellColor = getMatrixCellColor(sat, freq);
                                    return (
                                        <td key={freq} className={`p-1 border-2 border-skin-bg align-top ${cellColor} rounded-lg h-24 w-24 relative`}>
                                            <div className="absolute inset-0 p-1 overflow-y-auto">
                                                {subs.map(sub => (
                                                    <div key={sub.id} onClick={() => onEdit(sub)} className="bg-skin-card/90 backdrop-blur-sm rounded p-1.5 mb-1 shadow-sm border border-skin-border cursor-pointer">
                                                        <p className="font-bold truncate text-[10px] text-skin-text">{sub.name}</p>
                                                        <p className="text-[9px] text-skin-subtext">{t('currency')}{getMonthlyAmount(sub).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
