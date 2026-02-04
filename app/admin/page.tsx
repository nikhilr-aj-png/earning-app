"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Users, Settings, Database, ChevronLeft, ShieldAlert, BarChart3, Plus, Trash2, Activity, Zap, TrendingUp, Gamepad2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export default function AdminPage() {
    const { user } = useUser();
    const [view, setView] = useState<'stats' | 'users' | 'tasks' | 'probo' | 'casino'>('stats');
    const queryClient = useQueryClient();

    // Queries
    const { data: adminStats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats', { headers: { 'x-user-id': user?.id || '' } });
            return res.json();
        },
        enabled: !!user,
    });

    const { data: adminUsers = [], isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users', { headers: { 'x-user-id': user?.id || '' } });
            return res.json();
        },
        enabled: !!user && view === 'users',
    });

    const { data: proboEvents = [] } = useQuery({
        queryKey: ['admin-probo'],
        queryFn: async () => {
            const res = await fetch('/api/probo/events');
            return res.json();
        },
        enabled: !!user && view === 'probo',
    });

    // Mutations
    const createEventMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/probo/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(payload)
            });
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-probo'] })
    });

    const resolveEventMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/probo/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(payload)
            });
            return res.json();
        },
        onSuccess: () => {
            alert("EVENT RESOLVED & PAYOUTS DISTRIBUTED");
            queryClient.invalidateQueries({ queryKey: ['admin-probo'] });
        }
    });

    const adjustCoinsMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/admin/adjust-coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(payload)
            });
            return res.json();
        },
        onSuccess: () => {
            alert("BALANCE ADJUSTED");
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        }
    });

    // Handlers
    const handleCreateProbo = () => {
        const question = prompt('Question?');
        const category = prompt('Category (e.g. Crypto, Sports)?');
        if (question) createEventMutation.mutate({ question, category });
    };

    const handleResolveProbo = (eventId: string, result: 'yes' | 'no') => {
        if (confirm(`Resolve as ${result.toUpperCase()}?`)) {
            resolveEventMutation.mutate({ eventId, result });
        }
    };

    const handleAdjustCoins = (userId: string) => {
        const amount = prompt('Amount to add/remove (e.g. 100 or -50)?');
        if (amount) adjustCoinsMutation.mutate({ userId, amount });
    };

    if (!user || !user.is_admin) return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '20px' }}>
            <ShieldAlert size={48} color="var(--error)" />
            <h2 style={{ fontWeight: '900', color: 'var(--error)' }}>UNAUTHORIZED ACCESS</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Admin privileges required.</p>
            <Link href="/dashboard" className="btn" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>BACK TO DASHBOARD</Link>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '90vh' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '48px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '44px', height: '44px', padding: '0', borderRadius: '4px', border: '1px solid #fff' }}>
                    <ChevronLeft size={20} color="#fff" />
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '6px' }}>EXECUTIVE CONTROL</h1>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>V2.0 PRIVILEGED ACCESS</span>
                </div>
                <div className="glass-panel flex-center" style={{ width: '44px', height: '44px', padding: '0', borderRadius: '4px', border: '1px solid #fff' }}>
                    <ShieldAlert size={20} color="#fff" />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #222' }}>
                {['stats', 'users', 'tasks', 'probo', 'casino'].map((t) => (
                    <button
                        key={t} onClick={() => setView(t as any)}
                        style={{
                            padding: '14px 2px', borderRadius: '2px', border: 'none', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px',
                            background: view === t ? '#fff' : 'transparent',
                            color: view === t ? '#000' : 'var(--text-dim)',
                            transition: '0.3s'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Views */}
            {view === 'stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid #222' }}>
                        <Users size={24} color="#fff" strokeWidth={1} style={{ marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px' }}>{adminStats?.totalUsers || 0}</h2>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>TOTAL USERS</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', border: '1px solid #222' }}>
                        <Database size={24} color="#fff" strokeWidth={1} style={{ marginBottom: '16px' }} />
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px' }}>{adminStats?.totalCoinsDistributed || 0}</h2>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>DISTRIBUTED CREDITS</p>
                    </div>
                </div>
            )}

            {view === 'users' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {usersLoading ? <p>Loading Operators...</p> : adminUsers.map((u: any) => (
                        <div key={u.id} className="glass-panel flex-between" style={{ padding: '20px', borderRadius: '2px', border: '1px solid #222' }}>
                            <div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px' }}>{u.name.toUpperCase()}</h4>
                                <p style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '900', letterSpacing: '1px' }}>{u.coins.toLocaleString()} FLOW</p>
                            </div>
                            <div className="flex-center" style={{ gap: '16px' }}>
                                <button onClick={() => handleAdjustCoins(u.id)} style={{ background: '#fff', border: 'none', color: '#000', padding: '6px 12px', borderRadius: '2px', fontSize: '0.6rem', fontWeight: '900' }}>ADJUST</button>
                                <Settings size={18} color="var(--text-dim)" strokeWidth={1} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'probo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <button onClick={handleCreateProbo} className="btn" style={{ background: '#fff', color: '#000' }}>
                        NEW PREDICTION EVENT
                    </button>
                    {proboEvents.map((e: any) => (
                        <div key={e.id} className="glass-panel" style={{ padding: '32px', border: '1px solid #222' }}>
                            <h4 style={{ fontWeight: '900', marginBottom: '24px', fontSize: '0.9rem', letterSpacing: '1px', lineHeight: '1.4' }}>{e.question.toUpperCase()}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={() => handleResolveProbo(e.id, 'yes')} className="btn" style={{ background: '#333', color: '#fff', fontSize: '0.65rem', border: '1px solid #444' }}>RESOLVE YES</button>
                                <button onClick={() => handleResolveProbo(e.id, 'no')} className="btn" style={{ background: 'transparent', color: '#fff', fontSize: '0.65rem', border: '1px solid #fff' }}>RESOLVE NO</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'casino' && (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', border: '1px solid #fff', borderRadius: '4px' }}>
                    <Activity size={32} color="#fff" strokeWidth={1} style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#fff', marginBottom: '24px', letterSpacing: '4px' }}>ARENA LOAD MONITOR</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px' }}>ALGORITHM: LOW-DENSITY VECTOR SELECTION</p>
                    <div style={{ marginTop: '32px', padding: '24px', border: '1px solid #222', background: 'transparent' }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>REAL-TIME DATA STREAM SYNCHRONIZED WITH PROJECT 2.</p>
                    </div>
                </div>
            )}

        </div>
    );
}
