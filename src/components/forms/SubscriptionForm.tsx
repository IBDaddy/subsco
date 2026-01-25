import { useState, useEffect } from 'react';
import { TRANSLATIONS, PRESETS, CATEGORIES, COLOR_PALETTE, CATEGORY_COLORS, SATISFACTION_LEVELS, FREQUENCY_LEVELS } from '../../lib/constants';
import { Subscription, Category, Satisfaction, Language } from '../../types';

interface SubscriptionFormProps {
    initialData?: Subscription | null;
    onSubmit: (data: Omit<Subscription, 'id'>) => void;
    lang: Language;
}

export const SubscriptionForm = ({ initialData, onSubmit, lang }: SubscriptionFormProps) => {
    const t = (path: string) => path.split('.').reduce((obj: any, key) => obj && obj[key], TRANSLATIONS[lang]) || path;
    const getDisplayLabel = (key: string) => (TRANSLATIONS[lang].dataMap as any)[key] || key;

    const [formData, setFormData] = useState<Omit<Subscription, 'id'>>({
        name: '', amount: 0, cycle: 'monthly', nextBilling: '', category: 'その他',
        color: CATEGORY_COLORS['その他'], satisfaction: '中', frequency: '週1', isActive: true
    });

    const [errors, setErrors] = useState<{ name?: string; amount?: string; nextBilling?: string }>({});

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        // Preset checking logic might need adjustment if logic was name-based
        // Actually PRESETS keys are names.
        const presetKey = PRESETS[val] ? val : Object.keys(PRESETS).find(k => k === val);

        if (presetKey) {
            const p = PRESETS[presetKey];
            setFormData(prev => ({ ...prev, name: val, amount: p.amount, category: p.category, color: p.color }));
            setErrors(prev => ({ ...prev, name: undefined, amount: undefined }));
        } else {
            setFormData(prev => ({ ...prev, name: val }));
            if (val.trim()) setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handleSubmit = () => {
        const newErrors: typeof errors = {};
        if (!formData.name || !formData.name.trim()) newErrors.name = 'Required';
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Required';
        if (!formData.nextBilling) newErrors.nextBilling = 'Required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({ ...formData, amount: Number(formData.amount) });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.name')}</label>
                <input
                    type="text"
                    list="service-suggestions"
                    placeholder={t('form.placeholderName')}
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-skin-primary transition-all"
                />
                <datalist id="service-suggestions">{Object.keys(PRESETS).map(key => <option key={key} value={key} />)}</datalist>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.amount')}</label>
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder={t('form.placeholderAmount')}
                        value={formData.amount || ''}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^\d]/g, '');
                            setFormData({ ...formData, amount: val === '' ? 0 : parseInt(val) });
                        }}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm"
                    />
                    {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.cycle')}</label>
                    <select
                        value={formData.cycle}
                        onChange={(e) => setFormData({ ...formData, cycle: e.target.value as any })}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm"
                    >
                        <option value="monthly">{t('cycle.monthly')}</option>
                        <option value="yearly">{t('cycle.yearly')}</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.category')}</label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category, color: CATEGORY_COLORS[e.target.value] })}
                    className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm mb-2"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{getDisplayLabel(c)}</option>)}
                </select>
                <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                    {COLOR_PALETTE.map(c => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: c })}
                            className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${formData.color === c ? 'border-skin-text scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.nextBilling')}</label>
                    <input
                        type="date"
                        value={formData.nextBilling}
                        onChange={(e) => setFormData({ ...formData, nextBilling: e.target.value })}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm"
                    />
                    {errors.nextBilling && <p className="text-rose-500 text-xs mt-1">{errors.nextBilling}</p>}
                </div>
                <div>
                    <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.satisfaction')}</label>
                    <select
                        value={formData.satisfaction}
                        onChange={(e) => setFormData({ ...formData, satisfaction: e.target.value as Satisfaction })}
                        className="w-full px-3 py-2 bg-skin-base border border-skin-border rounded-lg text-sm"
                    >
                        {SATISFACTION_LEVELS.map(s => <option key={s} value={s}>{getDisplayLabel(s)}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-skin-subtext mb-1 block">{t('form.frequency')}</label>
                <div className="flex flex-wrap gap-2">
                    {FREQUENCY_LEVELS.map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFormData({ ...formData, frequency: f })}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${formData.frequency === f ? 'bg-skin-primary text-skin-primary-fg' : 'bg-skin-base border border-skin-border text-skin-subtext'}`}
                        >
                            {getDisplayLabel(f)}
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={handleSubmit} className="w-full bg-skin-primary text-skin-primary-fg py-3 rounded-skin text-sm font-bold shadow-sm active:scale-95 transition-transform mt-4">
                {t(initialData ? 'modal.update' : 'modal.addBtn')}
            </button>
        </div>
    );
};
