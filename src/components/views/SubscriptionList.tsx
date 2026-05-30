import { useState, useMemo } from 'react';
import { Pause, Play, Trash2, Edit2, ChevronUp, ChevronDown, Tag, Smile, Meh, Frown, Tv, Briefcase, Heart, GraduationCap, Home, MoreHorizontal, Search, AlertTriangle, Shield, Landmark, Wifi } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CATEGORIES, CATEGORY_COLORS, SATISFACTION_LEVELS, SATISFACTION_COLORS, PAYMENT_METHOD_COLORS } from '../../lib/constants';
import { getDaysUntilBilling, getCancelScore, getCancelRecommendation, getUrgencyColor, getMonthlyAmount, getYearlyAmount } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';
import { Subscription, Language, PaymentMethod } from '../../types';

interface SubscriptionListProps {
    subscriptions: Subscription[];
    onEdit: (sub: Subscription) => void;
    onDelete: (id: number) => void;
    onToggleStatus: (id: number) => void;
    lang: Language;
}

type ChartType = 'category' | 'satisfaction';

export const SubscriptionList = ({ subscriptions, onEdit, onDelete, onToggleStatus, lang }: SubscriptionListProps) => {
    const { t, getDisplayLabel } = useTranslation(lang);

    const [sortKey, setSortKey] = useState('date');
    const [filterType, setFilterType] = useState<'all' | 'subscription' | 'fixed'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showPaused, setShowPaused] = useState(false);
    const [displayCycle, setDisplayCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [chartType, setChartType] = useState<ChartType>('category');

    const activeSubs = useMemo(() => subscriptions.filter(s => s.isActive), [subscriptions]);
    const pausedSubs = useMemo(() => subscriptions.filter(s => !s.isActive), [subscriptions]);

    const filteredSubs = useMemo(() => {
        let subs = activeSubs;
        if (filterType !== 'all') subs = subs.filter(s => (s.type || 'subscription') === filterType);
        if (filterCategory !== 'all') subs = subs.filter(s => s.category === filterCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            subs = subs.filter(s => s.name.toLowerCase().includes(q));
        }
        return subs;
    }, [activeSubs, filterType, filterCategory, searchQuery]);

    const totalMonthly = useMemo(() => filteredSubs.reduce((sum, sub) => sum + getMonthlyAmount(sub), 0), [filteredSubs]);
    const totalYearly = useMemo(() => filteredSubs.reduce((sum, sub) => sum + (sub.cycle === 'yearly' ? sub.amount : sub.amount * 12), 0), [filteredSubs]);

    // Billing reminder: subscriptions due within 7 days
    const upcomingSubs = useMemo(() => {
        return activeSubs
            .map(sub => ({ sub, days: getDaysUntilBilling(sub.nextBilling) }))
            .filter(({ days }) => days >= 0 && days <= 7)
            .sort((a, b) => a.days - b.days);
    }, [activeSubs]);

    // Icon Mapping
    const CATEGORY_ICONS: Record<string, React.ElementType> = {
        'エンタメ': Tv,
        '仕事': Briefcase,
        '健康': Heart,
        '教育': GraduationCap,
        '生活': Home,
        '保険': Shield,
        '税金': Landmark,
        '通信': Wifi,
        'その他': MoreHorizontal
    };

    // Active categories for filter chips
    const activeCategories = useMemo(() => {
        const cats = new Set(activeSubs.map(s => s.category));
        return CATEGORIES.filter(c => cats.has(c));
    }, [activeSubs]);

    // Chart Logic
    const chartData = useMemo(() => {
        let rawData: { name: string; value: number; color: string }[] = [];

        if (chartType === 'category') {
            rawData = CATEGORIES.map((cat) => {
                const total = filteredSubs.filter(s => s.category === cat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: getDisplayLabel(cat), value: total, color: CATEGORY_COLORS[cat] || '#cbd5e1' };
            });
        } else if (chartType === 'satisfaction') {
            rawData = SATISFACTION_LEVELS.map((sat) => {
                const total = filteredSubs.filter(s => s.satisfaction === sat).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
                return { name: getDisplayLabel(sat), value: total, color: SATISFACTION_COLORS[sat] };
            });
        }

        const filtered = rawData.filter(d => d.value > 0);
        return filtered.length > 0 ? filtered : [{ name: 'None', value: 1, color: '#f1f5f9' }];
    }, [filteredSubs, chartType, lang]);

    const toggleChartType = () => {
        setChartType(prev => prev === 'category' ? 'satisfaction' : 'category');
    };

    const sortedSubs = useMemo(() => {
        const list = [...filteredSubs];
        if (sortKey === 'price_desc') return list.sort((a, b) => getMonthlyAmount(b) - getMonthlyAmount(a));
        if (sortKey === 'satisfaction') {
            const score: Record<string, number> = { '低': 2, '中': 1, '高': 0 };
            return list.sort((a, b) => score[b.satisfaction] - score[a.satisfaction]);
        }
        if (sortKey === 'category') {
            return list.sort((a, b) => {
                const idxA = CATEGORIES.indexOf(a.category);
                const idxB = CATEGORIES.indexOf(b.category);
                return idxA - idxB;
            });
        }
        return list.sort((a, b) => getDaysUntilBilling(a.nextBilling) - getDaysUntilBilling(b.nextBilling));
    }, [filteredSubs, sortKey]);

    const getPaymentBadgeColor = (pm?: PaymentMethod) => {
        if (!pm) return '#64748b';
        return PAYMENT_METHOD_COLORS[pm] || '#64748b';
    };

    return (
        <div className="space-y-4">
            {/* Billing Reminder Banner */}
            {upcomingSubs.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-3">
                        <AlertTriangle size={14} /> {t('billing.upcoming')}
                    </h4>
                    <div className="space-y-2">
                        {upcomingSubs.map(({ sub, days }) => (
                            <div key={sub.id} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-skin-text">{sub.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-skin-subtext">
                                        {t('currency')}{sub.amount.toLocaleString()}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${days === 0 ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'}`}>
                                        {days === 0 ? t('billing.todayBilling') : t('card.daysLeft').replace('{days}', days.toString())}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-800 flex justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                        <span>{t('billing.totalThisWeek')}</span>
                        <span>{t('currency')}{upcomingSubs.reduce((sum, { sub }) => sum + sub.amount, 0).toLocaleString()}</span>
                    </div>
                </div>
            )}

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
                        <p className="text-xs text-skin-subtext mt-2">{t('stats.active')}: {filteredSubs.length}{t('stats.items')}</p>
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
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Chart Type Indicator */}
                        <div className="flex gap-1 mt-1">
                            {['category', 'satisfaction'].map(type => (
                                <div
                                    key={type}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${chartType === type ? 'bg-skin-text' : 'bg-skin-border'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-skin-subtext" />
                <input
                    type="text"
                    placeholder={t('form.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-skin-card border border-skin-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-skin-primary transition-all"
                />
            </div>

            {/* Category Filter Chips */}
            {activeCategories.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                    <button
                        onClick={() => setFilterCategory('all')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-all ${filterCategory === 'all' ? 'bg-skin-text text-skin-card' : 'bg-skin-base border border-skin-border text-skin-subtext'}`}
                    >
                        All
                    </button>
                    {activeCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full whitespace-nowrap transition-all ${filterCategory === cat ? 'text-white' : 'bg-skin-base border border-skin-border text-skin-subtext'}`}
                            style={filterCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}
                        >
                            {getDisplayLabel(cat)}
                        </button>
                    ))}
                </div>
            )}

            {/* Filter & Sort Controls */}
            <div className="flex justify-between items-center px-1">
                {/* Type Filter */}
                <div className="flex bg-skin-base p-1 rounded-lg border border-skin-border">
                    <button onClick={() => setFilterType('all')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${filterType === 'all' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}>All</button>
                    <button onClick={() => setFilterType('subscription')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${filterType === 'subscription' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}>{t('type.subscription')}</button>
                    <button onClick={() => setFilterType('fixed')} className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${filterType === 'fixed' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}>{t('type.fixed')}</button>
                </div>

                <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="text-xs bg-transparent border-none text-skin-subtext font-medium focus:ring-0 cursor-pointer outline-none"
                >
                    <option value="date">{t('sort.date')}</option>
                    <option value="price_desc">{t('sort.price')}</option>
                    <option value="satisfaction">{t('sort.satisfaction')}</option>
                    <option value="category">{t('sort.category')}</option>
                </select>
            </div>

            <LayoutGroup>
                <motion.div layout className="space-y-4">
                    <AnimatePresence initial={false}>
                        {sortedSubs.map(sub => {
                            const days = getDaysUntilBilling(sub.nextBilling);
                            const isFixedCost = sub.type === 'fixed';
                            const cancelScore = getCancelScore(sub);
                            // Fixed costs (insurance, taxes…) are mandatory → no cancel review badge
                            const rec = isFixedCost ? null : getCancelRecommendation(cancelScore, lang);
                            const CategoryIcon = CATEGORY_ICONS[sub.category] || MoreHorizontal;
                            const categoryColor = CATEGORY_COLORS[sub.category] || '#94a3b8';

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={sub.id}
                                    className="bg-skin-card rounded-2xl p-4 shadow-sm border border-skin-border hover:border-skin-subtext/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: categoryColor }}></div>

                                    <div className="pl-3 flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            {/* Category Icon */}
                                            <div className="p-2 rounded-xl bg-skin-base shrink-0" style={{ color: categoryColor }}>
                                                <CategoryIcon size={20} />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-base mb-0.5 leading-tight">{sub.name}</h3>
                                                <p className="text-xs text-skin-subtext font-medium flex items-center gap-2 flex-wrap">
                                                    {t('currency')}{sub.amount.toLocaleString()} <span className="opacity-60">/ {sub.cycle === 'monthly' ? t('cycle.mo') : t('cycle.yr')}</span>
                                                    {sub.paymentMethod && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: getPaymentBadgeColor(sub.paymentMethod) }}>
                                                            {t(`paymentLabels.${sub.paymentMethod}`)}
                                                        </span>
                                                    )}
                                                    {rec && <span className={`px-1.5 py-0.5 rounded text-[9px] border ${rec.color}`}>{rec.label}</span>}
                                                </p>
                                                {!isFixedCost && cancelScore >= 4 && (
                                                    <p className="text-[10px] font-bold text-rose-500 mt-1">
                                                        {t('savings.yearlyHint').replace('{amount}', getYearlyAmount(sub).toLocaleString())}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`text-xs font-bold text-right whitespace-nowrap ${getUrgencyColor(days)}`}>
                                            {days < 0 ? t('card.expired') : days === 0 ? t('card.today') : t('card.daysLeft').replace('{days}', days.toString())}
                                        </div>
                                    </div>

                                    <div className="pl-3 mt-4 flex justify-between items-center border-t border-skin-border pt-3">
                                        <div className="flex gap-3 text-xs text-skin-subtext">
                                            <span style={{ color: categoryColor }} className="font-bold">{getDisplayLabel(sub.category)}</span>
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
