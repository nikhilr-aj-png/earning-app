"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Users, Settings, Database, ChevronLeft, ShieldAlert, BarChart3, Plus, Trash2, Activity, Zap, TrendingUp, Gamepad2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export default function AdminPage() {
    const { user, loading, refreshUser } = useUser();
    const [view, setView] = useState<'stats' | 'users' | 'tasks' | 'casino'>('stats');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userFilter, setUserFilter] = useState<'all' | 'free' | 'premium' | 'admin'>('all');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user) refreshUser();
    }, []);

    // Queries
    const { data: adminStats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const res = await fetch('/api/admin/stats', { headers: { 'x-user-id': user?.id || '' } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
            return data;
        },
        enabled: !!user,
    });

    const { data: adminUsers = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const res = await fetch('/api/admin/users', { headers: { 'x-user-id': user?.id || '' } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
            return data;
        },
        enabled: !!user && view === 'users',
    });

    // Probo queries and mutations removed as per request

    const userEditMutation = useMutation({
        mutationFn: async ({ userId, updates, action }: { userId: string, updates?: any, action?: string }) => {
            const res = await fetch('/api/admin/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ userId, updates, action })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Identity synchronization failed');
            return data;
        },
        onSuccess: (data) => {
            alert(data.message.toUpperCase());
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err: any) => {
            alert(`FATAL ERROR: ${err.message.toUpperCase()}`);
        }
    });

    const handleEditSave = (updates: any) => {
        if (!editingUser) return;
        userEditMutation.mutate({ userId: editingUser.id, updates });
    };

    const handleEditDelete = () => {
        if (!editingUser) return;
        if (window.confirm(`CRITICAL: PURGE IDENTITY ${editingUser.name.toUpperCase()}?\nTHIS ACTION IS PERMANENT.`)) {
            userEditMutation.mutate({ userId: editingUser.id, action: 'delete' });
        }
    };

    // Handlers
    // Probo handlers removed

    const handleEditUser = (u: any) => {
        setEditingUser(u);
    };


    if (loading) return (
        <div className="flex-center" style={{ minHeight: '80vh', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>
            SYNCHRONIZING PRIVILEGES...
        </div>
    );

    if (!user || user.is_admin !== true) return (
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
                    <h1 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '6px', margin: 0 }}>EXECUTIVE CONTROL</h1>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: '950', letterSpacing: '2px', opacity: 0.9 }}>
                            ADMIN: {user.name.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '1px' }}>
                            IDENTITY ID: {user.id.substring(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="glass-panel flex-center" style={{ width: '44px', height: '44px', padding: '0', borderRadius: '4px', border: '1px solid #fff' }}>
                    <ShieldAlert size={20} color="#fff" />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #222' }}>
                {['stats', 'users', 'tasks', 'casino'].map((t) => (
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
                        <p style={{ fontSize: '0.8rem', color: 'var(--emerald)', fontWeight: '900', marginTop: '8px' }}>
                            ≈ ₹{((adminStats?.totalCoinsDistributed || 0) / 10).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            )}

            {view === 'users' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Cohort Filter Bar */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #111' }}>
                        {['all', 'free', 'premium', 'admin'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setUserFilter(f as any)}
                                style={{
                                    flex: 1, padding: '10px 4px', border: 'none', borderRadius: '2px', fontSize: '0.6rem', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px',
                                    background: userFilter === f ? 'rgba(255,255,255,0.05)' : 'transparent',
                                    color: userFilter === f ? '#fff' : 'var(--text-dim)',
                                    borderBottom: userFilter === f ? '2px solid #fff' : '2px solid transparent',
                                    transition: '0.3s'
                                }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {usersLoading ? (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>SYNCING OPERATORS...</p>
                    ) : usersError ? (
                        <p style={{ color: 'var(--error)', fontSize: '0.7rem' }}>ERROR: {(usersError as Error).message}</p>
                    ) : Array.isArray(adminUsers) && adminUsers.length > 0 ? (
                        <>
                            {/* Admin Cluster */}
                            {(userFilter === 'all' || userFilter === 'admin') && (
                                <div>
                                    <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start', marginBottom: '20px', opacity: 0.8 }}>
                                        <ShieldAlert size={16} color="var(--gold)" />
                                        <h3 style={{ fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', color: 'var(--gold)' }}>ADMINISTRATIVE PERSONNEL</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {adminUsers.filter((u: any) => u.is_admin).map((u: any) => (
                                            <UserCard key={u.id} user={u} onEdit={handleEditUser} isAdmin />
                                        ))}
                                        {adminUsers.filter((u: any) => u.is_admin).length === 0 && (
                                            <p style={{ color: 'var(--text-dim)', fontSize: '0.6rem', padding: '20px', border: '1px dashed #222', textAlign: 'center' }}>NO ADMINT NODES LOCATED.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* User Cluster */}
                            {(userFilter === 'all' || userFilter === 'free' || userFilter === 'premium') && (
                                <div>
                                    <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start', marginBottom: '20px', opacity: 0.8 }}>
                                        <Users size={16} color="var(--sapphire)" />
                                        <h3 style={{ fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', color: 'var(--sapphire)' }}>GENERAL POPULATION</h3>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {adminUsers.filter((u: any) => {
                                            if (u.is_admin) return false;
                                            if (userFilter === 'free') return !u.is_premium;
                                            if (userFilter === 'premium') return u.is_premium;
                                            return true;
                                        }).map((u: any) => (
                                            <UserCard key={u.id} user={u} onEdit={handleEditUser} />
                                        ))}
                                        {adminUsers.filter((u: any) => {
                                            if (u.is_admin) return false;
                                            if (userFilter === 'free') return !u.is_premium;
                                            if (userFilter === 'premium') return u.is_premium;
                                            return true;
                                        }).length === 0 && (
                                                <p style={{ color: 'var(--text-dim)', fontSize: '0.6rem', padding: '20px', border: '1px dashed #222', textAlign: 'center' }}>NO NODES MATCHING FILTER.</p>
                                            )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>NO OPERATORS LOCATED.</p>
                    )}
                </div>
            )}

            {/* User Edit Terminal Modal */}
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleEditSave}
                    onDelete={handleEditDelete}
                    isSaving={userEditMutation.isPending}
                />
            )}

            {/* Probo view removed */}

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

function UserCard({ user, onEdit, isAdmin }: { user: any, onEdit: (u: any) => void, isAdmin?: boolean }) {
    return (
        <div className="glass-panel flex-between" style={{
            padding: '24px',
            borderRadius: '4px',
            border: isAdmin ? '1px solid var(--gold)' : (user.is_blocked ? '1px solid var(--error)' : '1px solid #222'),
            background: isAdmin ? 'rgba(234, 179, 8, 0.05)' : (user.is_blocked ? 'rgba(255, 68, 68, 0.05)' : 'rgba(255,255,255,0.01)'),
            opacity: user.is_blocked ? 0.7 : 1
        }}>
            <div>
                <div className="flex-center" style={{ gap: '8px', justifyContent: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '950', letterSpacing: '1px', color: isAdmin ? 'var(--gold)' : (user.is_blocked ? 'var(--error)' : '#fff') }}>
                        {user.name.toUpperCase()}
                    </h4>
                    {isAdmin && <ShieldAlert size={12} color="var(--gold)" />}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '4px' }}>
                    <p style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '900', letterSpacing: '1px' }}>{user.coins.toLocaleString()} FLOW</p>
                    <span style={{ fontSize: '0.6rem', color: 'var(--emerald)', fontWeight: '900' }}>
                        ₹{(user.coins / 10).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {user.is_premium && (
                        <span style={{ fontSize: '0.5rem', background: 'var(--gold)', color: '#000', padding: '2px 6px', fontWeight: '950', marginLeft: '8px', borderRadius: '2px' }}>PREMIUM</span>
                    )}
                    {user.is_blocked && (
                        <span style={{ fontSize: '0.5rem', background: 'var(--error)', color: '#fff', padding: '2px 6px', fontWeight: '950', marginLeft: '8px', borderRadius: '2px' }}>BLOCKED</span>
                    )}
                </div>
            </div>
            <div className="flex-center" style={{ gap: '16px' }}>
                {!isAdmin ? (
                    <button
                        onClick={() => onEdit(user)}
                        style={{ background: '#fff', border: 'none', color: '#000', padding: '10px 24px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '1px' }}
                    >
                        EDIT
                    </button>
                ) : (
                    <div className="flex-center" style={{ gap: '8px', opacity: 0.5 }}>
                        <span style={{ fontSize: '0.55rem', fontWeight: '950', color: 'var(--gold)', letterSpacing: '2px' }}>IMMUNE NODE</span>
                        <ShieldAlert size={16} color="var(--gold)" />
                    </div>
                )}
            </div>
        </div>
    );
}

function UserEditModal({ user, onClose, onSave, onDelete, isSaving }: { user: any, onClose: () => void, onSave: (u: any) => void, onDelete: () => void, isSaving: boolean }) {
    const [formData, setFormData] = useState({
        name: user.name,
        coins: user.coins,
        is_premium: user.is_premium || false,
        is_blocked: user.is_blocked || false
    });

    return (
        <div className="modal-overlay flex-center" style={{ zIndex: 1000 }}>
            <div className="glass-panel animate-scale-up" style={{ width: '90%', maxWidth: '420px', padding: '32px', border: '1px solid #333', background: '#000', borderRadius: '16px' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '950', letterSpacing: '4px' }}>EDIT IDENTITY</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)' }}>
                        <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>DISPLAY NAME</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontWeight: '700' }}
                        />
                    </div>

                    {/* Coins */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>COIN BALANCE (FLOW)</label>
                        <input
                            type="number"
                            value={formData.coins}
                            onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontWeight: '700' }}
                        />
                    </div>

                    {/* Toggles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <button
                            onClick={() => setFormData({ ...formData, is_premium: !formData.is_premium })}
                            className="glass-panel flex-center"
                            style={{ padding: '20px', border: formData.is_premium ? '1px solid var(--gold)' : '1px solid #222', background: formData.is_premium ? 'rgba(234, 179, 8, 0.1)' : 'transparent', borderRadius: '8px', transition: '0.3s' }}
                        >
                            <span style={{ fontSize: '0.7rem', fontWeight: '950', color: formData.is_premium ? 'var(--gold)' : 'var(--text-dim)' }}>PREMIUM</span>
                        </button>
                        <button
                            onClick={() => setFormData({ ...formData, is_blocked: !formData.is_blocked })}
                            className="glass-panel flex-center"
                            style={{ padding: '20px', border: formData.is_blocked ? '1px solid var(--error)' : '1px solid #222', background: formData.is_blocked ? 'rgba(255, 68, 68, 0.1)' : 'transparent', borderRadius: '8px', transition: '0.3s' }}
                        >
                            <span style={{ fontSize: '0.7rem', fontWeight: '950', color: formData.is_blocked ? 'var(--error)' : 'var(--text-dim)' }}>BLOCKED</span>
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid #111', paddingTop: '40px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            disabled={isSaving}
                            onClick={() => onSave(formData)}
                            className="btn"
                            style={{ width: '100%', padding: '20px', background: '#fff', color: '#000', borderRadius: '8px', fontWeight: '950', letterSpacing: '2px' }}
                        >
                            {isSaving ? 'SYNCHRONIZING...' : 'SAVE CHANGES'}
                        </button>

                        <button
                            disabled={isSaving}
                            onClick={onDelete}
                            className="btn"
                            style={{ width: '100%', padding: '20px', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '8px', fontWeight: '950', letterSpacing: '2px' }}
                        >
                            DELETE USER IDENTITY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
