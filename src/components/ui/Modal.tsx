import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: ReactNode;
    footer?: ReactNode;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    inputMode?: boolean;
    inputValue?: string | number;
    inputPlaceholder?: string;
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Modal = ({
    isOpen, onClose, title, children, footer,
    message, onConfirm, onCancel, confirmText, cancelText, isDanger,
    inputMode, inputValue, inputPlaceholder, onInputChange
}: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-skin-card rounded-skin shadow-skin w-full max-w-sm p-6 relative z-10 border border-skin-border"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-skin-text tracking-wide">{title}</h3>
                            <button onClick={onClose} className="text-skin-subtext hover:text-skin-text transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        {message && <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{message}</p>}

                        {inputMode && (
                            <div className="mb-4">
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={onInputChange}
                                    placeholder={inputPlaceholder}
                                    className="w-full px-3 py-2 border rounded-lg text-sm bg-skin-base border-skin-border text-skin-text focus:outline-none focus:ring-2 focus:ring-skin-primary"
                                    autoFocus
                                />
                            </div>
                        )}

                        {children}

                        {(footer || onConfirm) && (
                            <div className="mt-8 flex justify-end gap-3">
                                {footer ? footer : (
                                    <>
                                        <button onClick={onCancel || onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-skin-subtext hover:bg-skin-base transition-colors">{cancelText}</button>
                                        <button onClick={onConfirm} className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm transition-colors ${isDanger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-skin-primary hover:opacity-90'}`}>
                                            {confirmText}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
