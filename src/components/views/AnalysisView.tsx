import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Wallet, CreditCard } from 'lucide-react';
import { CATEGORIES, CATEGORY_COLORS, SATISFACTION_LEVELS, SATISFACTION_COLORS, PAYMENT_METHODS, PAYMENT_METHOD_COLORS } from '../../lib/constants';
import { getMonthlyAmount } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { Subscription, HistoryItem, Language, PaymentMethod } from '../../types';

interface AnalysisViewProps {
    subscriptions: Subscription[];
    history: HistoryItem[];
    monthlyIncome: number | string;
    onIncomeChange: (amount: number) => void;
    lang: Language;
}

type ChartType = 'category' | 'satisfaction' | 'payment';

export const AnalysisView = ({ subscriptions, history, monthlyIncome, onIncomeChange, lang }: AnalysisViewProps) => {
    const { t, getDisplayLabel } = useTranslation(lang);

    const activeSubs = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);
    const totalMonthly = useMemo(() => activeSubs.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0), [activeSubs]);

    // State for Chart Type
    const [chartType, setChartType] = useState<ChartType>('satisfaction');

    // DYNAMIC CHART DATA
    const chartData = useMemo(() => {
        let rawData: { name: string; value: number; color: string }[] = [];
        if (chartType === 'category') {
            rawData = CATEGORIES.map((cat) => {
                const total = activeSubs.filter(s => s.category === cat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: getDisplayLabel(cat), value: total, color: CATEGORY_COLORS[cat] || '#cbd5e1' };
            });
        } else if (chartType === 'satisfaction') {
            rawData = SATISFACTION_LEVELS.map((sat) => {
                const total = activeSubs.filter(s => s.satisfaction === sat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: getDisplayLabel(sat), value: total, color: SATISFACTION_COLORS[sat] };
            });
        } else if (chartType === 'payment') {
            rawData = PAYMENT_METHODS.map((pm) => {
                const total = activeSubs.filter(s => (s.paymentMethod || 'other') === pm).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: t(`paymentLabels.${pm}`), value: total, color: PAYMENT_METHOD_COLORS[pm] };
            });
        }
        return rawData.filter(d => d.value > 0).length > 0 ? rawData.filter(d => d.value > 0) : [{ name: 'None', value: 1, color: '#f1f5f9' }];
    }, [activeSubs, chartType, lang]);

    // DYNAMIC RANKING
    const rankingData = useMemo(() => {
        if (chartType === 'category') {
            return CATEGORIES.map((cat) => ({
                name: getDisplayLabel(cat),
                value: activeSubs.filter(s => s.category === cat).reduce((sum, s) => sum + getMonthlyAmount(s), 0),
                color: CATEGORY_COLORS[cat]
            })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
        }
        if (chartType === 'satisfaction') {
            return SATISFACTION_LEVELS.map((sat) => ({
                name: getDisplayLabel(sat),
                value: activeSubs.filter(s => s.satisfaction === sat).reduce((sum, s) => sum + getMonthlyAmount(s), 0),
                color: SATISFACTION_COLORS[sat]
            })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
        }
        if (chartType === 'payment') {
            return PAYMENT_METHODS.map((pm) => ({
                name: t(`paymentLabels.${pm}`),
                value: activeSubs.filter(s => (s.paymentMethod || 'other') === pm).reduce((sum, s) => sum + getMonthlyAmount(s), 0),
                yearly: activeSubs.filter(s => (s.paymentMethod || 'other') === pm).reduce((sum, s) => sum + (s.cycle === 'yearly' ? s.amount : s.amount * 12), 0),
                color: PAYMENT_METHOD_COLORS[pm]
            })).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
        }
        return [];
    }, [activeSubs, chartType, lang]);

    // Monthly spending trend from history
    const trendData = useMemo(() => {
        // Build a map of month -> total monthly spending at that point
        // Use subscription data + history to estimate monthly costs per month
        const now = new Date();
        const months: { month: string; amount: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = `${d.getMonth() + 1}${lang === 'ja' ? '月' : '/' + String(d.getFullYear()).slice(2)}`;

            // For current month, use actual total
            if (i === 0) {
                months.push({ month: label, amount: totalMonthly });
                continue;
            }

            // Estimate past months by checking which subs existed (using history)
            // Simple approach: current total minus subs added after that month + subs canceled before
            let estimated = totalMonthly;
            history.forEach(h => {
                const hDate = h.date.slice(0, 7); // YYYY-MM
                if (hDate > monthStr) {
                    // This event happened after the target month
                    if (h.action === '新規契約' || h.action === 'New') {
                        // This sub didn't exist yet, subtract it
                        const sub = subscriptions.find(s => s.id === h.subId);
                        if (sub) estimated -= getMonthlyAmount(sub);
                    } else if (h.action === '解約' || h.action === 'Canceled') {
                        // This sub was still active, add it back
                        estimated += h.cycle === 'yearly' ? Math.round(h.amount / 12) : h.amount;
                    }
                }
            });

            months.push({ month: label, amount: Math.max(0, estimated) });
        }

        return months;
    }, [totalMonthly, history, subscriptions, lang]);

    // BUDGET
    const budgetStatus = useMemo(() => {
        if (!monthlyIncome || Number(monthlyIncome) <= 0) return null;
        const incomeNum = Number(monthlyIncome);
        const ratio = (totalMonthly / incomeNum) * 100;
        if (ratio < 5) return { status: 'Great!', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50', bar: 'bg-emerald-500', message: t('budget.great') };
        if (ratio < 10) return { status: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50', bar: 'bg-blue-500', message: t('budget.good') };
        if (ratio < 15) return { status: 'Warning', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50', bar: 'bg-amber-500', message: t('budget.warning') };
        return { status: 'Danger', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/50', bar: 'bg-rose-500', message: t('budget.danger') };
    }, [monthlyIncome, totalMonthly, t]);

    return (
        <div className="space-y-6">
            {/* Budget Check */}
            <div className="bg-skin-card rounded-2xl p-5 border border-skin-border shadow-skin">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Wallet size={18} className="text-emerald-500" /> {t('analysis.budgetCheck')}
                </h3>
                <div className="mb-4">
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder={t('analysis.incomeLabel')}
                        value={monthlyIncome}
                        onChange={(e) => onIncomeChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-skin-primary"
                    />
                </div>
                {monthlyIncome !== '' && Number(monthlyIncome) > 0 && (
                    <div className="bg-skin-base rounded-xl p-3">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>{t('analysis.ratio')}</span>
                            <span>{((totalMonthly / Number(monthlyIncome)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-skin-border h-2 rounded-full overflow-hidden">
                            <div className="bg-skin-primary h-full rounded-full" style={{ width: `${Math.min(100, (totalMonthly / Number(monthlyIncome)) * 100)}%` }}></div>
                        </div>
                        {budgetStatus && (
                            <p className="text-xs text-skin-subtext mt-2 leading-relaxed">
                                {budgetStatus.message}<br />
                                <span className="opacity-70">{t('budget.hint')} {t('currency')}{(Number(monthlyIncome) * 0.05).toLocaleString()}</span>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Method Summary Card */}
            <div className="bg-skin-card rounded-2xl p-5 border border-skin-border shadow-skin">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-indigo-500" /> {t('analysis.payment')}
                </h3>
                <div className="space-y-3">
                    {PAYMENT_METHODS.map(pm => {
                        const monthlyTotal = activeSubs
                            .filter(s => (s.paymentMethod || 'other') === pm)
                            .reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                        const yearlyTotal = activeSubs
                            .filter(s => (s.paymentMethod || 'other') === pm)
                            .reduce((sum, s) => sum + (s.cycle === 'yearly' ? s.amount : s.amount * 12), 0);
                        if (monthlyTotal === 0) return null;
                        return (
                            <div key={pm} className="flex items-center justify-between bg-skin-base rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PAYMENT_METHOD_COLORS[pm] }}></div>
                                    <span className="text-xs font-bold">{t(`paymentLabels.${pm}`)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold">{t('currency')}{monthlyTotal.toLocaleString()}<span className="text-skin-subtext font-normal">/{lang === 'ja' ? '月' : 'mo'}</span></p>
                                    <p className="text-[10px] text-skin-subtext">{t('analysis.yearlyTotal')}: {t('currency')}{yearlyTotal.toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Monthly Trend */}
            {trendData.length > 0 && (
                <div className="bg-skin-card rounded-2xl p-5 border border-skin-border shadow-skin">
                    <h3 className="text-sm font-bold mb-4">{t('analysis.trend')}</h3>
                    <div className="w-full h-40">
                        <ResponsiveContainer>
                            <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e2e8f0)" />
                                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--color-subtext, #94a3b8)" />
                                <YAxis tick={{ fontSize: 10 }} stroke="var(--color-subtext, #94a3b8)" />
                                <Tooltip
                                    formatter={(value: number) => [`${t('currency')}${value.toLocaleString()}`, '']}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--color-border, #e2e8f0)' }}
                                />
                                <Bar dataKey="amount" fill="var(--color-primary, #6366f1)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Combined Chart & Toggle */}
            <div className="bg-skin-card rounded-2xl p-6 border border-skin-border shadow-skin flex flex-col items-center relative">
                <div className="flex bg-skin-base rounded-lg p-1 mb-4 absolute top-4 right-4 z-10">
                    <button
                        onClick={() => setChartType('satisfaction')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${chartType === 'satisfaction' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                    >
                        {t('analysis.satisfaction')}
                    </button>
                    <button
                        onClick={() => setChartType('category')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${chartType === 'category' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                    >
                        {t('analysis.category')}
                    </button>
                    <button
                        onClick={() => setChartType('payment')}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${chartType === 'payment' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                    >
                        {t('analysis.payment')}
                    </button>
                </div>

                <div className="w-full h-48 mt-8">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={4}
                                dataKey="value"
                                stroke="none"
                                isAnimationActive={true}
                            >
                                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Dynamic Ranking */}
            <div className="bg-skin-card rounded-xl p-5 shadow-skin border-skin-border">
                <h3 className="text-sm font-bold text-skin-text mb-4">
                    {chartType === 'category' ? t('analysis.category') : chartType === 'payment' ? t('analysis.payment') : t('analysis.satisfaction')} {t('stats.chart')}
                </h3>
                <div className="space-y-4">
                    {rankingData.map((item, idx) => (
                        <div key={item.name} className="flex items-center gap-3">
                            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-skin-primary text-skin-primary-fg' : 'bg-skin-base text-skin-subtext'}`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-skin-text">{item.name}</span>
                                    <div className="text-right">
                                        <span className="font-bold">{t('currency')}{item.value.toLocaleString()}</span>
                                        {'yearly' in item && (
                                            <span className="text-[10px] text-skin-subtext ml-1">({t('currency')}{(item as { yearly: number }).yearly.toLocaleString()}/{lang === 'ja' ? '年' : 'yr'})</span>
                                        )}
                                    </div>
                                </div>
                                <div className="w-full bg-skin-base rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(item.value / totalMonthly) * 100}%`, backgroundColor: item.color }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
