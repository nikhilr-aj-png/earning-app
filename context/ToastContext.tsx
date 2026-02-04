"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed', top: '24px', right: '24px',
                zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} className="animate-fade-in" style={{
                        pointerEvents: 'auto',
                        minWidth: '300px',
                        background: '#000',
                        border: '1px solid #fff',
                        padding: '16px 20px',
                        borderRadius: '4px',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        {toast.type === 'success' && <CheckCircle2 size={20} color="#fff" />}
                        {toast.type === 'error' && <AlertCircle size={20} color="#fff" />}
                        {toast.type === 'info' && <Info size={20} color="#fff" />}

                        <p style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px', flex: 1, textTransform: 'uppercase' }}>
                            {toast.message}
                        </p>

                        <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
};
