"use client";

import { useUser } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { Coins, Trophy, Zap, Clock, ShieldCheck, Activity, Plane, Palette, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/context/ToastContext";

export default function ArcadePage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
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
        if (!user || user.coins < betAmount) return showToast("INSUFFICIENT CAPITAL FOR ALLOCATION", "error");
        setIsBetting(true);
        betMutation.mutate({ roundId: round.id, choice, amount: betAmount });
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '90vh' }}>
            {/* Arcade Header */}
            <div className="flex-between" style={{ marginBottom: '40px' }}>
                <div>
                    <h1 className="font-heading" style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '4px' }}>ARENA</h1>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px #fff' }} />
                        <span style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '2px' }}>OPERATIONS LIVE</span>
                    </div>
                </div>
                <div className="glass-panel flex-center" style={{ padding: '12px 24px', gap: '10px', borderRadius: '4px', border: '1px solid #fff' }}>
                    <Clock size={16} color="#fff" strokeWidth={1} />
                    <span style={{ fontSize: '1.1rem', fontWeight: '900', letterSpacing: '2px' }}>00:{timeLeft.toString().padStart(2, '0')}</span>
                </div>
            </div>

            {/* Game Selection Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid #222' }}>
                <button
                    onClick={() => setGameTab('aviator')}
                    style={{
                        flex: 1, padding: '16px', borderRadius: '2px', border: 'none', gap: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gameTab === 'aviator' ? '#fff' : 'transparent',
                        color: gameTab === 'aviator' ? '#000' : 'var(--text-dim)',
                        transition: '0.4s var(--transition)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px'
                    }}
                >
                    KING & QUEEN
                </button>
                <button
                    onClick={() => setGameTab('color')}
                    style={{
                        flex: 1, padding: '16px', borderRadius: '2px', border: 'none', gap: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: gameTab === 'color' ? '#fff' : 'transparent',
                        color: gameTab === 'color' ? '#000' : 'var(--text-dim)',
                        transition: '0.4s var(--transition)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px'
                    }}
                >
                    LUCKY COLOR
                </button>
            </div>

            {/* Bet Multiplier Controls */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', textAlign: 'center', borderRadius: '4px', border: '1px solid #222' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '24px', letterSpacing: '4px' }}>OPERATIONAL WAGER</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[10, 50, 100, 500].map(amt => (
                        <button
                            key={amt}
                            onClick={() => setBetAmount(amt)}
                            style={{
                                padding: '16px 0', borderRadius: '2px', border: '1px solid #333',
                                background: betAmount === amt ? '#fff' : 'transparent',
                                color: betAmount === amt ? '#000' : '#fff',
                                fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px'
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                        {[
                            { id: 'A', name: 'KING', img: '/assets/king.png' },
                            { id: 'B', name: 'QUEEN', img: '/assets/queen.png' }
                        ].map((card) => {
                            const total = card.id === 'A' ? round?.total_bet_a : round?.total_bet_b;
                            const isHeavier = card.id === 'A' ? round?.total_bet_a > round?.total_bet_b : round?.total_bet_b > round?.total_bet_a;

                            return (
                                <div key={card.id} className="glass-panel" style={{
                                    padding: '0', overflow: 'hidden', textAlign: 'center', position: 'relative',
                                    border: isHeavier ? '1px solid #333' : '1px solid #fff',
                                    borderRadius: '4px', background: '#000',
                                    transition: 'all 0.6s var(--transition)',
                                    transform: isBetting ? 'scale(0.98)' : 'scale(1)'
                                }}>
                                    <div style={{ position: 'relative', width: '100%', height: '360px', overflow: 'hidden' }}>
                                        <img
                                            src={card.img}
                                            alt={card.name}
                                            style={{
                                                width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center',
                                                filter: 'grayscale(100%) contrast(1.2) brightness(0.8)', // Monochrome Premium
                                                transition: '0.8s'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
                                        }} />

                                        <div style={{
                                            position: 'absolute', top: '20px', left: '20px',
                                            padding: '4px 12px', border: '1px solid #fff', background: '#000'
                                        }}>
                                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#fff', letterSpacing: '2px' }}>
                                                ASSET {card.id}
                                            </span>
                                        </div>

                                        <h2 style={{
                                            position: 'absolute', bottom: '40px', left: '0', right: '0',
                                            fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '8px'
                                        }}>{card.name}</h2>
                                    </div>

                                    <div style={{ padding: '32px', background: '#000' }}>
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#fff', letterSpacing: '-2px' }}>
                                                {total?.toLocaleString() || 0}
                                            </div>
                                            <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '4px' }}>VOLUME</p>
                                        </div>

                                        <button
                                            onClick={() => placeBet(card.id)}
                                            disabled={isBetting}
                                            className="btn" style={{
                                                width: '100%', height: '60px', borderRadius: '2px',
                                                background: isHeavier ? 'transparent' : '#fff',
                                                border: '1px solid #fff',
                                                color: isHeavier ? '#fff' : '#000',
                                                fontWeight: '900', fontSize: '0.8rem', letterSpacing: '2px'
                                            }}
                                        >
                                            {isBetting ? 'EXECUTING...' : `SELECT ${card.id}`}
                                        </button>

                                        <div style={{ marginTop: '20px' }}>
                                            <div className="flex-center" style={{ gap: '8px', color: isHeavier ? 'var(--text-dim)' : '#fff', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '2px' }}>
                                                {isHeavier ? 'HIGH RISK SECTOR' : 'OPTIMIZED PROFIT ZONE'}
                                            </div>
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
                <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px', border: '1px solid #222', borderRadius: '4px' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: '900', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '32px', letterSpacing: '4px' }}>SPECTRUM ALLOCATION</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                            <button onClick={() => placeBet('green')} className="btn" style={{ background: '#fff', color: '#000', border: '1px solid #fff' }}>GREEN</button>
                            <button onClick={() => placeBet('red')} className="btn" style={{ background: 'transparent', color: '#fff', border: '1px solid #fff' }}>RED</button>
                            <button onClick={() => placeBet('violet')} className="btn" style={{ background: 'transparent', color: '#fff', border: '1px solid #444' }}>VIOLET</button>
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', borderRadius: '4px' }}>
                        <h4 style={{ fontSize: '0.7rem', fontWeight: '900', marginBottom: '24px', letterSpacing: '2px' }}>OPERATIONAL HISTORY</h4>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                <div key={h} style={{
                                    minWidth: '32px', height: '32px', borderRadius: '2px',
                                    border: '1px solid #333',
                                    background: h % 2 === 0 ? '#fff' : 'transparent',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: h % 2 === 0 ? '#000' : '#fff' }} />
                                </div>
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
