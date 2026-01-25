import { useState, useMemo } from 'react';
import { Pause, Play, Trash2, Edit2, ChevronUp, ChevronDown, Tag, Smile, Clock, Meh, Frown } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TRANSLATIONS, CATEGORIES, CATEGORY_COLORS, SATISFACTION_LEVELS, SATISFACTION_COLORS, FREQUENCY_LEVELS } from '../../lib/constants';
import { FREQ_COLORS } from '../../lib/theme';
import { getDaysUntilBilling, getCancelScore, getCancelRecommendation, getUrgencyColor, getMonthlyAmount } from '../../lib/utils';
import { Subscription, Language } from '../../types';

interface SubscriptionListProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
    lang: Language;
}

type ChartType = 'category' | 'satisfaction' | 'frequency';

export const SubscriptionList = ({ subscriptions, onEdit, onDelete, onToggleStatus, lang }: SubscriptionListProps) => {
    const t = (path: string) => path.split('.').reduce((obj: any, key) => obj && obj[key], TRANSLATIONS[lang]) || path;
    const getDisplayLabel = (key: string) => (TRANSLATIONS[lang].dataMap as any)[key] || key;

    const [sortKey, setSortKey] = useState('date');
    const [showPaused, setShowPaused] = useState(false);
    const [displayCycle, setDisplayCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [chartType, setChartType] = useState<ChartType>('category');

    const activeSubs = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);
    const pausedSubs = useMemo(() => subscriptions.filter(s => !s.isActive), [subscriptions]);

    const totalMonthly = useMemo(() => activeSubs.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0), [activeSubs]);
    const totalYearly = useMemo(() => activeSubs.reduce((sum, sub) => sum + (sub.cycle === 'yearly' ? sub.amount : sub.amount * 12), 0), [activeSubs]);

    // Chart Logic
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
        } else if (chartType === 'frequency') {
            rawData = FREQUENCY_LEVELS.map((freq) => {
                const total = activeSubs.filter(s => s.frequency === freq).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: getDisplayLabel(freq), value: total, color: FREQ_COLORS[freq] };
            });
        }

        const filtered = rawData.filter(d => d.value > 0);
        return filtered.length > 0 ? filtered : [{ name: 'None', value: 1, color: '#f1f5f9' }];
    }, [activeSubs, chartType, lang]);

    const toggleChartType = () => {
        if (chartType === 'category') setChartType('satisfaction');
        else if (chartType === 'satisfaction') setChartType('frequency');
        else setChartType('category');
    };

    const sortedSubs = useMemo(() => {
        const list = [...activeSubs];
        if (sortKey === 'price_desc') return list.sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a));
        if (sortKey === 'satisfaction') {
            const score: Record<string, number> = { '低': 2, '中': 1, '高': 0 };
            return list.sort((a, b) => score[b.satisfaction] - score[a.satisfaction]);
        }
        return list.sort((a, b) => getDaysUntilBilling(a.nextBilling) - getDaysUntilBilling(b.nextBilling));
    }, [activeSubs, sortKey]);

    return (
        <div className="space-y-4">
            {/* Top Stats Dashboard */}
            <div className="bg-skin-card rounded-skin shadow-skin p-6 mb-6 border border-skin-border relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-skin-subtext text-xs font-bold uppercase tracking-wider">{t('stats.total')}</span>
                            <button
                                onClick={() => setDisplayCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                                className="text-[10px] bg-skin-base px-2 py-0.5 rounded text-skin-subtext font-bold hover:text-skin-text transition-colors"
                                style={{ border: '1px solid var(--color-border)' }}
                            >
                                {displayCycle === 'monthly' ? t('cycle.monthly') : t('cycle.yearly')}
                            </button>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <motion.span
                                key={displayCycle}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold font-skin"
                            >
                                {t('currency')}{displayCycle === 'monthly' ? totalMonthly.toLocaleString() : totalYearly.toLocaleString()}
                            </motion.span>
                        </div>
                        <p className="text-xs text-skin-subtext mt-2">{t('stats.active')}: {activeSubs.length}{t('stats.items')}</p>
                    </div>

                    {/* Switchable Pie Chart */}
                    <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={toggleChartType}>
                        <div className="w-20 h-20 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={25}
                                        outerRadius={35}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        isAnimationActive={true}
                                    >
                                        {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-skin-subtext pointer-events-none">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={chartType}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {chartType === 'category' && <Tag size={18} />}
                                        {chartType === 'satisfaction' && <Smile size={18} />}
                                        {chartType === 'frequency' && <Clock size={18} />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Chart Type Indicator */}
                        <div className="flex gap-1 mt-1">
                            {['category', 'satisfaction', 'frequency'].map(type => (
                                <div
                                    key={type}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${chartType === type ? 'bg-skin-text' : 'bg-skin-border'}`}
                                />
                            ))}
                        </div>
                        {/* Satisfaction Legend Removed to avoid confusion */}
                    </div>
                </div>
            </div>

            {/* Sorting */}
            <div className="flex justify-end items-center px-1">
                <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="text-xs bg-transparent border-none text-skin-subtext font-medium focus:ring-0 cursor-pointer outline-none"
                >
                    <option value="date">{t('sort.date')}</option>
                    <option value="price_desc">{t('sort.price')}</option>
                    <option value="satisfaction">{t('sort.satisfaction')}</option>
                </select>
            </div>

            <LayoutGroup>
                <motion.div layout className="space-y-4">
                    <AnimatePresence initial={false}>
                        {sortedSubs.map(sub => {
                            const days = getDaysUntilBilling(sub.nextBilling);
                            const rec = getCancelRecommendation(getCancelScore(sub), lang);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={sub.id}
                                    className="bg-skin-card rounded-2xl p-4 shadow-sm border border-skin-border hover:border-skin-subtext/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: sub.color }}></div>

                                    <div className="pl-3 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-base mb-0.5">{sub.name}</h3>
                                            <p className="text-xs text-skin-subtext font-medium flex items-center gap-2">
                                                {t('currency')}{sub.amount.toLocaleString()} <span className="opacity-60">/ {sub.cycle === 'monthly' ? t('cycle.mo') : t('cycle.yr')}</span>
                                                {rec && <span className={`px-1.5 py-0.5 rounded text-[9px] border ${rec.color.replace('bg-', 'border-').replace('text-', 'text-')} bg-transparent`}>{rec.label}</span>}
                                            </p>
                                        </div>
                                        <div className={`text-xs font-bold text-right ${getUrgencyColor(days)}`}>
                                            {days < 0 ? t('card.expired') : days === 0 ? t('card.today') : t('card.daysLeft').replace('{days}', days.toString())}
                                        </div>
                                    </div>

                                    <div className="pl-3 mt-4 flex justify-between items-center border-t border-skin-border pt-3">
                                        <div className="flex gap-3 text-xs text-skin-subtext">
                                            <span>{getDisplayLabel(sub.category)}</span>
                                            <span>・</span>
                                            <span className="flex items-center gap-1">
                                                {sub.satisfaction === '高' && <Smile size={14} className="text-emerald-500" />}
                                                {sub.satisfaction === '中' && <Meh size={14} className="text-amber-500" />}
                                                {sub.satisfaction === '低' && <Frown size={14} className="text-rose-500" />}
                                                {getDisplayLabel(sub.satisfaction)}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => onToggleStatus(sub.id)} className="p-1.5 text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-full transition-colors"><Pause size={18} /></button>
                                            <button onClick={() => onEdit(sub)} className="p-1.5 text-skin-subtext hover:bg-skin-base rounded-full transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => onDelete(sub.id)} className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </LayoutGroup>

            {/* Paused Items */}
            {pausedSubs.length > 0 && (
                <div className="mt-8 pt-4 border-t border-dashed border-skin-border">
                    <button onClick={() => setShowPaused(!showPaused)} className="flex items-center gap-2 text-xs font-bold text-skin-subtext mb-4 w-full">
                        {showPaused ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {t('status.paused')} ({pausedSubs.length})
                    </button>
                    <AnimatePresence>
                        {showPaused && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 opacity-60 overflow-hidden"
                            >
                                {pausedSubs.map(sub => (
                                    <div key={sub.id} className="bg-skin-base rounded-xl p-3 flex justify-between items-center border border-skin-border">
                                        <span className="text-sm font-bold text-skin-subtext">{sub.name}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => onToggleStatus(sub.id)} className="text-emerald-500"><Play size={18} /></button>
                                            <button onClick={() => onDelete(sub.id)} className="text-rose-400"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
