"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coins, Trophy, Zap, Clock, ShieldCheck, Activity, Plane, Palette, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export default function ArcadePage() {
    const { user, refreshUser, loading } = useUser();
    const router = useRouter();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [gameTab, setGameTab] = useState<'aviator' | 'color'>('aviator');
    const [betAmount, setBetAmount] = useState(10);
    const [isBetting, setIsBetting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Auth Protection
    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) return null; // Prevent flicker

    // Fetch Current Round
    const { data: round, refetch: refetchRound } = useQuery({
        queryKey: ['arcade-round'],
        queryFn: async () => {
            const res = await fetch("/api/arcade/round");
            return res.json();
        },
        refetchInterval: 2000 // Poll every 2s for live totals
    });

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Resolve round when timer hits 0 (Simplified: Client triggers resolution for demo)
                    if (round?.id) handleResolve(round.id);
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [round]);

    const betMutation = useMutation({
        mutationFn: async (payload: { roundId: string, choice: string, amount: number }) => {
            const res = await fetch("/api/arcade/bet", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-user-id": user?.id || "" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Bet failed");
            return res.json();
        },
        onSuccess: () => {
            refreshUser();
            setIsBetting(false);
            queryClient.invalidateQueries({ queryKey: ['arcade-round'] });
        }
    });

    const handleResolve = async (id: string) => {
        const res = await fetch("/api/arcade/resolve", {
            method: "POST",
            body: JSON.stringify({ roundId: id })
        });
        if (res.ok) {
            queryClient.invalidateQueries({ queryKey: ['arcade-round'] });
            refreshUser();
        }
    };

    const placeBet = (choice: string) => {
        if (!user || user.coins < betAmount) return showToast("INSUFFICIENT CAPITAL FOR ALLOCATION", "error");
        setIsBetting(true);
        betMutation.mutate({ roundId: round.id, choice, amount: betAmount });
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%', padding: '24px 8px', paddingBottom: '120px', position: 'relative', overflow: 'hidden' }}>
            {/* Background Blooms */}
            <div style={{ position: 'fixed', top: '5%', right: '-15%', width: '500px', height: '500px', background: 'var(--violet)', filter: 'blur(180px)', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '15%', left: '-15%', width: '400px', height: '400px', background: 'var(--sapphire)', filter: 'blur(160px)', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }} />

            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                <div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--rose)', boxShadow: '0 0 15px var(--rose)', animation: 'pulse 1s infinite' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '4px' }}>LIVE OPERATIONS</span>
                    </div>
                    <h1 className="font-heading" style={{ fontSize: '2.8rem', fontWeight: '950', letterSpacing: '-3px' }}>Arena</h1>
                </div>
                <div className="glass-panel flex-center" style={{ padding: '16px 28px', gap: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'var(--bg-secondary)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                    <Clock size={20} color="var(--primary)" strokeWidth={2.5} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '950', letterSpacing: '2px', color: '#fff' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Game Selection Tabs - Extreme Vibrant */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '48px', padding: '8px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid var(--glass-border)', position: 'relative', zIndex: 1 }}>
                <button
                    onClick={() => setGameTab('aviator')}
                    style={{
                        flex: 1, padding: '18px', borderRadius: '16px', border: 'none',
                        background: gameTab === 'aviator' ? 'var(--grad-vibrant)' : 'transparent',
                        color: '#fff', fontWeight: '950', fontSize: '0.8rem', letterSpacing: '2px',
                        transition: 'all 0.6s var(--transition)',
                        boxShadow: gameTab === 'aviator' ? '0 15px 35px rgba(168, 85, 247, 0.3)' : 'none'
                    }}
                >
                    KING & QUEEN
                </button>
                <button
                    onClick={() => setGameTab('color')}
                    style={{
                        flex: 1, padding: '18px', borderRadius: '16px', border: 'none',
                        background: gameTab === 'color' ? 'var(--grad-vibrant)' : 'transparent',
                        color: '#fff', fontWeight: '950', fontSize: '0.8rem', letterSpacing: '2px',
                        transition: 'all 0.6s var(--transition)',
                        boxShadow: gameTab === 'color' ? '0 15px 35px rgba(168, 85, 247, 0.3)' : 'none'
                    }}
                >
                    LUCKY COLOR
                </button>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
                {gameTab === 'aviator' ? (
                    <div className="animate-fade-in">
                        {/* Wager Allocation - Vibrant Grid */}
                        <div className="glass-panel" style={{ padding: '40px', marginBottom: '48px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: '950', color: 'var(--text-muted)', marginBottom: '32px', letterSpacing: '4px' }}>WAGER ALLOCATION</p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                {[10, 50, 100, 500].map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setBetAmount(amt)}
                                        className="glass-panel"
                                        style={{
                                            padding: '20px 0', border: '2px solid',
                                            borderColor: betAmount === amt ? 'var(--primary)' : 'transparent',
                                            background: betAmount === amt ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                            color: betAmount === amt ? '#000' : '#fff',
                                            fontWeight: '950', fontSize: '1rem', borderRadius: '16px',
                                            transition: '0.3s'
                                        }}
                                    >
                                        {amt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Card Interfaces - Ultra Vibrant */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
                            {[
                                { id: 'A', name: 'KING', icon: <ShieldCheck size={40} />, accent: 'var(--sapphire)' },
                                { id: 'B', name: 'QUEEN', icon: <Trophy size={40} />, accent: 'var(--gold)' }
                            ].map((card) => {
                                const total = card.id === 'A' ? round?.total_bet_a : round?.total_bet_b;
                                const isHeavier = card.id === 'A' ? round?.total_bet_a > round?.total_bet_b : round?.total_bet_b > round?.total_bet_a;
                                const isSelected = false; // Mock

                                return (
                                    <div key={card.id} onClick={() => placeBet(card.id)} className="glass-panel glass-vibrant" style={{
                                        padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
                                        background: `linear-gradient(180deg, ${card.accent}11 0%, rgba(0,0,0,0.8) 100%)`,
                                        border: `1.5px solid ${isHeavier ? 'rgba(255,255,255,0.1)' : card.accent}`,
                                        borderRadius: '32px', transition: '0.5s',
                                        boxShadow: isHeavier ? 'none' : `0 20px 50px ${card.accent}33`,
                                        transform: isHeavier ? 'scale(0.95)' : 'scale(1)',
                                        opacity: isHeavier ? 0.7 : 1
                                    }}>
                                        <div style={{
                                            width: '80px', height: '80px', margin: '0 auto 24px',
                                            background: card.accent, borderRadius: '24px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: card.id === 'A' ? '#fff' : '#000',
                                            boxShadow: `0 10px 25px ${card.accent}66`
                                        }}>
                                            {card.icon}
                                        </div>
                                        <h2 style={{ fontSize: '1.75rem', fontWeight: '950', letterSpacing: '4px', color: '#fff', marginBottom: '24px' }}>{card.name}</h2>

                                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: '950', color: '#fff', letterSpacing: '-2px' }}>
                                                {total?.toLocaleString() || 0}
                                            </div>
                                            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '2px' }}>POOL VOLUME</p>
                                        </div>

                                        <div style={{ marginTop: '24px', fontSize: '0.7rem', fontWeight: '950', color: isHeavier ? 'var(--rose)' : 'var(--emerald)', letterSpacing: '2px' }}>
                                            {isHeavier ? 'CRITICAL RISK' : 'OPTIMIZED PROFIT'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {/* Lucky Color - Radiant Rainbow Grid */}
                        <div className="glass-panel glass-vibrant" style={{ padding: '60px 40px', background: 'var(--bg-secondary)', borderRadius: '32px', marginBottom: '48px', border: '1px solid var(--glass-border)' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: '950', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '48px', letterSpacing: '6px' }}>SPECTRUM VECTOR</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                                <button onClick={() => placeBet('green')} style={{ height: '140px', background: 'linear-gradient(135deg, #22c55e 0%, #064e3b 100%)', border: 'none', borderRadius: '24px', boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)', transition: '0.3s' }} className="flex-center">
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '950', color: '#fff', letterSpacing: '2px' }}>GREEN</p>
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: '950' }}>2.0X</p>
                                    </div>
                                </button>
                                <button onClick={() => placeBet('red')} style={{ height: '140px', background: 'linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)', border: 'none', borderRadius: '24px', boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)', transition: '0.3s' }} className="flex-center">
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.25rem', fontWeight: '950', color: '#fff', letterSpacing: '2px' }}>RED</p>
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: '950' }}>2.0X</p>
                                    </div>
                                </button>
                                <button onClick={() => placeBet('violet')} style={{ height: '140px', background: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)', border: 'none', borderRadius: '24px', boxShadow: '0 20px 40px rgba(168, 85, 247, 0.3)', transition: '0.3s' }} className="flex-center">
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', letterSpacing: '1px' }}>VIOLET</p>
                                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)', fontWeight: '950' }}>4.5X</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Trend Log - Radiant Tags */}
                        <div className="glass-panel" style={{ padding: '32px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid var(--glass-border)' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '950', marginBottom: '24px', letterSpacing: '4px', textAlign: 'center', color: 'var(--text-muted)' }}>OPERATIONAL TRENDS</h4>
                            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', justifyContent: 'center' }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                    <div key={h} style={{
                                        minWidth: '48px', height: '48px', borderRadius: '50%',
                                        background: h % 2 === 0 ? 'var(--emerald)' : 'var(--rose)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 0 15px ${h % 2 === 0 ? 'var(--emerald)' : 'var(--rose)'}44`,
                                        color: '#fff', fontWeight: '950'
                                    }}>
                                        {h * 4}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Platform Integrity */}
            <div style={{ marginTop: '56px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div className="flex-center" style={{ gap: '12px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '2px' }}>
                    <ShieldCheck size={18} color="var(--emerald)" />
                    <span>PROFESSIONAL GRADE ENCRYPTION ACTIVE</span>
                </div>
            </div>
        </div>
    );
}
