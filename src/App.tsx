import { useState } from 'react';
import { List, ChartPie, History, Settings, Plus, Grid2x2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscriptionContext } from './context/SubscriptionContext';
import { useTranslation } from './hooks/useTranslation';
import { Modal } from './components/ui/Modal';
import { SubscriptionForm } from './components/forms/SubscriptionForm';
import { SubscriptionList } from './components/views/SubscriptionList';
import { AnalysisView } from './components/views/AnalysisView';
import { MatrixView } from './components/views/MatrixView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { Subscription, BackupData } from './types';

function App() {
    const {
        subscriptions, history, isLoaded, lang, monthlyIncome,
        setLang, setMonthlyIncome,
        addSubscription, updateSubscription, deleteSubscription,
        toggleStatus, resetData, importData
    } = useSubscriptionContext();

    const [activeTab, setActiveTab] = useState('list');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);

    // Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false, title: '', message: '', onConfirm: undefined as undefined | (() => void),
        isDanger: false, inputMode: false, inputValue: '', inputPlaceholder: '', confirmText: ''
    });

    const { t } = useTranslation(lang);

    // --- Handlers ---
    const handleOpenAdd = () => {
        setEditingSub(null);
        setIsFormOpen(true);
    };

    const handleEdit = (sub: Subscription) => {
        setEditingSub(sub);
        setIsFormOpen(true);
    };

    const handleSubmitForm = (data: Omit<Subscription, 'id'>) => {
        if (editingSub) {
            updateSubscription({ ...data, id: editingSub.id } as Subscription);
        } else {
            addSubscription(data);
        }
        setIsFormOpen(false);
    };

    const handleDeleteClick = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: t('modal.deleteTitle'),
            message: t('modal.deleteMsg'),
            onConfirm: () => {
                deleteSubscription(id);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            },
            isDanger: true,
            confirmText: t('modal.deleteBtn'),
            inputMode: false,
            inputValue: '',
            inputPlaceholder: ''
        });
    };

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const handleToggleStatus = (id: number) => {
        const sub = subscriptions.find(s => s.id === id);
        if (!sub) return;

        if (sub.isActive) {
            toggleStatus(id);
        } else {
            setConfirmModal({
                isOpen: true,
                title: t('modal.resumeTitle'),
                message: t('modal.resumeMsg'),
                onConfirm: () => {
                    const inputVal = document.querySelector<HTMLInputElement>('input[type="number"]')?.value || String(sub.amount);
                    toggleStatus(id, parseInt(inputVal));
                    closeConfirmModal();
                },
                confirmText: t('modal.resumeBtn'),
                isDanger: false,
                inputMode: true,
                inputValue: sub.amount.toString(),
                inputPlaceholder: t('form.amount')
            });
        }
    };

    const handleResetClick = () => {
        setConfirmModal({
            isOpen: true,
            title: t('modal.resetTitle'),
            message: t('modal.resetMsg'),
            onConfirm: () => {
                resetData();
                closeConfirmModal();
            },
            isDanger: true,
            confirmText: t('modal.resetBtn'),
            inputMode: false,
            inputValue: '',
            inputPlaceholder: ''
        });
    };

    const handleImport = (data: BackupData) => {
        setConfirmModal({
            isOpen: true,
            title: t('modal.restoreTitle'),
            message: t('modal.restoreMsg'),
            onConfirm: () => {
                importData(data);
                closeConfirmModal();
                setActiveTab('list');
            },
            isDanger: true,
            confirmText: t('modal.restoreBtn'),
            inputMode: false,
            inputValue: '',
            inputPlaceholder: ''
        });
    };

    if (!isLoaded) return <div className="min-h-screen bg-skin-base flex items-center justify-center text-skin-subtext">Loading...</div>;

    return (
        <div className="min-h-screen bg-skin-base text-skin-text font-skin transition-colors duration-300 pb-20">
            <Modal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
                confirmText={confirmModal.confirmText}
                cancelText={t('modal.cancel')}
                isDanger={confirmModal.isDanger}
                inputMode={confirmModal.inputMode}
                inputValue={confirmModal.inputValue}
                inputPlaceholder={confirmModal.inputPlaceholder}
                onInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmModal(prev => ({ ...prev, inputValue: e.target.value }))}
            />

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingSub ? t('modal.edit') : t('modal.add')}
            >
                <SubscriptionForm
                    initialData={editingSub}
                    onSubmit={handleSubmitForm}
                    lang={lang}
                />
            </Modal>

            <div className="max-w-lg mx-auto p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{t('appTitle')}</h1>
                        <p className="text-xs text-skin-subtext font-medium tracking-wide">{t('appDesc')}</p>
                    </div>
                    {activeTab === 'list' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenAdd}
                            className="w-10 h-10 bg-skin-primary text-skin-primary-fg rounded-full flex items-center justify-center shadow-lg"
                        >
                            <Plus size={20} />
                        </motion.button>
                    )}
                </div>

                {/* Content */}
                <div className="pb-20">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'list' && (
                                <SubscriptionList
                                    subscriptions={subscriptions}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteClick}
                                    onToggleStatus={handleToggleStatus}
                                    lang={lang}
                                />
                            )}

                            {activeTab === 'analysis' && (
                                <AnalysisView
                                    subscriptions={subscriptions}
                                    monthlyIncome={monthlyIncome}
                                    onIncomeChange={setMonthlyIncome}
                                    lang={lang}
                                />
                            )}

                            {activeTab === 'matrix' && (
                                <MatrixView
                                    subscriptions={subscriptions}
                                    onEdit={handleEdit}
                                    lang={lang}
                                />
                            )}

                            {activeTab === 'history' && (
                                <HistoryView history={history} lang={lang} />
                            )}

                            {activeTab === 'settings' && (
                                <SettingsView
                                    lang={lang}
                                    onLangChange={setLang}
                                    onReset={handleResetClick}
                                    onImport={handleImport}
                                    subscriptions={subscriptions}
                                    history={history}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-skin-card/90 backdrop-blur-xl border border-skin-border shadow-2xl rounded-full px-6 py-3 flex gap-8 z-30">
                {[
                    { id: 'list', icon: <List size={22} /> },
                    { id: 'matrix', icon: <Grid2x2 size={22} /> },
                    { id: 'analysis', icon: <ChartPie size={22} /> },
                    { id: 'history', icon: <History size={22} /> },
                    { id: 'settings', icon: <Settings size={22} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`transition-all duration-300 relative ${activeTab === tab.id ? 'text-skin-text scale-110' : 'text-skin-subtext hover:text-skin-text'}`}
                    >
                        {tab.icon}
                        {activeTab === tab.id && (
                            <motion.span
                                layoutId="tabIndicator"
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-skin-text rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default App;
