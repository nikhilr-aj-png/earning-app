"use client";

export const dynamic = 'force-dynamic';

import { useUser } from "@/context/UserContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, Crown, History, Trophy, TrendingUp, AlertTriangle, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function ArenaPage() {
    const { user, refreshUser, loading } = useUser();
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [timeLeft, setTimeLeft] = useState(30);
    const [selectedSide, setSelectedSide] = useState<'king' | 'queen' | null>(null);
    const [betAmount, setBetAmount] = useState<number>(100);
    const [gameState, setGameState] = useState<'active' | 'calculating'>('active');
    const [lastWinner, setLastWinner] = useState<string | null>(null);

    // Auth Protection
    useEffect(() => {
        if (!loading && !user) router.push('/');
    }, [user, loading, router]);

    // 1. Game Sync (Heartbeat)
    const { data: gameData, refetch: syncGame } = useQuery({
        queryKey: ['arena-sync'],
        queryFn: async () => {
            const res = await fetch('/api/arena/sync');
            return res.json();
        },
        refetchInterval: 1000, // Poll every second for real-time feel
    });

    // 2. Timer Logic
    useEffect(() => {
        if (gameData?.endTime) {
            const end = new Date(gameData.endTime).getTime();
            const serverNow = new Date(gameData.serverTime).getTime();
            const diff = Math.floor((end - serverNow) / 1000);

            if (diff <= 0) {
                setTimeLeft(0);
                if (gameState === 'active') {
                    setGameState('calculating');
                    // Refresh User Balance on Round End
                    setTimeout(() => {
                        refreshUser();
                        setGameState('active');
                        setLastWinner(gameData.lastWinner);
                    }, 3000);
                }
            } else {
                setTimeLeft(diff);
                setGameState('active');
            }
        }
    }, [gameData, gameState]);

    // 3. Place Bet Mutation
    const betMutation = useMutation({
        mutationFn: async () => {
            if (!user) return;
            const res = await fetch('/api/arena/bet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
                body: JSON.stringify({
                    roundId: gameData.roundId,
                    side: selectedSide,
                    amount: betAmount
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            showToast(`BET PLACED ON ${selectedSide?.toUpperCase()}`, 'success');
            refreshUser();
            setSelectedSide(null); // Reset selection
        },
        onError: (err: any) => {
            showToast(err.message, 'error');
        }
    });

    if (loading || !user) return <div className="flex-center" style={{ height: '100vh' }}>LOADING ARENA...</div>;

    return (
        <div className="animate-fade-in" style={{ padding: '24px 16px', paddingBottom: '100px', minHeight: '100vh', background: '#020617' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '24px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: 0 }}>
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-center" style={{ gap: '8px' }}>
                    <Crown size={20} color="var(--gold)" fill="var(--gold)" />
                    <h1 className="font-heading" style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '2px' }}>ARENA</h1>
                </div>
                <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--gold)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '950', color: 'var(--gold)' }}>{user.coins.toLocaleString()}</span>
                </div>
            </div>

            {/* Timer & Status */}
            <div style={{ textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
                <div style={{
                    fontSize: '4rem', fontWeight: '950', lineHeight: 1,
                    color: timeLeft < 5 ? 'var(--error)' : '#fff',
                    textShadow: timeLeft < 5 ? '0 0 30px var(--error)' : '0 0 30px rgba(255,255,255,0.2)'
                }}>
                    {gameState === 'calculating' ? '00' : `00:${timeLeft.toString().padStart(2, '0')}`}
                </div>
                <p style={{
                    color: gameState === 'calculating' ? 'var(--gold)' : 'var(--text-dim)',
                    fontWeight: '900', letterSpacing: '4px', fontSize: '0.7rem', marginTop: '8px'
                }}>
                    {gameState === 'calculating' ? 'CALCULATING WINNER...' : 'ROUND ENDS IN'}
                </p>

                {/* Previous Winner Toast */}
                {lastWinner && (
                    <div className="animate-slide-up" style={{
                        position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                        marginTop: '16px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px'
                    }}>
                        <span style={{ fontSize: '0.7rem', color: '#fff' }}>LAST WINNER: </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '950', color: lastWinner === 'king' ? 'var(--primary)' : 'var(--secondary)' }}>
                            {lastWinner.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Battle Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                {/* KING CARD */}
                <div
                    onClick={() => setSelectedSide('king')}
                    style={{
                        background: selectedSide === 'king' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(2, 6, 23, 0.9) 100%)' : 'rgba(255,255,255,0.02)',
                        border: selectedSide === 'king' ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: '0.3s',
                        transform: selectedSide === 'king' ? 'scale(1.05)' : 'scale(1)'
                    }}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '3rem' }}>🤴</span>
                    </div>
                    <h2 style={{ color: 'var(--primary)', fontWeight: '950', fontSize: '1.2rem', marginBottom: '4px' }}>KING</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>POOL: {gameData?.pool?.king || 0}</p>
                </div>

                {/* QUEEN CARD */}
                <div
                    onClick={() => setSelectedSide('queen')}
                    style={{
                        background: selectedSide === 'queen' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.4) 0%, rgba(2, 6, 23, 0.9) 100%)' : 'rgba(255,255,255,0.02)',
                        border: selectedSide === 'queen' ? '2px solid var(--secondary)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '24px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: '0.3s',
                        transform: selectedSide === 'queen' ? 'scale(1.05)' : 'scale(1)'
                    }}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '3rem' }}>👸</span>
                    </div>
                    <h2 style={{ color: 'var(--secondary)', fontWeight: '950', fontSize: '1.2rem', marginBottom: '4px' }}>QUEEN</h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>POOL: {gameData?.pool?.queen || 0}</p>
                </div>
            </div>

            {/* Betting Controls */}
            {selectedSide && (
                <div className="animate-slide-up glass-panel" style={{ padding: '24px', border: '1px solid var(--gold)', marginBottom: '32px' }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '900' }}>BET AMOUNT</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: '950' }}>{betAmount} FLOW</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '24px' }}>
                        {[100, 500, 1000, 5000].map(amt => (
                            <button
                                key={amt}
                                onClick={() => setBetAmount(amt)}
                                style={{
                                    padding: '12px', borderRadius: '8px', border: betAmount === amt ? '1px solid var(--gold)' : '1px solid #333',
                                    background: betAmount === amt ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                                    color: '#fff', fontSize: '0.7rem', fontWeight: '900'
                                }}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => betMutation.mutate()}
                        disabled={betMutation.isPending || timeLeft < 5}
                        className="btn"
                        style={{ width: '100%', background: timeLeft < 5 ? '#333' : 'var(--gold)', color: timeLeft < 5 ? '#666' : '#000' }}
                    >
                        {betMutation.isPending ? 'PLACING BET...' : timeLeft < 5 ? 'BETS CLOSED' : `PLACE BET ON ${selectedSide.toUpperCase()}`}
                    </button>
                </div>
            )}

            {/* History Mockup (Ideally fetched from API) */}
            <div style={{ marginTop: '40px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                    <History size={14} color="var(--text-dim)" />
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '950', letterSpacing: '2px' }}>RECENT OUTCOMES</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {/* Placeholder for history - In real app, fetch from sync API */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} style={{
                            minWidth: '32px', height: '32px', borderRadius: '50%',
                            background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                            border: i % 2 === 0 ? '1px solid var(--primary)' : '1px solid var(--secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: '900', color: '#fff'
                        }}>
                            {i % 2 === 0 ? 'K' : 'Q'}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
