"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useToast } from './ToastContext';

interface UserContextType {
    user: any;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string, refCode?: string) => Promise<void>;
    verifyOtp: (email: string, token: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, setUser, setLoading, logout: storeLogout } = useUserStore();
    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        // Initial hydration check
        const stored = localStorage.getItem('earn-flow-user');
        if (!stored) {
            setLoading(false);
        }
    }, [setLoading]);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data);
            showToast("ACCESS GRANTED. WELCOME EXECUTIVE.", "success");
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    const register = async (email: string, password: string, name?: string, refCode?: string) => {
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, referralCode: refCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast("VERIFICATION CODE TRANSMITTED.", "info");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Signup failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    const verifyOtp = async (email: string, token: string) => {
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data);
            showToast("IDENTITY VERIFIED. ENTRY SECURED.", "success");
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            showToast(message.toUpperCase(), "error");
            throw err;
        }
    };

    const logout = () => {
        storeLogout();
        router.push('/');
    };

    const refreshUser = async () => {
        if (!user) return;
        try {
            const res = await fetch('/api/user', {
                headers: { 'x-user-id': user.id }
            });
            if (res.ok) {
                const newData = await res.json();
                setUser(newData);
            }
        } catch (err) {
            console.error("Failed to refresh user", err);
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, register, verifyOtp, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
