import { useMemo, useState } from 'react';
import { LayoutGrid, ListChecks, TrendingDown, ChevronRight } from 'lucide-react';
import { SATISFACTION_LEVELS, FREQUENCY_LEVELS, CATEGORY_COLORS } from '../../lib/constants';
import { useTranslation } from '../../hooks/useTranslation';
import { getCancelScore, getCancelRecommendation, getYearlyAmount, getMonthlyAmount, getSavingsPotential, isSubscription } from '../../lib/utils';
import { Subscription, Language, Satisfaction, Frequency } from '../../types';

interface MatrixViewProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    lang: Language;
}

export const MatrixView = ({ subscriptions, onEdit, lang }: MatrixViewProps) => {
    const { t, getDisplayLabel } = useTranslation(lang);
    const [view, setView] = useState<'matrix' | 'list'>('matrix');

    // Only true subscriptions take part in review (fixed costs are mandatory)
    const reviewSubs = useMemo(
        () => subscriptions.filter(s => s.isActive && isSubscription(s)),
        [subscriptions]
    );

    const savings = useMemo(() => getSavingsPotential(subscriptions), [subscriptions]);

    const matrixData = useMemo(() => {
        const matrix: Record<string, Record<string, Subscription[]>> = {};
        SATISFACTION_LEVELS.forEach(sat => {
            matrix[sat] = {};
            FREQUENCY_LEVELS.forEach(freq => {
                matrix[sat][freq] = reviewSubs.filter(sub => sub.satisfaction === sat && sub.frequency === freq);
            });
        });
        return matrix;
    }, [reviewSubs]);

    // Review list: candidates (score >= 3) sorted by yearly cost, highest first
    const reviewList = useMemo(
        () => reviewSubs
            .map(sub => ({ sub, score: getCancelScore(sub) }))
            .filter(x => x.score >= 3)
            .sort((a, b) => getYearlyAmount(b.sub) - getYearlyAmount(a.sub)),
        [reviewSubs]
    );

    const getMatrixCellColor = (sat: Satisfaction, freq: Frequency) => {
        const score = SATISFACTION_LEVELS.indexOf(sat) + FREQUENCY_LEVELS.indexOf(freq);
        if (score >= 4) return 'bg-rose-50 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800';
        if (score >= 3) return 'bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800';
        if (score >= 2) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800';
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800';
    };

    return (
        <div className="space-y-4">
            {/* === Savings Potential Card + Gauge === */}
            <div className="bg-skin-card rounded-2xl p-5 border border-skin-border shadow-skin">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-skin-subtext flex items-center gap-1.5 uppercase tracking-wider">
                            <TrendingDown size={14} className="text-rose-500" /> {t('savings.potentialTitle')}
                        </h3>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-bold text-rose-500">{t('currency')}{savings.yearlySavings.toLocaleString()}</span>
                            <span className="text-xs font-bold text-skin-subtext">{t('savings.perYear')}</span>
                        </div>
                        <p className="text-[11px] text-skin-subtext mt-1 leading-relaxed">{t('savings.potentialDesc')}</p>
                    </div>
                    <span className="text-xs font-bold bg-skin-base px-2 py-1 rounded-full text-skin-subtext whitespace-nowrap">
                        {t('savings.candidates')} {savings.candidates.length}
                    </span>
                </div>

                {/* Gauge: share of total spending */}
                <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-bold text-skin-subtext mb-1">
                        <span>{t('savings.share')}</span>
                        <span>{savings.share.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-skin-base rounded-full h-2.5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-rose-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, savings.share)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* === View Toggle === */}
            <div className="flex bg-skin-base p-1 rounded-xl border border-skin-border">
                <button
                    onClick={() => setView('matrix')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${view === 'matrix' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                >
                    <LayoutGrid size={14} /> {t('review.matrix')}
                </button>
                <button
                    onClick={() => setView('list')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${view === 'list' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                >
                    <ListChecks size={14} /> {t('review.list')}
                </button>
            </div>

            {view === 'matrix' ? (
                /* === Matrix Grid === */
                <div className="bg-skin-card rounded-2xl p-3 border border-skin-border shadow-skin flex flex-col md:h-auto md:min-h-[600px]">
                    <p className="text-[10px] md:text-xs text-skin-subtext mb-2 text-center whitespace-pre-line">{t('matrix.description')}</p>

                    <div className="grid grid-cols-[auto_1fr] gap-1">
                        <div className="w-[30px]"></div>
                        <div className="grid grid-cols-4 gap-1 text-center">
                            {FREQUENCY_LEVELS.map(f => (
                                <div key={f} className="text-[10px] md:text-sm font-bold text-skin-text bg-skin-base rounded p-1 flex items-center justify-center leading-tight">
                                    {getDisplayLabel(f).replace('ほぼ未使用', '稀に')}
                                </div>
                            ))}
                        </div>

                        <div className="contents">
                            {SATISFACTION_LEVELS.map(sat => (
                                <div className="contents" key={sat}>
                                    <div className="bg-skin-base rounded text-[10px] md:text-sm font-bold text-skin-text flex items-center justify-center writing-vertical-jr h-24 md:h-32">
                                        {getDisplayLabel(sat)}
                                    </div>
                                    <div className="grid grid-cols-4 gap-1 h-24 md:h-32">
                                        {FREQUENCY_LEVELS.map(freq => {
                                            const subs = matrixData[sat][freq];
                                            const cellColor = getMatrixCellColor(sat, freq);
                                            return (
                                                <div key={freq} className={`rounded border-2 align-top ${cellColor} border-opacity-50 relative flex flex-col p-0.5 md:p-1 overflow-hidden`}>
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* === Review List === */
                <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-skin">
                    <p className="text-[10px] md:text-xs text-skin-subtext mb-3 text-center">{t('review.listDesc')}</p>
                    {reviewList.length === 0 ? (
                        <p className="text-center text-sm font-bold text-skin-subtext py-8">{t('savings.none')}</p>
                    ) : (
                        <div className="space-y-2">
                            {reviewList.map(({ sub, score }) => {
                                const rec = getCancelRecommendation(score, lang);
                                const color = CATEGORY_COLORS[sub.category] || '#94a3b8';
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => onEdit(sub)}
                                        className="w-full flex items-center gap-3 bg-skin-base rounded-xl p-3 border border-skin-border hover:border-skin-subtext/40 transition-all text-left"
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm truncate">{sub.name}</span>
                                                {rec && <span className={`px-1.5 py-0.5 rounded text-[9px] border shrink-0 ${rec.color}`}>{rec.label}</span>}
                                            </div>
                                            <span className="text-[11px] text-skin-subtext">{getDisplayLabel(sub.satisfaction)} · {getDisplayLabel(sub.frequency)}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold">{t('currency')}{getYearlyAmount(sub).toLocaleString()}<span className="text-[10px] text-skin-subtext font-normal">{t('savings.perYear')}</span></p>
                                            <p className="text-[10px] text-skin-subtext">{t('currency')}{getMonthlyAmount(sub).toLocaleString()}/{lang === 'ja' ? '月' : 'mo'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-skin-subtext shrink-0" />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
