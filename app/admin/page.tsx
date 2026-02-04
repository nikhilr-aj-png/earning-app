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
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px' }}>
                    <ChevronLeft size={20} />
                </Link>
                <div style={{ textAlign: 'center' }}>
                    <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '2px' }}>EXECUTIVE CONTROL</h1>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: '900', letterSpacing: '0.1em' }}>PRIVILEGED ACCESS</span>
                </div>
                <div className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px', borderColor: 'var(--accent)' }}>
                    <ShieldAlert size={20} color="var(--accent)" />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px' }}>
                {['stats', 'users', 'tasks', 'probo', 'casino'].map((t) => (
                    <button
                        key={t} onClick={() => setView(t as any)}
                        style={{
                            padding: '10px 4px', borderRadius: '10px', border: 'none', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase',
                            background: view === t ? 'var(--primary)' : 'transparent',
                            color: view === t ? '#00' : 'var(--text-muted)'
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Views */}
            {view === 'stats' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                        <Users size={28} color="var(--primary)" style={{ marginBottom: '12px' }} />
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>{adminStats?.totalUsers || 0}</h2>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800' }}>USERS</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                        <Database size={28} color="var(--secondary)" style={{ marginBottom: '12px' }} />
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900' }}>{adminStats?.totalCoinsDistributed || 0}</h2>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '800' }}>COINS</p>
                    </div>
                </div>
            )}

            {view === 'users' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {usersLoading ? <p>Loading Users...</p> : adminUsers.map((u: any) => (
                        <div key={u.id} className="glass-panel flex-between" style={{ padding: '16px' }}>
                            <div>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: '800' }}>{u.name}</h4>
                                <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '900' }}>{u.coins.toLocaleString()} FLOW</p>
                            </div>
                            <div className="flex-center" style={{ gap: '12px' }}>
                                <button onClick={() => handleAdjustCoins(u.id)} style={{ background: 'none', border: 'none', color: 'var(--success)' }}><Plus size={20} /></button>
                                <Settings size={18} color="var(--text-dim)" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'probo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button onClick={handleCreateProbo} className="btn" style={{ background: 'var(--primary)', color: '#000' }}>
                        <Plus size={18} /> CREATE EVENT
                    </button>
                    {proboEvents.map((e: any) => (
                        <div key={e.id} className="glass-panel" style={{ padding: '20px' }}>
                            <h4 style={{ fontWeight: '800', marginBottom: '16px' }}>{e.question}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button onClick={() => handleResolveProbo(e.id, 'yes')} className="btn" style={{ background: 'var(--success)', fontSize: '0.65rem' }}>RESOLVE YES</button>
                                <button onClick={() => handleResolveProbo(e.id, 'no')} className="btn" style={{ background: 'var(--error)', fontSize: '0.65rem' }}>RESOLVE NO</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {view === 'casino' && (
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <Activity size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '16px' }}>LIVE ARENA MONITOR</h3>
                    <p style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: '800' }}>PROFIT LOGIC ACTIVE: LEAST BET SIDE WINS</p>
                    <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Real-time betting totals are polled from Project 2.</p>
                    </div>
                </div>
            )}

        </div>
    );
}
