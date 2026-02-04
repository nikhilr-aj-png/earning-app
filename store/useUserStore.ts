import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    email: string;
    coins: number;
    referral_code: string;
    is_admin: boolean;
    is_premium: boolean;
    premium_until?: string;
    is_blocked: boolean;
}

interface UserState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    updateCoins: (coins: number) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            loading: true,
            setUser: (user) => set({ user, loading: false }),
            setLoading: (loading) => set({ loading }),
            updateCoins: (coins) => set((state) => ({
                user: state.user ? { ...state.user, coins } : null
            })),
            logout: () => set({ user: null, loading: false }),
        }),
        {
            name: 'earn-flow-user',
        }
    )
);
