"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Coins, Trophy, Zap, Clock, ShieldCheck, Activity, Plane, Palette, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ArcadePage() {
    const { user, refreshUser } = useUser();
    const queryClient = useQueryClient();
    const [gameTab, setGameTab] = useState<'aviator' | 'color'>('aviator');
    const [betAmount, setBetAmount] = useState(10);
    const [isBetting, setIsBetting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

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
        if (!user || user.coins < betAmount) return alert("INSUFFICIENT BALANCE!");
        setIsBetting(true);
        betMutation.mutate({ roundId: round.id, choice, amount: betAmount });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '90vh' }}>
            {/* Arcade Header */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.03em' }}>ARENA</h1>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>LIVE ROUNDS ACTIVE</span>
                    </div>
                </div>
                <div className="glass-panel flex-center" style={{ padding: '8px 16px', gap: '8px', borderRadius: '12px' }}>
                    <Clock size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', fontFamily: 'monospace' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Game Selection Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px' }}>
                <button
                    onClick={() => setGameTab('aviator')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', gap: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gameTab === 'aviator' ? 'var(--primary)' : 'transparent',
                        color: gameTab === 'aviator' ? '#000' : 'var(--text-dim)',
                        transition: '0.3s'
                    }}
                >
                    <Plane size={18} /> <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>KING & QUEEN</span>
                </button>
                <button
                    onClick={() => setGameTab('color')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '12px', border: 'none', gap: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gameTab === 'color' ? 'var(--secondary)' : 'transparent',
                        color: gameTab === 'color' ? '#000' : 'var(--text-dim)',
                        transition: '0.3s'
                    }}
                >
                    <Palette size={18} /> <span style={{ fontSize: '0.75rem', fontWeight: '800' }}>LUCKY COLOR</span>
                </button>
            </div>

            {/* Bet Multiplier Controls */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '2px' }}>SELECT WAGER</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {[10, 50, 100, 500].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setBetAmount(amt)}
                            style={{
                                padding: '12px 0', borderRadius: '12px', border: '1px solid var(--glass-border)',
                                background: betAmount === amt ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                                color: betAmount === amt ? '#000' : 'var(--text-main)',
                                fontSize: '0.8rem', fontWeight: '800'
                            }}
                        >
                            {amt}
                        </button>
                    ))}
                </div>
            </div>

            {/* King & Queen Implementation */}
            {gameTab === 'aviator' && (
                <div className="animate-fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                        {[
                            { id: 'A', name: 'KING', img: '/assets/king.png' },
                            { id: 'B', name: 'QUEEN', img: '/assets/queen.png' }
                        ].map((card) => {
                            const total = card.id === 'A' ? round?.total_bet_a : round?.total_bet_b;
                            const isHeavier = card.id === 'A' ? round?.total_bet_a > round?.total_bet_b : round?.total_bet_b > round?.total_bet_a;

                            return (
                                <div key={card.id} className="glass-panel" style={{
                                    padding: '0', overflow: 'hidden', textAlign: 'center', position: 'relative',
                                    border: isHeavier ? '1px solid rgba(255, 77, 77, 0.2)' : '1px solid rgba(0, 255, 163, 0.4)',
                                    boxShadow: isHeavier ? 'none' : '0 10px 40px rgba(0, 255, 163, 0.15)',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isBetting ? 'scale(0.98)' : 'scale(1)'
                                }}>
                                    {/* Professional Character Image with Face Framing */}
                                    <div style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden', background: '#000' }}>
                                        <img
                                            src={card.img}
                                            alt={card.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'top center', // Focus on faces
                                                opacity: 1, // Full opacity for clarity
                                                filter: 'contrast(1.1) brightness(1.05) saturate(1.1) contrast(1.05)', // Sharpening
                                                imageRendering: '-webkit-optimize-contrast', // High-fidelity rendering
                                                transition: '0.6s'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(5, 7, 10, 0.9) 100%)',
                                        }} />

                                        <div style={{
                                            position: 'absolute', top: '15px', right: '15px',
                                            background: isHeavier ? 'rgba(255, 77, 77, 0.2)' : 'rgba(0, 255, 163, 0.2)',
                                            padding: '4px 12px', borderRadius: '20px', backdropFilter: 'blur(4px)',
                                            border: `1px solid ${isHeavier ? 'rgba(255, 77, 77, 0.3)' : 'rgba(0, 255, 163, 0.3)'}`
                                        }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: isHeavier ? '#ff4d4d' : '#00ffa3', letterSpacing: '1px' }}>
                                                CARD {card.id}
                                            </span>
                                        </div>

                                        <h2 style={{
                                            position: 'absolute', bottom: '40px', left: '0', right: '0',
                                            fontSize: '1.5rem', fontWeight: '900', color: '#fff',
                                            textShadow: '0 4px 20px rgba(0,0,0,0.5)', letterSpacing: '4px'
                                        }}>{card.name}</h2>
                                    </div>

                                    <div style={{ padding: '24px', position: 'relative', zIndex: 1, marginTop: '-30px', background: 'var(--bg-main)' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{
                                                fontSize: '2.5rem', fontWeight: '900',
                                                color: isHeavier ? 'var(--error)' : 'var(--success)',
                                                letterSpacing: '-1px',
                                                textShadow: !isHeavier ? '0 0 15px rgba(0, 255, 163, 0.4)' : 'none'
                                            }}>
                                                {total?.toLocaleString() || 0}
                                            </div>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800', letterSpacing: '2px' }}>VOTED COINS</p>
                                        </div>

                                        <button
                                            onClick={() => placeBet(card.id)}
                                            disabled={isBetting}
                                            className="btn" style={{
                                                width: '100%',
                                                height: '54px',
                                                borderRadius: '16px',
                                                background: isHeavier ? 'rgba(255,255,255,0.03)' : 'linear-gradient(45deg, var(--primary), #00d4ff)',
                                                border: 'none',
                                                boxShadow: isHeavier ? '0 0 0 rgba(0,0,0,0)' : '0 10px 20px rgba(0, 242, 255, 0.2)',
                                                color: isHeavier ? 'var(--text-dim)' : '#000',
                                                fontWeight: '900',
                                                fontSize: '0.9rem',
                                                letterSpacing: '1px'
                                            }}
                                        >
                                            {isBetting ? 'LOCKING...' : `CHOOSE ${card.id}`}
                                        </button>

                                        <div style={{ marginTop: '16px' }}>
                                            {isHeavier ? (
                                                <div className="flex-center" style={{ gap: '6px', color: 'var(--error)', fontSize: '0.6rem', fontWeight: '900' }}>
                                                    <AlertTriangle size={12} /> DANGER: HIGH STAKE
                                                </div>
                                            ) : (
                                                <div className="flex-center" style={{ gap: '6px', color: 'var(--success)', fontSize: '0.6rem', fontWeight: '900' }}>
                                                    <ShieldCheck size={12} /> SAFE ZONE: PROFIT SIDE
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Color Trading Implementation */}
            {gameTab === 'color' && (
                <div className="animate-fade-in">
                    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <button onClick={() => placeBet('green')} className="btn" style={{ background: 'var(--success)', color: '#000' }}>GREEN</button>
                            <button onClick={() => placeBet('red')} className="btn" style={{ background: 'var(--error)', color: '#000' }}>RED</button>
                            <button onClick={() => placeBet('violet')} className="btn" style={{ background: '#a855f7', color: '#fff' }}>VIOLET</button>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '16px' }}>ROUND HISTORY</h4>
                        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                <div key={h} style={{
                                    minWidth: '24px', height: '24px', borderRadius: '50%',
                                    background: h % 2 === 0 ? 'var(--success)' : 'var(--error)'
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Platform Integrity footer */}
            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div className="flex-center" style={{ gap: '8px', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '800' }}>
                    <ShieldCheck size={14} />
                    <span>VERIFIED FAIR & PROFIT OPTIMIZED ENGINE</span>
                </div>
            </div>
        </div>
    );
}
