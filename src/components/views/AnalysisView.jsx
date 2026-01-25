import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Wallet } from 'lucide-react';
import { TRANSLATIONS, CATEGORIES, CATEGORY_COLORS, SATISFACTION_LEVELS, SATISFACTION_COLORS } from '../../lib/constants';
import { getMonthlyAmount } from '../../lib/utils';

export const AnalysisView = ({ subscriptions, monthlyIncome, onIncomeChange, lang }) => {
    const t = (path) => path.split('.').reduce((obj, key) => obj && obj[key], TRANSLATIONS[lang]) || path;
    const getDisplayLabel = (key) => TRANSLATIONS[lang].dataMap[key] || key;

    const activeSubs = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);
    const totalMonthly = useMemo(() => activeSubs.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0), [activeSubs]);

    // CATEGORY CHART
    const categoryData = useMemo(() => {
        const data = CATEGORIES.map((cat) => {
            const total = activeSubs.filter(s => s.category === cat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
            return { name: getDisplayLabel(cat), value: total, color: CATEGORY_COLORS[cat] || '#cbd5e1' };
        }).filter(d => d.value > 0);
        return data.length > 0 ? data : [{ name: 'None', value: 1, color: '#f1f5f9' }];
    }, [activeSubs, lang]);

    // SATISFACTION CHART
    const satisfactionData = useMemo(() => {
        const data = SATISFACTION_LEVELS.map(sat => {
            const total = activeSubs.filter(s => s.satisfaction === sat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
            return { name: getDisplayLabel(sat), value: total, color: SATISFACTION_COLORS[sat] };
        }).filter(d => d.value > 0);
        return data.length > 0 ? data : [{ name: 'None', value: 1, color: '#f1f5f9' }];
    }, [activeSubs, lang]);

    // RANKING
    const categoryRanking = useMemo(() => {
        const ranking = CATEGORIES.map((cat) => {
            const total = activeSubs.filter(s => s.category === cat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
            return { name: getDisplayLabel(cat), value: total, color: CATEGORY_COLORS[cat] };
        }).filter(d => d.value > 0);
        return ranking.sort((a, b) => b.value - a.value);
    }, [activeSubs, lang]);

    // BUDGET
    const budgetStatus = useMemo(() => {
        if (!monthlyIncome || monthlyIncome <= 0) return null;
        const ratio = (totalMonthly / monthlyIncome) * 100;
        const msgs = TRANSLATIONS[lang].budget;
        if (ratio < 5) return { status: 'Great!', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/50', bar: 'bg-emerald-500', message: msgs.great };
        if (ratio < 10) return { status: 'Good', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50', bar: 'bg-blue-500', message: msgs.good };
        if (ratio < 15) return { status: 'Warning', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50', bar: 'bg-amber-500', message: msgs.warning };
        return { status: 'Danger', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-900/50', bar: 'bg-rose-500', message: msgs.danger };
    }, [monthlyIncome, totalMonthly, lang]);

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
                        onChange={(e) => onIncomeChange(e.target.value)}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-skin-primary"
                    />
                </div>
                {monthlyIncome > 0 && (
                    <div className="bg-skin-base rounded-xl p-3">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span>{t('analysis.ratio')}</span>
                            <span>{((totalMonthly / parseInt(monthlyIncome)) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-skin-border h-2 rounded-full overflow-hidden">
                            <div className="bg-skin-primary h-full rounded-full" style={{ width: `${Math.min(100, (totalMonthly / parseInt(monthlyIncome)) * 100)}%` }}></div>
                        </div>
                        {budgetStatus && (
                            <p className="text-xs text-skin-subtext mt-2 leading-relaxed">
                                {budgetStatus.message}<br />
                                <span className="opacity-70">{t('budget.hint')} {t('currency')}{(parseInt(monthlyIncome) * 0.05).toLocaleString()}</span>
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-skin flex flex-col items-center">
                    <span className="text-xs font-bold text-skin-subtext mb-2">{t('analysis.category')}</span>
                    <div className="w-full h-24">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={categoryData} innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value" stroke="none">
                                    {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-skin-card rounded-2xl p-4 border border-skin-border shadow-skin flex flex-col items-center">
                    <span className="text-xs font-bold text-skin-subtext mb-2">{t('analysis.satisfaction')}</span>
                    <div className="w-full h-24">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={satisfactionData} innerRadius={20} outerRadius={35} paddingAngle={5} dataKey="value" stroke="none">
                                    {satisfactionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Spending Ranking */}
            <div className="bg-skin-card rounded-xl p-5 shadow-skin border-skin-border">
                <h3 className="text-sm font-bold text-skin-text mb-4">{t('analysis.ranking')}</h3>
                <div className="space-y-4">
                    {categoryRanking.map((cat, idx) => (
                        <div key={cat.name} className="flex items-center gap-3">
                            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${idx < 3 ? 'bg-skin-primary text-skin-primary-fg' : 'bg-skin-base text-skin-subtext'}`}>
                                {idx + 1}
                            </span>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-skin-text">{cat.name}</span>
                                    <span className="font-bold">{t('currency')}{cat.value.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-skin-base rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${(cat.value / totalMonthly) * 100}%`, backgroundColor: cat.color }}
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
