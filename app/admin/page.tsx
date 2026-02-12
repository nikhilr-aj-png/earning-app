"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import {
    Users,
    Settings,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    Coins,
    Zap,
    Edit2,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle,
    CheckCircle2,
    Database,
    ArrowUpRight,
    Gamepad2,
    ChevronLeft,
    ShieldAlert,
    BarChart3,
    Plus,
    Activity,
    TrendingUp,
    ShieldCheck,
    X
} from 'lucide-react';
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

function AdminPage() {
    const { user, loading, refreshUser } = useUser();
    const { showToast } = useToast();
    const [view, setView] = useState<'stats' | 'users' | 'tasks' | 'automation' | 'withdrawals' | 'upi_requests' | 'gaming' | 'systems'>('stats');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userFilter, setUserFilter] = useState<'all' | 'free' | 'premium' | 'admin'>('all');
    const [editingTask, setEditingTask] = useState<any>(null);
    const [taskSearch, setTaskSearch] = useState('');
    const [taskAudienceFilter, setTaskAudienceFilter] = useState<'all' | 'free' | 'premium'>('all');
    const [automationSettings, setAutomationSettings] = useState<any>(null);
    const [countdown, setCountdown] = useState(60);
    const [retryCooldown, setRetryCooldown] = useState(0);
    const [isPruning, setIsPruning] = useState(false);
    const [isPruningPredictions, setIsPruningPredictions] = useState(false);
    const [isPruningTransactions, setIsPruningTransactions] = useState(false);
    const [isPruningActivities, setIsPruningActivities] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (user) refreshUser();
    }, [user, refreshUser]);

    // AUTO-LOOP DRIVER: Keep the game alive even if only Admin is open
    useQuery({
        queryKey: ['admin-game-loop'],
        queryFn: async () => {
            const res = await fetch('/api/game/loop');
            return res.json();
        },
        refetchInterval: 10000, // Poll every 10s
        refetchOnWindowFocus: true
    });

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
        enabled: !!user,
    });

    const { data: adminSettings, isLoading: settingsLoading } = useQuery({
        queryKey: ['admin-automation'],
        queryFn: async () => {
            const res = await fetch('/api/admin/automation/config', { headers: { 'x-user-id': user?.id || '' } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
            return data;
        },
        enabled: !!user,
    });

    const { data: financialData, isLoading: financialsLoading, isError: financialsError, error: financialRespError } = useQuery({
        queryKey: ['admin-financials'],
        queryFn: async () => {
            const res = await fetch('/api/admin/financials', { headers: { 'x-user-id': user?.id || '' } });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch financials');
            return data;
        },
        enabled: !!user && (view === 'withdrawals' || view === 'upi_requests'),
    });

    const processWithdrawalMutation = useMutation({
        mutationFn: async ({ transactionId, action, rejectionReason }: { transactionId: string, action: 'approve' | 'reject', rejectionReason?: string }) => {
            const res = await fetch('/api/admin/withdrawals/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ transactionId, action, rejectionReason })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Processing failed');
            return data;
        },
        onSuccess: (data) => {
            alert(data.message.toUpperCase());
            queryClient.invalidateQueries({ queryKey: ['admin-financials'] });
        },
        onError: (err: any) => {
            alert("ACTION FAILED: " + err.message);
        }
    });


    const processUpiMutation = useMutation({
        mutationFn: async ({ targetUserId, action }: { targetUserId: string, action: 'approve' | 'reject' }) => {
            const res = await fetch('/api/admin/upi/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ targetUserId, action })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Processing failed');
            return data;
        },
        onSuccess: (data) => {
            alert(data.message.toUpperCase());
            queryClient.invalidateQueries({ queryKey: ['admin-financials'] });
        },
        onError: (err: any) => {
            alert("UPI ACTION FAILED: " + err.message);
        }
    });

    // SYSTEM SETTINGS
    const { data: systemSettings, isLoading: systemSettingsLoading } = useQuery({
        queryKey: ['admin-system-settings'],
        queryFn: async () => {
            const res = await fetch('/api/system/config'); // Use public endpoint for reading, it's fine
            return res.json();
        },
        enabled: !!user
    });

    const updateSystemSettingsMutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await fetch('/api/admin/system/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(updates)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Update failed');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-system-settings'] });
            alert("SYSTEM SETTINGS UPDATED");
        },
        onError: (err: any) => alert("UPDATE FAILED: " + err.message)
    });

    // PERDICTION SYSTEM STATE
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [predictionForm, setPredictionForm] = useState({
        question: 'Which card winner?',
        option_1_label: 'KING',
        option_1_image: '/assets/king.png',
        option_2_label: 'QUEEN',
        option_2_image: '/assets/queen.png',
        min_bet: 10,
        target_audience: 'all',
        expiry_minutes: 5,
        resolution_method: 'auto',
        bet_mode: 'flexible',
        player_type: 'all',
        manual_winner: 'option_1'
    });

    const { data: predictionEvents } = useQuery({
        queryKey: ['admin-predictions'],
        queryFn: async () => {
            const res = await fetch('/api/admin/predictions/list');
            const data = await res.json();
            if (!Array.isArray(data)) {
                // Likely an error object if table missing
                console.error("Failed to load predictions:", data);
                return [];
            }
            return data;
        },
        enabled: view === 'gaming'
    });


    const createPredictionMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/admin/predictions/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Failed to create event');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-predictions'] });
            setShowPredictionModal(false);
            alert("CARD GAME EVENT CREATED");
        },
        onError: (err: any) => alert(`CREATION FAILED: ${err.message}`)
    });

    const resolvePredictionMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/admin/predictions/resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || 'Failed to resolve event');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-predictions'] });
            alert("EVENT RESOLVED");
        },
        onError: (err: any) => alert(`RESOLUTION FAILED: ${err.message}`)
    });


    // Sync query data to local state when query finishes
    useEffect(() => {
        if (adminSettings) {
            setAutomationSettings(adminSettings);
        }
    }, [adminSettings]);

    const updateAutomationMutation = useMutation({
        mutationFn: async (updates: any) => {
            const res = await fetch('/api/admin/automation/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify(updates)
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-automation'] });
        },
        onError: (err: any) => {
            alert("SAVE FAILED: " + err.message);
        }
    });

    const syncMutation = useMutation({
        mutationFn: async ({ isManual, silent }: { isManual: boolean, silent: boolean }) => {
            const res = await fetch('/api/admin/automation/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || ''
                },
                body: JSON.stringify({ isManual })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Sync service responded with error');
            return { ...data, silent };
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
                queryClient.invalidateQueries({ queryKey: ['admin-automation'] });
                if (data.trace) console.log("ENGINE_TRACE:", data.trace);
                if (!data.silent) {
                    let msg = data.generated > 0
                        ? `SUCCESS: AI ENGINE EXECUTED\nGenerated ${data.generated} new missions.`
                        : `SYNC COMPLETE: Density counts are within target margins.${data.trace ? `\n\nDETAILS:\n${data.trace.join('\n')}` : ''}`;

                    if (data.is_mock) {
                        msg += "\n\n⚠️ AI OFFLINE: Used pre-defined survival missions to maintain stability.";
                    }
                    alert(msg);
                }
            } else if (!data.silent) {
                alert("ENGINE STATUS: " + (data.message || "FINISHED BUT NO CHANGES MADE."));
            }
        },
        onError: (err: any, variables: any) => {
            if (!variables?.silent) {
                alert("SYNC FAILED: " + err.message);
                if (err.message.includes("429") || err.message.toLowerCase().includes("limit") || err.message.toLowerCase().includes("busy")) {
                    setRetryCooldown(60);
                }
            } else {
                console.log("Background sync skipped (likely rate limit or window). Core remains stable.");
            }
        }
    });

    useEffect(() => {
        if (!automationSettings?.is_enabled || (view !== 'tasks' && view !== 'automation')) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    syncMutation.mutate({ isManual: false, silent: true });
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [automationSettings?.is_enabled, view]);

    useEffect(() => {
        if (retryCooldown <= 0) return;
        const interval = setInterval(() => {
            setRetryCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [retryCooldown]);


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



    const deleteTaskMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/tasks?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-user-id': user?.id || '' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to terminate mission');
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
            alert("MISSION TERMINATED SUCCESSFULLY");
        },
        onError: (err: any) => {
            alert("TERMINATION FAILED: " + err.message);
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #222' }}>
                {['stats', 'users', 'tasks', 'automation', 'withdrawals', 'upi_requests', 'gaming', 'systems'].map((t) => (
                    <button
                        key={t} onClick={() => setView(t as any)}
                        style={{
                            padding: '14px 2px', borderRadius: '2px', border: 'none', fontSize: '0.45rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px',
                            background: view === t ? '#fff' : 'transparent',
                            color: view === t ? '#000' : 'var(--text-dim)',
                            transition: '0.3s'
                        }}
                    >
                        {t.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Views */}
            {view === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(59, 130, 246, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <Users size={20} color="var(--sapphire)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: '#fff', marginBottom: '8px' }}>{adminStats?.totalUsers || 0}</h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>OPERATIONAL IDENTITIES</p>
                                <span style={{ fontSize: '0.55rem', color: 'var(--emerald)', fontWeight: '900', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>+12% AVG</span>
                            </div>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'var(--sapphire)', filter: 'blur(60px)', opacity: 0.1 }} />
                        </div>

                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(16, 185, 129, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <Database size={20} color="var(--emerald)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: '#fff', marginBottom: '8px' }}>
                                {((adminStats?.totalCoinsDistributed || 0) / 10).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                            </h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>LIQUIDITY DISTRIBUTED (₹)</p>
                                <TrendingUp size={14} color="var(--emerald)" />
                            </div>
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '8px', opacity: 0.6 }}>BASE FLOW: {adminStats?.totalCoinsDistributed || 0}</p>
                            <div style={{ position: 'absolute', bottom: -20, right: -20, width: '100px', height: '100px', background: 'var(--emerald)', filter: 'blur(60px)', opacity: 0.1 }} />
                        </div>

                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(234, 179, 8, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <ShieldCheck size={20} color="var(--gold)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: '#fff', marginBottom: '8px' }}>
                                {adminTasks.length || 0}
                            </h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>ACTIVE AI DEPLOYMENTS</p>
                                <Zap size={14} color="var(--gold)" />
                            </div>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'var(--gold)', filter: 'blur(60px)', opacity: 0.1 }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #333', background: 'rgba(255, 68, 68, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <Clock size={20} color="var(--error)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: (adminStats?.pendingWithdrawals > 0) ? 'var(--error)' : '#fff', marginBottom: '8px' }}>
                                {adminStats?.pendingWithdrawals || 0}
                            </h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>WITHDRAW PENDING</p>
                                {adminStats?.pendingWithdrawals > 0 && <AlertCircle size={14} color="var(--error)" />}
                            </div>
                            <div style={{ position: 'absolute', top: -20, right: -20, width: '100px', height: '100px', background: 'var(--error)', filter: 'blur(60px)', opacity: 0.1 }} />
                        </div>

                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #333', background: 'rgba(59, 130, 246, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <Settings size={20} color="var(--sapphire)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: (adminStats?.pendingUpiChanges > 0) ? 'var(--sapphire)' : '#fff', marginBottom: '8px' }}>
                                {adminStats?.pendingUpiChanges || 0}
                            </h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>UPI CHANGE PENDING</p>
                                {adminStats?.pendingUpiChanges > 0 && <Activity size={14} color="var(--sapphire)" />}
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '32px', border: '1px solid #333', background: 'rgba(16, 185, 129, 0.05)', position: 'relative', overflow: 'hidden' }}>
                            <Zap size={20} color="var(--emerald)" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px', color: '#fff', marginBottom: '8px' }}>
                                {adminStats?.activeDaily || 0}
                            </h2>
                            <div className="flex-between">
                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '4px' }}>ACTIVE USER (24H)</p>
                                <Users size={14} color="var(--emerald)" />
                            </div>
                            <div style={{ position: 'absolute', bottom: -20, right: -20, width: '100px', height: '100px', background: 'var(--emerald)', filter: 'blur(60px)', opacity: 0.1 }} />
                        </div>
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
                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '4px' }}>MANUAL TASK OVERRIDE</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '100px', border: '1px solid #222' }}>
                            <Database size={12} color="var(--primary)" />
                            <span style={{ fontSize: '0.55rem', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '1px' }}>DATABASE STABLE</span>
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
                                const expAt = t.expires_at ? new Date(t.expires_at) : null;
                                const isExpired = expAt ? expAt < new Date() : false;
                                return (
                                    <div key={t.id} className="glass-panel flex-between" style={{ padding: '24px', border: '1px solid #111', borderRadius: '12px', background: isExpired ? 'rgba(239, 68, 68, 0.02)' : 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                <Zap size={20} color={t.id.startsWith('ai_') ? 'var(--primary)' : 'var(--text-dim)'} />
                                                <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: t.target_audience === 'premium' ? 'var(--gold)' : 'var(--sapphire)', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #000' }} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ fontSize: '0.5rem', fontWeight: '950', background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isExpired ? 'var(--error)' : 'var(--emerald)', padding: '2px 8px', borderRadius: '100px', border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                                                        {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
                                                    <p style={{ fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: '950' }}>{t.reward} FLOW</p>
                                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>•</span>
                                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800' }}>{t.completion_count || 0} CLAIMS</p>
                                                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>•</span>
                                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800' }}>
                                                        EXP: {t.expires_at ? new Date(t.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => {
                                                    const expAtVal = t.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                                                    const d = new Date(expAtVal);
                                                    let h = d.getHours();
                                                    const m = (d.getMinutes() || 0).toString().padStart(2, '0');
                                                    const p = h >= 12 ? 'PM' : 'AM';
                                                    if (h > 12) h -= 12;
                                                    if (h === 0) h = 12;
                                                    setEditingTask({
                                                        ...t,
                                                        exp_h: h.toString().padStart(2, '0'),
                                                        exp_m: m,
                                                        exp_p: p
                                                    });
                                                }}
                                                className="btn-stat"
                                                style={{
                                                    padding: '10px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid #333'
                                                }}
                                                title="Edit Mission"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => { if (window.confirm("PURGE MISSION PROTOCOL?")) deleteTaskMutation.mutate(t.id); }}
                                                className="btn-stat"
                                                style={{
                                                    padding: '10px',
                                                    color: '#ff4444',
                                                    background: 'rgba(255, 68, 68, 0.1)',
                                                    border: '1px solid rgba(255, 68, 68, 0.3)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title="Delete Mission"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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

            {editingTask && (
                <TaskEditModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onSave={(t) => updateTaskMutation.mutate(t)}
                    isSaving={updateTaskMutation.isPending}
                />
            )}

            {
                view === 'automation' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '6px', color: '#fff' }}>AUTOMATION HUB</h2>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px', fontWeight: '800', letterSpacing: '2px' }}>AI MISSION LIFECYCLE CONTROLLER</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 46, 22, 0.1)', padding: '12px 24px', borderRadius: '100px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse-glow 2s infinite' }} />
                                <span style={{ fontSize: '0.6rem', fontWeight: '950', color: '#fff', letterSpacing: '2px' }}>SYSTEM: OPERATIONAL</span>
                            </div>
                        </div>

                        <div className="glass-panel" style={{
                            padding: '48px',
                            border: '1px solid #222',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 100%)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Diagnostics Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid #111' }}>
                                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222' }}>
                                    <p style={{ fontSize: '0.45rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>MISSION DENSITY (QUIZZES)</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '950', color: '#fff' }}>
                                                {adminTasks?.filter((t: any) => t.type === 'quiz' && t.target_audience === 'free' && (!t.expires_at || new Date(t.expires_at) > new Date())).length || 0}
                                            </span>
                                            <span style={{ fontSize: '0.55rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '1px' }}>/ {automationSettings?.free_task_count || 0} FREE</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--gold)' }}>
                                                {adminTasks?.filter((t: any) => t.type === 'quiz' && t.target_audience === 'premium' && (!t.expires_at || new Date(t.expires_at) > new Date())).length || 0}
                                            </span>
                                            <span style={{ fontSize: '0.55rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '1px' }}>/ {automationSettings?.premium_task_count || 0} PREMIUM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222' }}>
                                    <p style={{ fontSize: '0.45rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>SYNC PULSE</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Activity size={14} color="var(--emerald)" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '950', color: '#fff' }}>{countdown}s</span>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222' }}>
                                    <p style={{ fontSize: '0.45rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>SECURITY LAYER</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShieldCheck size={14} color="var(--primary)" />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '950', color: '#fff' }}>RLS ACTIVE</span>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid #222' }}>
                                    <p style={{ fontSize: '0.45rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>LAST CYCLE</p>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '950', color: '#fff' }}>
                                        {automationSettings?.last_sync ? new Date(automationSettings.last_sync).toLocaleTimeString() : 'NEVER'}
                                    </span>
                                </div>
                            </div>

                            {/* Manual Control Status */}
                            <div className="flex-between" style={{ marginBottom: '40px' }}>
                                <div className="flex-center" style={{ gap: '12px', background: 'rgba(59, 130, 246, 0.05)', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    <Activity size={16} color="var(--primary)" />
                                    <span style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--primary)', letterSpacing: '2px' }}>MANUAL MISSION CONTROL ACTIVE</span>
                                </div>

                                <div className="flex-center" style={{ gap: '12px', background: 'rgba(255, 255, 255, 0.05)', padding: '12px 24px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px' }}>BACKGROUND SYNC: MONITOR ONLY</span>
                                </div>
                            </div>

                            {automationSettings ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                                        {/* Retention Policy */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                                                <Zap size={20} color="var(--primary)" />
                                                <h3 style={{ fontSize: '0.75rem', fontWeight: '950', letterSpacing: '3px', color: '#fff' }}>RETENTION POLICY</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333' }}>
                                                    <p style={{ fontSize: '0.55rem', fontWeight: '950', color: 'var(--sapphire)', marginBottom: '16px', letterSpacing: '2px' }}>FREE TARGET</p>
                                                    <input
                                                        type="number"
                                                        value={automationSettings.free_task_count}
                                                        onChange={(e) => setAutomationSettings({ ...automationSettings, free_task_count: parseInt(e.target.value) || 0 })}
                                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', fontWeight: '950', outline: 'none' }}
                                                    />
                                                </div>
                                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333' }}>
                                                    <p style={{ fontSize: '0.55rem', fontWeight: '950', color: 'var(--gold)', marginBottom: '16px', letterSpacing: '2px' }}>PREMIUM TARGET</p>
                                                    <input
                                                        type="number"
                                                        value={automationSettings.premium_task_count}
                                                        onChange={(e) => setAutomationSettings({ ...automationSettings, premium_task_count: parseInt(e.target.value) || 0 })}
                                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '2rem', fontWeight: '950', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Synchronization Lifecycle */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                                                <Clock size={20} color="var(--primary)" />
                                                <h3 style={{ fontSize: '0.75rem', fontWeight: '950', letterSpacing: '3px', color: '#fff' }}>MISSION LIFETIME</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '950' }}>EXPIRE AFTER</span>
                                                    <select
                                                        value={automationSettings.exp_h}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setAutomationSettings({ ...automationSettings, exp_h: val });
                                                            updateAutomationMutation.mutate({ exp_h: val });
                                                        }}
                                                        style={{ width: '100%', background: '#000', border: '1px solid #333', padding: '16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: '900' }}
                                                    >
                                                        <option value="1">1 MINUTE (TESTING)</option>
                                                        <option value="5">5 MINUTES</option>
                                                        <option value="15">15 MINUTES</option>
                                                        <option value="30">30 MINUTES</option>
                                                        <option value="60">1 HOUR</option>
                                                        <option value="360">6 HOURS</option>
                                                        <option value="720">12 HOURS</option>
                                                        <option value="1440">24 HOURS (STABLE)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reward Protocols */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div className="flex-center" style={{ gap: '12px', justifyContent: 'flex-start' }}>
                                            <TrendingUp size={20} color="var(--primary)" />
                                            <h3 style={{ fontSize: '0.75rem', fontWeight: '950', letterSpacing: '3px', color: '#fff' }}>REWARD PROTOCOLS</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                                            <div className="glass-panel" style={{ padding: '32px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                <div className="flex-between" style={{ marginBottom: '24px' }}>
                                                    <p style={{ fontSize: '0.6rem', fontWeight: '950', color: 'var(--sapphire)', letterSpacing: '2px' }}>FREE TIER FLOW</p>
                                                    <Zap size={16} color="var(--sapphire)" />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="number"
                                                        value={automationSettings.free_reward}
                                                        onChange={(e) => setAutomationSettings({ ...automationSettings, free_reward: parseInt(e.target.value) || 0 })}
                                                        onBlur={() => updateAutomationMutation.mutate({ free_reward: automationSettings.free_reward })}
                                                        style={{ width: '100%', background: '#000', border: '1px solid #222', padding: '20px', borderRadius: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', textAlign: 'right', paddingRight: '80px' }}
                                                    />
                                                    <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: '950', color: 'var(--text-dim)' }}>FLOW</span>
                                                </div>
                                            </div>

                                            <div className="glass-panel" style={{ padding: '32px', background: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.1)' }}>
                                                <div className="flex-between" style={{ marginBottom: '24px' }}>
                                                    <p style={{ fontSize: '0.6rem', fontWeight: '950', color: 'var(--gold)', letterSpacing: '2px' }}>PREMIUM TIER FLOW</p>
                                                    <Zap size={16} color="var(--gold)" />
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="number"
                                                        value={automationSettings.premium_reward}
                                                        onChange={(e) => setAutomationSettings({ ...automationSettings, premium_reward: parseInt(e.target.value) || 0 })}
                                                        style={{ width: '100%', background: '#000', border: '1px solid #222', padding: '20px', borderRadius: '12px', color: '#fff', fontSize: '1.5rem', fontWeight: '950', textAlign: 'right', paddingRight: '80px' }}
                                                    />
                                                    <span style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: '950', color: 'var(--text-dim)' }}>FLOW</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '32px', borderTop: '1px solid #222' }}>
                                        <button
                                            onClick={() => updateAutomationMutation.mutate(automationSettings)}
                                            disabled={updateAutomationMutation.isPending}
                                            style={{
                                                background: 'var(--primary)',
                                                color: '#fff',
                                                border: 'none',
                                                padding: '24px',
                                                fontSize: '0.85rem',
                                                borderRadius: '12px',
                                                fontWeight: '950',
                                                letterSpacing: '4px',
                                                cursor: 'pointer',
                                                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.2)'
                                            }}
                                        >
                                            {updateAutomationMutation.isPending ? 'SAVING DATA...' : 'SAVE CONFIGURATION'}
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (window.confirm("EXECUTE AI MISSION ENGINE?\nThis will PURGE ALL EXISTING QUIZZES and create a fresh batch based on your targets."))
                                                    syncMutation.mutate({ isManual: true, silent: false });
                                            }}
                                            disabled={syncMutation.isPending || retryCooldown > 0}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid #333',
                                                color: syncMutation.isPending ? 'var(--text-dim)' : '#fff',
                                                padding: '24px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '950',
                                                letterSpacing: '4px',
                                                cursor: syncMutation.isPending || retryCooldown > 0 ? 'not-allowed' : 'pointer',
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '16px'
                                            }}
                                        >
                                            <Gamepad2 size={24} />
                                            {syncMutation.isPending ? 'SYNCHRONIZING CORE...' : (retryCooldown > 0 ? `COOLDOWN (${retryCooldown}s)` : 'FRESH START (RESET)')}
                                        </button>
                                    </div>
                                </div>
                            ) : settingsLoading ? (
                                <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '20px' }}>
                                    <div className="spinner" />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>INITIALIZING CORE SYSTEMS...</p>
                                </div>
                            ) : (
                                <div className="flex-center" style={{ minHeight: '400px', flexDirection: 'column', gap: '20px' }}>
                                    <AlertCircle size={48} color="var(--error)" />
                                    <p style={{ fontSize: '0.7rem', color: 'var(--error)', fontWeight: '900', letterSpacing: '2px' }}>CRITICAL: CONFIGURATION OFFLINE</p>
                                    <button onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-automation'] })} style={{ background: 'transparent', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '4px', fontSize: '0.6rem' }}>RE-ESTABLISH CONNECTION</button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }



            {view === 'gaming' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="glass-panel" style={{ padding: '32px 40px', border: '1px solid #333', background: 'rgba(255,255,255,0.01)', borderRadius: '12px' }}>
                        <div className="flex-between" style={{ marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', letterSpacing: '4px' }}>GAMING HUB</h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '8px', letterSpacing: '1px' }}>PREDICTION EVENT COMMAND CENTER</p>
                            </div>
                        </div>

                        <div className="animate-fade-in">
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#fff', letterSpacing: '2px' }}>LIVE PREDICTION EVENTS</h2>
                                <button
                                    onClick={() => setShowPredictionModal(true)}
                                    className="btn"
                                    style={{
                                        height: '40px', padding: '0 20px', borderRadius: '10px',
                                        background: 'transparent', border: '1px solid var(--gold)',
                                        color: 'var(--gold)', fontSize: '0.75rem', fontWeight: '950'
                                    }}
                                >
                                    + CREATE CARD GAME
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                                {predictionEvents?.map((event: any) => (
                                    <div key={event.id} className="glass-panel" style={{ padding: '24px', border: '1px solid #333' }}>
                                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                                            <span style={{ fontSize: '0.6rem', padding: '4px 8px', borderRadius: '4px', background: event.status === 'active' && new Date(event.expires_at) > new Date() ? 'var(--emerald)' : (event.status === 'completed' ? 'var(--primary)' : '#ef4444'), color: '#fff', fontWeight: 'bold' }}>
                                                {event.status === 'active' && new Date(event.expires_at) <= new Date() ? 'EXPIRED' : event.status.toUpperCase()}
                                            </span>
                                            <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                                                EXP: {new Date(event.expires_at).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '0.9rem' }}>{event.question}</h4>
                                        <div className="flex-between" style={{ gap: '12px' }}>
                                            <div style={{ textAlign: 'center', flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '4px' }}>OPTION 1</p>
                                                <p style={{ fontWeight: 'bold', color: '#fff' }}>{event.pool_1} POOL</p>
                                            </div>
                                            <div style={{ textAlign: 'center', flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                                <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginBottom: '4px' }}>OPTION 2</p>
                                                <p style={{ fontWeight: 'bold', color: '#fff' }}>{event.pool_2} POOL</p>
                                            </div>
                                        </div>
                                        {event.status === 'active' && new Date(event.expires_at) > new Date() && (
                                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => resolvePredictionMutation.mutate({ event_id: event.id, winner: 'option_1' })}
                                                    style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '2px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}
                                                >
                                                    WIN: KING
                                                </button>
                                                <button
                                                    onClick={() => resolvePredictionMutation.mutate({ event_id: event.id, winner: 'option_2' })}
                                                    style={{ flex: 1, padding: '12px', background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '2px', boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)' }}
                                                >
                                                    WIN: QUEEN
                                                </button>
                                            </div>
                                        )}

                                        <div style={{ marginTop: '16px' }}>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Are you sure you want to DELETE this event? This cannot be undone.')) {
                                                        try {
                                                            const res = await fetch('/api/admin/predictions/delete', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ event_id: event.id })
                                                            });
                                                            const data = await res.json();
                                                            if (!res.ok) throw new Error(data.error || 'Delete failed');
                                                            queryClient.invalidateQueries({ queryKey: ['admin-predictions'] });
                                                        } catch (e: any) {
                                                            alert(`Failed to delete: ${e.message}`);
                                                        }
                                                    }
                                                }}
                                                style={{ width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '2px', cursor: 'pointer' }}
                                            >
                                                DELETE EVENT
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Prediction Event Modal */}
            {
                showPredictionModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 2000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0'
                    }}>
                        <div className="glass-panel" style={{ width: '100%', height: '100%', padding: '40px', borderRadius: '0', background: '#000', border: 'none', overflowY: 'auto' }}>
                            <h3 style={{ color: '#fff', marginBottom: '32px', fontSize: '1.6rem', fontWeight: '950', textAlign: 'center', letterSpacing: '2px' }}>NEW CARD GAME EVENT</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>QUESTION</label>
                                    <input
                                        value={predictionForm.question}
                                        disabled // Fixed as per request
                                        style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', marginTop: '8px' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>OPTION 1</label>
                                        <div style={{ marginTop: '8px', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '42px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #444' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={predictionForm.option_1_image || "/assets/king.png"} alt="K" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>KING</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>OPTION 2</label>
                                        <div style={{ marginTop: '8px', padding: '8px', background: '#111', border: '1px solid #333', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '42px', position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #444' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={predictionForm.option_2_image || "/assets/queen.png"} alt="Q" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>QUEEN</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                            {predictionForm.bet_mode === 'fixed' ? 'FIXED BET' : 'MIN BET'}
                                        </label>
                                        <input
                                            type="number"
                                            value={predictionForm.min_bet}
                                            onChange={e => setPredictionForm({ ...predictionForm, min_bet: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', marginTop: '8px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>EXPIRY</label>
                                        <select
                                            value={predictionForm.expiry_minutes}
                                            onChange={e => setPredictionForm({ ...predictionForm, expiry_minutes: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', marginTop: '8px' }}
                                        >
                                            <option value="1">1 Minute</option>
                                            <option value="5">5 Minutes</option>
                                            <option value="15">15 Minutes</option>
                                            <option value="30">30 Minutes</option>
                                            <option value="60">1 Hour</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>RESOLUTION MODE</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, resolution_method: 'auto' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.resolution_method === 'auto' ? 'var(--emerald)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            AUTO (LOWEST POOL)
                                        </button>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, resolution_method: 'manual' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.resolution_method === 'manual' ? 'var(--gold)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            MANUAL ADMIN
                                        </button>
                                    </div>
                                </div>


                                <div>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>BET MODE (Strategy)</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, bet_mode: 'fixed' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.bet_mode === 'fixed' ? 'var(--primary)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            FIXED BET (Exact Amount)
                                        </button>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, bet_mode: 'flexible' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.bet_mode === 'flexible' ? 'var(--sapphire)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            MINIMUM BET (Flexible)
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>TARGET AUDIENCE</label>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, target_audience: 'all' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.target_audience === 'all' ? 'var(--emerald)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            ALL USERS
                                        </button>
                                        <button
                                            onClick={() => setPredictionForm({ ...predictionForm, target_audience: 'premium' })}
                                            style={{ flex: 1, padding: '12px', background: predictionForm.target_audience === 'premium' ? 'var(--gold)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                        >
                                            PREMIUM ONLY
                                        </button>
                                    </div>
                                </div>

                                {/* BET MODE - DISABLED - Requires database migration
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>BET MODE</label>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => setPredictionForm({ ...predictionForm, bet_mode: 'fixed' })}
                                                style={{ flex: 1, padding: '12px', background: predictionForm.bet_mode === 'fixed' ? 'var(--primary)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                            >
                                                FIXED BET
                                            </button>
                                            <button
                                                onClick={() => setPredictionForm({ ...predictionForm, bet_mode: 'flexible' })}
                                                style={{ flex: 1, padding: '12px', background: predictionForm.bet_mode === 'flexible' ? 'var(--sapphire)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                            >
                                                FLEXIBLE BET
                                            </button>
                                        </div>
                                    </div>
                                    */}

                                {/* PLAYER TYPE - DISABLED - Requires database migration
                                    <div>
                                        <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>PLAYER TYPE</label>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <button
                                                onClick={() => setPredictionForm({ ...predictionForm, player_type: 'all' })}
                                                style={{ flex: 1, padding: '12px', background: predictionForm.player_type === 'all' ? 'var(--emerald)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                            >
                                                ALL USERS
                                            </button>
                                            <button
                                                onClick={() => setPredictionForm({ ...predictionForm, player_type: 'premium' })}
                                                style={{ flex: 1, padding: '12px', background: predictionForm.player_type === 'premium' ? 'var(--gold)' : '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}
                                            >
                                                PREMIUM ONLY
                                            </button>
                                        </div>
                                    </div>
                                    */}

                                {/* MANUAL WINNER - DISABLED - Requires database migration
                                    {predictionForm.resolution_method === 'manual' && (
                                        <div>
                                            <label style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: 'bold' }}>PRE-SELECT WINNER (CAN CHANGE AFTER LAUNCH)</label>
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                                <button
                                                    onClick={() => setPredictionForm({ ...predictionForm, manual_winner: 'option_1' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '16px',
                                                        background: predictionForm.manual_winner === 'option_1' ? 'linear-gradient(135deg, var(--primary), rgba(59, 130, 246, 0.7))' : '#111',
                                                        border: `2px solid ${predictionForm.manual_winner === 'option_1' ? 'var(--primary)' : '#333'}`,
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <div style={{ width: '16px', height: '16px', background: 'var(--primary)', borderRadius: '50%' }} />
                                                    KING WINS
                                                </button>
                                                <button
                                                    onClick={() => setPredictionForm({ ...predictionForm, manual_winner: 'option_2' })}
                                                    style={{
                                                        flex: 1,
                                                        padding: '16px',
                                                        background: predictionForm.manual_winner === 'option_2' ? 'linear-gradient(135deg, var(--secondary), rgba(236, 72, 153, 0.7))' : '#111',
                                                        border: `2px solid ${predictionForm.manual_winner === 'option_2' ? 'var(--secondary)' : '#333'}`,
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <div style={{ width: '16px', height: '16px', background: 'var(--secondary)', borderRadius: '50%' }} />
                                                    QUEEN WINS
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    */}

                                <button
                                    onClick={() => createPredictionMutation.mutate(predictionForm)}
                                    className="btn"
                                    style={{ width: '100%', padding: '16px', marginTop: '16px', background: '#fff', color: '#000', borderRadius: '12px', fontWeight: '950' }}
                                >
                                    LAUNCH EVENT
                                </button>
                                <button
                                    onClick={() => setShowPredictionModal(false)}
                                    style={{ width: '100%', padding: '16px', background: 'transparent', color: 'var(--text-dim)', border: 'none', cursor: 'pointer' }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                view === 'withdrawals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <div>
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '4px', color: '#fff' }}>WITHDRAWAL QUEUE</h2>
                                <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-dim)' }}>
                                    {financialData?.withdrawals?.filter((w: any) => w.status === 'pending').length || 0} PENDING REQUESTS
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {financialsError ? (
                                    <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
                                        <p style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: '900' }}>ERROR: {financialRespError?.message || 'FAILED TO LOAD DATA'}</p>
                                    </div>
                                ) : financialsLoading || !financialData?.withdrawals ? (
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Syncing Ledger...</p>
                                ) : financialData.withdrawals.length === 0 ? (
                                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid #222' }}>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>NO WITHDRAWAL REQUESTS FOUND.</p>
                                    </div>
                                ) : (
                                    financialData?.withdrawals?.map((tx: any) => (
                                        <div key={tx.id} className="glass-panel flex-between" style={{ padding: '24px', border: '1px solid #111', background: 'rgba(0,0,0,0.2)' }}>
                                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '48px', height: '48px', borderRadius: '12px',
                                                    background: tx.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : tx.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    border: `1px solid ${tx.status === 'pending' ? 'var(--gold)' : tx.status === 'completed' ? 'var(--emerald)' : 'var(--error)'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {tx.status === 'pending' ? <Clock size={20} color="var(--gold)" /> : tx.status === 'completed' ? <CheckCircle2 size={20} color="var(--emerald)" /> : <X size={20} color="var(--error)" />}
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', marginBottom: '4px' }}>
                                                        {Math.abs(tx.amount).toLocaleString()} FLOW <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>(₹{Math.abs(tx.amount) / 10})</span>
                                                    </h4>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <p style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '950' }}>{tx.profiles?.name?.toUpperCase()}</p>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>•</span>
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800' }}>{tx.profiles?.email}</p>
                                                        <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>•</span>
                                                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '800' }}>{new Date(tx.created_at).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                {tx.status === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm("CONFIRM PAYOUT?\nThis will mark the transaction as completed.")) {
                                                                    processWithdrawalMutation.mutate({ transactionId: tx.id, action: 'approve' });
                                                                }
                                                            }}
                                                            disabled={processWithdrawalMutation.isPending}
                                                            className="btn"
                                                            style={{ padding: '12px 24px', fontSize: '0.7rem', background: 'var(--emerald)', border: 'none', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                                                        >
                                                            APPROVE
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const reason = prompt("REJECTION REASON (Optional):");
                                                                if (reason !== null) {
                                                                    processWithdrawalMutation.mutate({ transactionId: tx.id, action: 'reject', rejectionReason: reason });
                                                                }
                                                            }}
                                                            disabled={processWithdrawalMutation.isPending}
                                                            className="btn"
                                                            style={{ padding: '12px 24px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)' }}
                                                        >
                                                            REJECT
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span style={{
                                                        padding: '8px 16px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '1px',
                                                        background: tx.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                        color: tx.status === 'completed' ? 'var(--emerald)' : 'var(--error)',
                                                        border: `1px solid ${tx.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                                    }}>
                                                        {tx.status.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

            {view === 'upi_requests' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    <div>
                        <div className="flex-between" style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '4px', color: '#fff' }}>UPI CHANGE REQUESTS</h2>
                            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '100px', fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-dim)' }}>
                                {financialData?.upiRequests?.length || 0} PENDING CHANGES
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {financialsError ? (
                                <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
                                    <p style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: '900' }}>ERROR: {financialRespError?.message || 'FAILED TO SCAN REQUESTS'}</p>
                                </div>
                            ) : financialsLoading || !financialData?.upiRequests ? (
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>Scanning Requests...</p>
                            ) : financialData.upiRequests.length === 0 ? (
                                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid #222' }}>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>NO UPI CHANGE REQUESTS.</p>
                                </div>
                            ) : (
                                financialData?.upiRequests?.map((req: any) => (
                                    <div key={req.id} className="glass-panel flex-between" style={{ padding: '24px', border: '1px solid #111', background: 'rgba(0,0,0,0.2)' }}>
                                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: '12px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid var(--sapphire)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Settings size={20} color="var(--sapphire)" />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--sapphire)', marginBottom: '4px' }}>
                                                    NEW: {req.new_upi_id}
                                                </h4>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#fff', fontWeight: '950' }}>{req.name?.toUpperCase()}</p>
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>•</span>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800' }}>OLD: {req.upi_id || 'NOT SET'}</p>
                                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>•</span>
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '800' }}>{req.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`APPROVE UPI CHANGE?\n${req.upi_id || 'NONE'} -> ${req.new_upi_id}`)) {
                                                        processUpiMutation.mutate({ targetUserId: req.id, action: 'approve' });
                                                    }
                                                }}
                                                disabled={processUpiMutation.isPending}
                                                className="btn"
                                                style={{ padding: '12px 24px', fontSize: '0.7rem', background: 'var(--sapphire)', border: 'none', color: '#fff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}
                                            >
                                                APPROVE CHANGE
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("REJECT REQUEST?")) {
                                                        processUpiMutation.mutate({ targetUserId: req.id, action: 'reject' });
                                                    }
                                                }}
                                                disabled={processUpiMutation.isPending}
                                                className="btn"
                                                style={{ padding: '12px 24px', fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)' }}
                                            >
                                                REJECT
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {view === 'systems' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* GLOBAL CONTROLS */}
                    <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--gold)', background: 'rgba(234, 179, 8, 0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--gold)', marginBottom: '24px', letterSpacing: '2px' }}>GLOBAL CONTROLS</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {/* BUY FLOW TOGGLE */}
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #333' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '950', color: '#fff', marginBottom: '4px' }}>BUY FLOW ACCESS</h4>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Enable/Disable users from purchasing FLOW coins.</p>
                                </div>
                                <button
                                    onClick={() => updateSystemSettingsMutation.mutate({ buy_flow_enabled: !systemSettings?.buy_flow_enabled })}
                                    style={{
                                        padding: '10px 20px', borderRadius: '24px', border: 'none',
                                        background: systemSettings?.buy_flow_enabled ? 'var(--emerald)' : '#333',
                                        color: systemSettings?.buy_flow_enabled ? '#000' : 'var(--text-dim)',
                                        fontWeight: '950', fontSize: '0.75rem', cursor: 'pointer'
                                    }}
                                >
                                    {systemSettings?.buy_flow_enabled ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>

                            {/* GAME SECTION TOGGLE */}
                            <div className="flex-between" style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #333' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: '950', color: '#fff', marginBottom: '4px' }}>GAME ARENA</h4>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Enable/Disable the Play/Arena section for all users.</p>
                                </div>
                                <button
                                    onClick={() => updateSystemSettingsMutation.mutate({ game_section_enabled: !systemSettings?.game_section_enabled })}
                                    style={{
                                        padding: '10px 20px', borderRadius: '24px', border: 'none',
                                        background: systemSettings?.game_section_enabled ? 'var(--emerald)' : '#333',
                                        color: systemSettings?.game_section_enabled ? '#000' : 'var(--text-dim)',
                                        fontWeight: '950', fontSize: '0.75rem', cursor: 'pointer'
                                    }}
                                >
                                    {systemSettings?.game_section_enabled ? 'ENABLED' : 'DISABLED'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '40px', border: '1px solid #333', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', letterSpacing: '4px' }}>SYSTEM MAINTENANCE</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '8px', letterSpacing: '1px' }}>PRUNE EXPIRED DATA AND OPTIMIZE PERFORMANCE</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>EXPIRED QUIZ PRUNING</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', maxWidth: '400px' }}>Permanently remove all quizzes that have passed their expiration date. This is a safe operation and will not affect user balances or active missions.</p>
                                </div>
                                <button
                                    disabled={isPruning}
                                    onClick={async () => {
                                        if (!window.confirm("ARE YOU SURE?\nThis will permanently delete all expired quizzes from the database.")) return;

                                        setIsPruning(true);
                                        try {
                                            const res = await fetch('/api/admin/systems/cleanup', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'x-user-id': user?.id || ''
                                                },
                                                body: JSON.stringify({ action: 'prune_quizzes' })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`SUCCESS: ${data.message}`);
                                                queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
                                            } else {
                                                alert(`ERROR: ${data.error}`);
                                            }
                                        } catch (e) {
                                            alert("CRITICAL ERROR: Maintenance pipe failed.");
                                        } finally {
                                            setIsPruning(false);
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        padding: '16px 32px',
                                        background: isPruning ? '#333' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${isPruning ? '#444' : 'var(--error)'}`,
                                        color: isPruning ? 'var(--text-dim)' : 'var(--error)',
                                        fontWeight: '950',
                                        fontSize: '0.75rem',
                                        letterSpacing: '2px'
                                    }}
                                >
                                    {isPruning ? 'PRUNING DATA...' : 'PRUNE EXPIRED QUIZZES'}
                                </button>
                            </div>

                            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>COMPLETED CARD GAMES</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', maxWidth: '400px' }}>Permanently remove all prediction events that are completed and their associated bet history. This will not affect active games.</p>
                                </div>
                                <button
                                    disabled={isPruningPredictions}
                                    onClick={async () => {
                                        if (!window.confirm("ARE YOU SURE?\nThis will permanently delete all completed prediction events and their bets.")) return;
                                        setIsPruningPredictions(true);
                                        try {
                                            const res = await fetch('/api/admin/systems/cleanup', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                                                body: JSON.stringify({ action: 'prune_predictions' })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`SUCCESS: ${data.message}`);
                                                queryClient.invalidateQueries({ queryKey: ['admin-predictions'] });
                                            } else {
                                                alert(`ERROR: ${data.error}`);
                                            }
                                        } catch (e) {
                                            alert("CRITICAL ERROR: Maintenance pipe failed.");
                                        } finally {
                                            setIsPruningPredictions(false);
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        padding: '16px 32px',
                                        background: isPruningPredictions ? '#333' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${isPruningPredictions ? '#444' : 'var(--error)'}`,
                                        color: isPruningPredictions ? 'var(--text-dim)' : 'var(--error)',
                                        fontWeight: '950',
                                        fontSize: '0.75rem',
                                        letterSpacing: '2px'
                                    }}
                                >
                                    {isPruningPredictions ? 'PRUNING DATA...' : 'PRUNE COMPLETED GAMES'}
                                </button>
                            </div>

                            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>HISTORICAL TRANSACTIONS</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', maxWidth: '400px' }}>Clear transaction logs (deposits, withdrawals, rewards) older than 30 days. This does not affect current user balances.</p>
                                </div>
                                <button
                                    disabled={isPruningTransactions}
                                    onClick={async () => {
                                        if (!window.confirm("ARE YOU SURE?\nThis will permanently delete transaction logs older than 30 days.")) return;
                                        setIsPruningTransactions(true);
                                        try {
                                            const res = await fetch('/api/admin/systems/cleanup', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                                                body: JSON.stringify({ action: 'prune_transactions' })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`SUCCESS: ${data.message}`);
                                                queryClient.invalidateQueries({ queryKey: ['admin-financials'] });
                                            } else {
                                                alert(`ERROR: ${data.error}`);
                                            }
                                        } catch (e) {
                                            alert("CRITICAL ERROR: Maintenance pipe failed.");
                                        } finally {
                                            setIsPruningTransactions(false);
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        padding: '16px 32px',
                                        background: isPruningTransactions ? '#333' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${isPruningTransactions ? '#444' : 'var(--error)'}`,
                                        color: isPruningTransactions ? 'var(--text-dim)' : 'var(--error)',
                                        fontWeight: '950',
                                        fontSize: '0.75rem',
                                        letterSpacing: '2px'
                                    }}
                                >
                                    {isPruningTransactions ? 'PRUNING DATA...' : 'PRUNE OLD TRANSACTIONS'}
                                </button>
                            </div>

                            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>ACTIVITY HISTORY</h3>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', maxWidth: '400px' }}>Clear all game activity logs, including 2-Card Game history and completed arcade rounds. Recommended for periodic maintenance.</p>
                                </div>
                                <button
                                    disabled={isPruningActivities}
                                    onClick={async () => {
                                        if (!window.confirm("ARE YOU SURE?\nThis will permanently delete all game activity logs and finished arcade rounds.")) return;
                                        setIsPruningActivities(true);
                                        try {
                                            const res = await fetch('/api/admin/systems/cleanup', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                                                body: JSON.stringify({ action: 'prune_game_history' })
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                alert(`SUCCESS: ${data.message}`);
                                            } else {
                                                alert(`ERROR: ${data.error}`);
                                            }
                                        } catch (e) {
                                            alert("CRITICAL ERROR: Maintenance pipe failed.");
                                        } finally {
                                            setIsPruningActivities(false);
                                        }
                                    }}
                                    className="btn"
                                    style={{
                                        padding: '16px 32px',
                                        background: isPruningActivities ? '#333' : 'rgba(239, 68, 68, 0.1)',
                                        border: `1px solid ${isPruningActivities ? '#444' : 'var(--error)'}`,
                                        color: isPruningActivities ? 'var(--text-dim)' : 'var(--error)',
                                        fontWeight: '950',
                                        fontSize: '0.75rem',
                                        letterSpacing: '2px'
                                    }}
                                >
                                    {isPruningActivities ? 'PRUNING DATA...' : 'PRUNE ACTIVITY LOGS'}
                                </button>
                            </div>

                            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', background: 'rgba(255, 255, 255, 0.02)', opacity: 0.5, cursor: 'not-allowed' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '950', color: 'var(--text-dim)', marginBottom: '8px' }}>USER SENSITIVE DATA (PROTECTED)</h3>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>DELETION OF WALLET DATA, LOGIN LOGS, AND PROFILES IS RESTRICTED BY CORE PROTOCOL.</p>
                                    </div>
                                    <div style={{ padding: '8px 16px', border: '1px solid #333', borderRadius: '4px', fontSize: '0.6rem', color: 'var(--text-dim)' }}>LOCKED</div>
                                </div>
                            </div>
                        </div>
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
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setT({ ...t, target_audience: e.target.value })}
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

                    {t.questions && t.questions.length > 0 && (
                        <div style={{ borderTop: '1px solid #222', paddingTop: '16px' }}>
                            <h4 style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '12px' }}>QUIZ QUESTIONS</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {t.questions.map((q: any, qIdx: number) => (
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
                    )}
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
