"use client";

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './ToastContext';

interface User {
    id: string;
    display_id?: string;
    email: string;
    name?: string;
    coins: number;
    is_admin: boolean;
    is_premium: boolean;
    [key: string]: any;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string, refCode?: string) => Promise<void>;
    verifyOtp: (email: string, token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
    resendOtp: (email: string, type: 'signup' | 'recovery') => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, setUser, setLoading, logout: storeLogout } = useUserStore();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        // Initial hydration check
        const stored = localStorage.getItem('earn-flow-user');
        // Always set loading to false after checking localStorage to allow the app to proceed
        setLoading(false);
    }, [setLoading]);

    // GLOBAL POLLING: Refresh user data every 10s to keep balance/status in sync site-wide
    useQuery({
        queryKey: ['global-user-sync'],
        queryFn: async () => {
            if (!user?.id) return null;
            // Re-use refresh logic but return something for query
            await refreshUser();
            return true;
        },
        enabled: !!user?.id,
        refetchInterval: 5000,
        refetchOnWindowFocus: true
    });

    const login = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.is_blocked) {
                showToast("ACCESS DENIED. ACCOUNT SUSPENDED.", "error");
                return;
            }
            setUser(data);
            showToast("ACCESS GRANTED. WELCOME EXECUTIVE.", "success");
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    }, [setUser, showToast, router]);

    const register = useCallback(async (email: string, password: string, name?: string, refCode?: string) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, referralCode: refCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast("OTP SENT.", "info");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    }, [showToast]);

    const verifyOtp = useCallback(async (email: string, token: string, name?: string, referralCode?: string) => {
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, name, referralCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.is_blocked) {
                showToast("ACCESS DENIED. ACCOUNT SUSPENDED.", "error");
                return;
            }
            setUser(data);
            showToast("IDENTITY VERIFIED. ENTRY SECURED.", "success");
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    }, [setUser, showToast, router]);

    const logout = useCallback(() => {
        storeLogout();
        router.push('/');
    }, [storeLogout, router]);

    const refreshUser = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/user', {
                headers: { 'x-user-id': user.id }
            });
            if (res.ok) {
                const newData = await res.json();
                if (newData.is_blocked) {
                    showToast("ACCESS DENIED. ACCOUNT SUSPENDED.", "error");
                    logout();
                    return;
                }

                // Only update if data has actually changed to prevent infinite loops
                const hasChanged = JSON.stringify(newData) !== JSON.stringify(user);
                if (hasChanged) {
                    setUser(newData);
                }
            } else if (res.status === 404 || res.status === 401) {
                // Profile missing or unauthorized - terminated session
                logout();
            }
        } catch (err: unknown) {
            console.error("Failed to refresh user", err);
        }
    }, [user, setUser, logout]);

    const forgotPassword = async (email: string) => {
        try {
            const res = await fetch('/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showToast("OTP SENT.", "info");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Recovery request failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string) => {
        try {
            const res = await fetch('/api/auth/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast("PROTOCOL UPDATED. ACCESS RESTORED.", "success");
            // Automatically log them in or ask them to login?
            // The reset API route uses updateUser which update the session.
            // But we should probably redirect or refresh.
            router.push('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Reset failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    const resendOtp = async (email: string, type: 'signup' | 'recovery') => {
        try {
            const res = await fetch('/api/auth/otp/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showToast("OTP RESENT.", "info");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Resend failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, register, verifyOtp, logout, refreshUser, forgotPassword, resetPassword, resendOtp }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
