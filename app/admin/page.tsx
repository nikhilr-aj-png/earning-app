"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Users, Settings, Database, ChevronLeft, ShieldAlert, BarChart3, Plus, Trash2, Activity, Zap, TrendingUp, Gamepad2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

function AdminPage() {
    const { user, loading, refreshUser } = useUser();
    const [view, setView] = useState<'stats' | 'users' | 'tasks' | 'casino'>('stats');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userFilter, setUserFilter] = useState<'all' | 'free' | 'premium' | 'admin'>('all');
    const [editingTask, setEditingTask] = useState<any>(null);
    const [taskSearch, setTaskSearch] = useState('');
    const [taskAudienceFilter, setTaskAudienceFilter] = useState<'all' | 'free' | 'premium'>('all');
    const [autoConfig, setAutoConfig] = useState({ count: 5, free_questions: 2, premium_questions: 4, free_reward: 50, premium_reward: 150, exp_h: '11', exp_m: '59', exp_p: 'PM' });
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user) refreshUser();
    }, [user, refreshUser]);

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
        enabled: !!user && (view === 'users' || userFilter !== 'all'),
    });

    const { data: adminTasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['admin-tasks'],
        queryFn: async () => {
            const res = await fetch('/api/admin/tasks', { headers: { 'x-user-id': user?.id || '' } });
            const data = await res.json();
            return data;
        },
        enabled: !!user && view === 'tasks',
    });


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
        onSuccess: (data: any) => {
            alert(data.message.toUpperCase());
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        },
        onError: (err: any) => {
            alert(`FATAL ERROR: ${err.message.toUpperCase()}`);
        }
    });


    const generateMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/admin/tasks/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(autoConfig)
            });
            return res.json();
        },
        onSuccess: (data) => {
            if (data.error) {
                alert(`SYNCHRONIZATION FAILED: ${data.error}`);
            } else {
                alert("AI MISSIONS GENERATED SUCCESSFULLY");
                queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
            }
        },
        onError: (error: any) => {
            alert(`CRITICAL ERROR: ${error.message}`);
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/admin/tasks?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user?.id || '' }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: async (task: any) => {
            const h = parseInt(task.exp_h);
            const m = task.exp_m;
            const p = task.exp_p;
            let hour24 = h;
            if (p === 'PM' && h < 12) hour24 += 12;
            if (p === 'AM' && h === 12) hour24 = 0;
            const expiry_time = `${hour24.toString().padStart(2, '0')}:${m}`;

            const res = await fetch('/api/admin/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ ...task, expiry_time })
            });
            return res.json();
        },
        onSuccess: () => {
            alert("PROTOCOL UPDATED");
            setEditingTask(null);
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
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
                            ADMIN: {user?.name?.toUpperCase()}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #222' }}>
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
                                    </div>
                                </div>
                            )}

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
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>NO OPERATORS LOCATED.</p>
                    )}
                </div>
            )}

            {view === 'tasks' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div className="flex-between" style={{ marginBottom: '32px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '4px', color: '#fff' }}>MISSION DEPLOYMENT</h2>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '4px' }}>AI-DRIVEN OPERATIONAL CORE</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '100px', border: '1px solid #222' }}>
                            <Activity size={12} color="var(--primary)" />
                            <span style={{ fontSize: '0.55rem', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '1px' }}>AI ENGINE ONLINE</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass-panel" style={{ padding: '40px', border: '1px solid #222', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)' }}>
                            <div className="flex-between" style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                                        <Zap size={24} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '0.8rem', fontWeight: '950', letterSpacing: '2px', color: '#fff' }}>DEPLOYMENT CONFIGURATOR</h3>
                                        <p style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>GLOBAL TASK ALLOCATION PARAMETERS</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '2px' }}>MISSION VOLUME</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                value={autoConfig.count}
                                                onChange={(e) => setAutoConfig({ ...autoConfig, count: parseInt(e.target.value) || 0 })}
                                                style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '18px 24px', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', fontWeight: '950' }}
                                            />
                                            <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900' }}>TOTAL NODES</span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <label style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '2px' }}>EXPIRY PROTOCOL (24H SYNC)</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                            <select
                                                value={autoConfig.exp_h}
                                                onChange={(e) => setAutoConfig({ ...autoConfig, exp_h: e.target.value })}
                                                style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', textAlign: 'center' }}
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>{i + 1}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={autoConfig.exp_m}
                                                onChange={(e) => setAutoConfig({ ...autoConfig, exp_m: e.target.value })}
                                                style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem' }}
                                            >
                                                {[...Array(60)].map((_, i) => (
                                                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                                ))}
                                            </select>
                                            <select
                                                value={autoConfig.exp_p}
                                                onChange={(e) => setAutoConfig({ ...autoConfig, exp_p: e.target.value })}
                                                style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem' }}
                                            >
                                                <option value="AM">AM</option>
                                                <option value="PM">PM</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sapphire)' }} />
                                            <p style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--sapphire)', letterSpacing: '2px' }}>FREE TIER PROTOCOL</p>
                                        </div>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '800' }}>QUESTION DENSITY</label>
                                                <input
                                                    type="number"
                                                    value={autoConfig.free_questions}
                                                    onChange={(e) => setAutoConfig({ ...autoConfig, free_questions: parseInt(e.target.value) || 0 })}
                                                    style={{ background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '800' }}>TARGET YIELD (FLOW)</label>
                                                <input
                                                    type="number"
                                                    value={autoConfig.free_reward}
                                                    onChange={(e) => setAutoConfig({ ...autoConfig, free_reward: parseInt(e.target.value) || 0 })}
                                                    style={{ background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="glass-panel" style={{ padding: '24px', background: 'rgba(234, 179, 8, 0.02)', border: '1px solid rgba(234, 179, 8, 0.1)', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
                                            <p style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--gold)', letterSpacing: '2px' }}>PREMIUM TIER PROTOCOL</p>
                                        </div>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '800' }}>QUESTION DENSITY</label>
                                                <input
                                                    type="number"
                                                    value={autoConfig.premium_questions}
                                                    onChange={(e) => setAutoConfig({ ...autoConfig, premium_questions: parseInt(e.target.value) || 0 })}
                                                    style={{ background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <label style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '800' }}>TARGET YIELD (FLOW)</label>
                                                <input
                                                    type="number"
                                                    value={autoConfig.premium_reward}
                                                    onChange={(e) => setAutoConfig({ ...autoConfig, premium_reward: parseInt(e.target.value) || 0 })}
                                                    style={{ background: '#000', border: '1px solid #222', padding: '14px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (window.confirm("EXECUTE BATCH DEPLOYMENT? THIS WILL SYNC GLOBAL MISSION STATE."))
                                            generateMutation.mutate();
                                    }}
                                    disabled={generateMutation.isPending}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        background: '#fff',
                                        color: '#000',
                                        border: 'none',
                                        padding: '24px',
                                        fontSize: '0.9rem',
                                        borderRadius: '16px',
                                        fontWeight: '950',
                                        letterSpacing: '4px',
                                        boxShadow: '0 0 40px rgba(255,255,255,0.1)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <TrendingUp size={20} />
                                    {generateMutation.isPending ? 'SYNCHRONIZING GLOBAL STATE...' : 'EXECUTE AI DEPLOYMENT'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '4px', color: '#fff' }}>MISSION LEDGER</h2>
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '4px' }}>OPERATIONAL TASK REPOSITORY</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input
                                    placeholder="SEARCH MISSIONS..."
                                    value={taskSearch}
                                    onChange={(e) => setTaskSearch(e.target.value)}
                                    style={{ background: '#000', border: '1px solid #222', padding: '12px 24px', borderRadius: '8px', color: '#fff', fontSize: '0.7rem', width: '250px' }}
                                />
                                <select
                                    value={taskAudienceFilter}
                                    onChange={(e: any) => setTaskAudienceFilter(e.target.value)}
                                    style={{ background: '#000', border: '1px solid #222', padding: '12px 24px', borderRadius: '8px', color: '#fff', fontSize: '0.7rem' }}
                                >
                                    <option value="all">ALL TARGETS</option>
                                    <option value="free">FREE ONLY</option>
                                    <option value="premium">PREMIUM ONLY</option>
                                </select>
                                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-tasks'] })} className="btn-stat" style={{ padding: '8px 16px', borderRadius: '8px' }}>
                                    <Activity size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex" style={{ flexDirection: 'column', gap: '16px' }}>
                            {adminTasks
                                .filter((t: any) => {
                                    const matchesSearch = t.title.toLowerCase().includes(taskSearch.toLowerCase());
                                    const matchesAudience = taskAudienceFilter === 'all' || t.target_audience === taskAudienceFilter;
                                    return matchesSearch && matchesAudience;
                                })
                                .map((t: any) => {
                                    const isExpired = new Date(t.expires_at) < new Date();
                                    return (
                                        <div key={t.id} className="glass-panel flex-between" style={{ padding: '24px', border: '1px solid #111', borderRadius: '12px', background: isExpired ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255,255,255,0.01)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    <Zap size={20} color={t.id.startsWith('ai_') ? 'var(--primary)' : 'var(--text-dim)'} />
                                                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: t.target_audience === 'premium' ? 'var(--gold)' : 'var(--sapphire)', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #000' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '950', color: '#fff' }}>{t.title.toUpperCase()}</h4>
                                                        <span style={{ fontSize: '0.5rem', fontWeight: '950', background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isExpired ? 'var(--error)' : 'var(--emerald)', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                                                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                                                        <p style={{ fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: '950' }}>{t.reward} FLOW</p>
                                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>•</span>
                                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800' }}>{t.completion_count || 0} CLAIMS</p>
                                                        <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>•</span>
                                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800' }}>EXP: {new Date(t.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button
                                                    onClick={() => {
                                                        const d = new Date(t.expires_at);
                                                        let h = d.getHours();
                                                        const m = d.getMinutes().toString().padStart(2, '0');
                                                        const p = h >= 12 ? 'PM' : 'AM';
                                                        if (h > 12) h -= 12;
                                                        if (h === 0) h = 12;
                                                        setEditingTask({ ...t, exp_h: h.toString().padStart(2, '0'), exp_m: m, exp_p: p });
                                                    }}
                                                    className="btn-stat"
                                                    style={{ padding: '10px' }}
                                                >
                                                    <Settings size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { if (window.confirm("PURGE MISSION PROTOCOL?")) deleteTaskMutation.mutate(t.id); }}
                                                    className="btn-stat"
                                                    style={{ padding: '10px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleEditSave}
                    onDelete={handleEditDelete}
                    isSaving={userEditMutation.isPending}
                />
            )}

            {view === 'casino' && (
                <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', border: '1px solid #fff', borderRadius: '4px' }}>
                    <Activity size={32} color="#fff" strokeWidth={1} style={{ marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#fff', marginBottom: '24px', letterSpacing: '4px' }}>ARENA LOAD MONITOR</h3>
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
                    <div>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>DISPLAY NAME</label>
                        <input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="glass-panel"
                            style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontWeight: '700' }}
                        />
                    </div>

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
            {editingTask && (
                <TaskEditModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={(t) => updateTaskMutation.mutate(t)}
                    isSaving={updateTaskMutation.isPending}
                />
            )}
        </div>
    );
}

function TaskEditModal({ task, onClose, onSave, isSaving }: { task: any, onClose: () => void, onSave: (t: any) => void, isSaving: boolean }) {
    const [t, setT] = useState(task);

    return (
        <div className="modal-overlay flex-center" style={{ zIndex: 3000 }}>
            <div className="glass-panel animate-scale-up" style={{ width: '95%', maxWidth: '600px', padding: '32px', border: '1px solid #333', background: '#000', borderRadius: '24px' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: '950', letterSpacing: '4px', color: '#fff' }}>EDIT MISSION PROTOCOL</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)' }}>X</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>MISSION TITLE</label>
                        <input
                            value={t.title}
                            onChange={(e) => setT({ ...t, title: e.target.value })}
                            style={{ background: '#111', border: '1px solid #222', padding: '16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>REWARD (FLOW)</label>
                            <input
                                type="number"
                                value={t.reward}
                                onChange={(e) => setT({ ...t, reward: parseInt(e.target.value) || 0 })}
                                style={{ background: '#111', border: '1px solid #222', padding: '16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>TARGET AUDIENCE</label>
                            <select
                                value={t.target_audience}
                                onChange={(e) => setT({ ...t, target_audience: e.target.value })}
                                style={{ background: '#111', border: '1px solid #222', padding: '16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                            >
                                <option value="free">FREE (EVERYONE)</option>
                                <option value="premium">PREMIUM ONLY</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>EXPIRY PROTOCOL (AM/PM)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            <select value={t.exp_h} onChange={(e) => setT({ ...t, exp_h: e.target.value })} style={{ background: '#111', border: '1px solid #222', padding: '12px', borderRadius: '8px', color: '#fff' }}>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>{i + 1}</option>
                                ))}
                            </select>
                            <select value={t.exp_m} onChange={(e) => setT({ ...t, exp_m: e.target.value })} style={{ background: '#111', border: '1px solid #222', padding: '12px', borderRadius: '8px', color: '#fff' }}>
                                {[...Array(60)].map((_, i) => (
                                    <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                            <select value={t.exp_p} onChange={(e) => setT({ ...t, exp_p: e.target.value })} style={{ background: '#111', border: '1px solid #222', padding: '12px', borderRadius: '8px', color: '#fff' }}>
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #222', paddingTop: '16px' }}>
                        <h4 style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '12px' }}>QUIZ QUESTIONS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {t.questions?.map((q: any, qIdx: number) => (
                                <div key={qIdx} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px' }}>
                                    <input
                                        value={q.question}
                                        onChange={(e) => {
                                            const qs = [...t.questions];
                                            qs[qIdx].question = e.target.value;
                                            setT({ ...t, questions: qs });
                                        }}
                                        style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '0.75rem', marginBottom: '8px' }}
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                        {q.options.map((opt: string, oIdx: number) => (
                                            <input
                                                key={oIdx}
                                                value={opt}
                                                onChange={(e) => {
                                                    const qs = [...t.questions];
                                                    qs[qIdx].options[oIdx] = e.target.value;
                                                    setT({ ...t, questions: qs });
                                                }}
                                                style={{ background: q.answer === oIdx ? 'rgba(16, 185, 129, 0.1)' : '#000', border: '1px solid #222', padding: '6px', borderRadius: '4px', fontSize: '0.65rem', color: '#fff' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onSave(t)}
                    disabled={isSaving}
                    className="btn"
                    style={{ width: '100%', padding: '16px', background: '#fff', color: '#000', borderRadius: '12px', marginTop: '24px', fontWeight: '950' }}
                >
                    {isSaving ? 'SYNCHRONIZING...' : 'SAVE CHANGES'}
                </button>
            </div>
        </div>
    );
}

export default AdminPage;
