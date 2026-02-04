"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

interface UserContextType {
    user: any;
    loading: boolean;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, token: string, name?: string, refCode?: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading, setUser, setLoading, logout: storeLogout } = useUserStore();
    const router = useRouter();

    useEffect(() => {
        // Initial hydration check
        const stored = localStorage.getItem('earn-flow-user');
        if (!stored) {
            setLoading(false);
        }
    }, [setLoading]);

    const sendOtp = async (email: string) => {
        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            alert("OTP SENT TO YOUR EMAIL!");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to send OTP';
            alert(message);
            throw err;
        }
    };

    const verifyOtp = async (email: string, token: string, name?: string, refCode?: string) => {
        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, name, referralCode: refCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data);
            router.push('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Verification failed';
            alert(message);
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
        <UserContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
