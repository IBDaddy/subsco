// State for Chart Type
const [chartType, setChartType] = useState<ChartType>('category');

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
    return [];
}, [activeSubs, chartType, lang]);

// BUDGET
const budgetStatus = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return null;
    const ratio = (totalMonthly / (typeof monthlyIncome === 'number' ? monthlyIncome : parseInt(monthlyIncome))) * 100;
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
                    onChange={(e) => onIncomeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-skin-primary"
                />
            </div>
            {monthlyIncome !== '' && monthlyIncome > 0 && (
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

        {/* Combined Chart & Toggle */}
        <div className="bg-skin-card rounded-2xl p-6 border border-skin-border shadow-skin flex flex-col items-center relative">
            <div className="flex bg-skin-base rounded-lg p-1 mb-4 absolute top-4 right-4 z-10">
                <button
                    onClick={() => setChartType('category')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${chartType === 'category' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                >
                    {t('analysis.category')}
                </button>
                <button
                    onClick={() => setChartType('satisfaction')}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${chartType === 'satisfaction' ? 'bg-skin-card shadow text-skin-text' : 'text-skin-subtext'}`}
                >
                    {t('analysis.satisfaction')}
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
                {chartType === 'category' ? t('analysis.category') : t('analysis.satisfaction')} {t('stats.chart')}
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
                                <span className="font-bold">{t('currency')}{item.value.toLocaleString()}</span>
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
