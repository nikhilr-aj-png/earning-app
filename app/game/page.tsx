"use client";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Play, Trophy, Star, Activity, ArrowRight, Gamepad2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function GameHub() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    const { data: games, isLoading } = useQuery({
        queryKey: ['games-list'],
        queryFn: async () => {
            const res = await fetch('/api/games/list');
            const data = await res.json();
            if (!Array.isArray(data)) throw new Error(data.error || 'Failed to load games');
            return data;
        }
    });

    const { data: predictions } = useQuery({
        queryKey: ['active-predictions'],
        queryFn: async () => {
            const res = await fetch('/api/game/prediction/list');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        refetchInterval: 5000 // Refresh every 5s for live pools/timer
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    return (
        <div className="animate-fade-in" style={{ padding: '24px 8px', paddingBottom: '120px', minHeight: '100vh', position: 'relative' }}>
            {/* Background Blooms */}
            <div style={{ position: 'fixed', top: '10%', right: '-10%', width: '500px', height: '500px', background: 'var(--violet)', filter: 'blur(180px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '10%', left: '-10%', width: '500px', height: '500px', background: 'var(--sapphire)', filter: 'blur(180px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />

            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '40px', position: 'relative', zIndex: 1, padding: '0 16px' }}>
                <div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ padding: '6px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                            <Gamepad2 size={16} color="var(--primary)" />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '4px' }}>ENTERTAINMENT ZONE</span>
                    </div>
                    <h1 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px' }}>Game Hub</h1>
                </div>
                {/* User Balance Compact */}
                <div className="glass-panel flex-center" style={{ padding: '10px 16px', gap: '8px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--emerald)', borderRadius: '50%', boxShadow: '0 0 10px var(--emerald)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '950', color: '#fff' }}>{user.coins.toLocaleString()}</span>
                </div>
            </div>

            {/* Game Grid */}
            <div style={{ position: 'relative', zIndex: 1, padding: '0 8px' }}>
                {isLoading ? (
                    <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
                        <div className="loader" style={{ borderTopColor: 'var(--primary)' }} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px' }}>LOADING EXPERIENCES...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

                        {/* 1. CARD GAMES (Individual Play Cards) */}
                        {predictions && predictions.length > 0 && (
                            <div className="animate-slide-up">
                                <div className="flex-between" style={{ marginBottom: '24px' }}>
                                    <div className="flex-center" style={{ gap: '8px' }}>
                                        <Activity size={18} color="var(--rose)" className="animate-pulse" />
                                        <h2 style={{ fontSize: '1.2rem', fontWeight: '950', color: '#fff', letterSpacing: '1px' }}>CARD GAMES</h2>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 'bold' }}>{predictions.length} LIVE</span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    {predictions.map((event: any, index: number) => {
                                        const expires = new Date(event.expires_at);
                                        const timeLeft = Math.max(0, expires.getTime() - Date.now());
                                        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                                        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                                        return (
                                            <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                                <div className="glass-panel glass-vibrant" style={{
                                                    borderRadius: '24px',
                                                    border: '1px solid var(--glass-border)',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column'
                                                }}>
                                                    {/* Game Image Area */}
                                                    <div style={{
                                                        height: '200px',
                                                        background: 'linear-gradient(135deg, #dc2626 0%, #7c2d12 100%)',
                                                        position: 'relative',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <div style={{
                                                            position: 'absolute', top: '16px', right: '16px',
                                                            background: 'var(--rose)', color: '#fff',
                                                            fontSize: '0.6rem', fontWeight: '950', padding: '4px 10px',
                                                            borderRadius: 'full', letterSpacing: '1px',
                                                            boxShadow: '0 4px 10px rgba(244, 63, 94, 0.4)'
                                                        }}>
                                                            {hours}h {minutes}m LEFT
                                                        </div>

                                                        {/* Card Preview */}
                                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                            <div style={{
                                                                width: '70px', height: '95px', background: '#fff',
                                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', fontSize: '3rem', fontWeight: '900',
                                                                color: 'var(--primary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                                            }}>
                                                                K
                                                            </div>
                                                            <span style={{ fontSize: '2rem', color: '#fff', fontWeight: '900' }}>vs</span>
                                                            <div style={{
                                                                width: '70px', height: '95px', background: '#fff',
                                                                borderRadius: '8px', display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', fontSize: '3rem', fontWeight: '900',
                                                                color: 'var(--secondary)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                                            }}>
                                                                Q
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                        <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                                            {event.question}
                                                        </h3>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                                            Min Entry: <span style={{ color: 'var(--emerald)', fontWeight: 'bold' }}>{event.min_bet} FLOW</span>
                                                        </p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '32px', flex: 1 }}>
                                                            Total Pool: <span style={{ color: '#fff', fontWeight: 'bold' }}>{((event.pool_1 || 0) + (event.pool_2 || 0)).toLocaleString()} FLOW</span>
                                                        </p>

                                                        <button
                                                            onClick={() => setSelectedEvent(event)}
                                                            className="btn"
                                                            style={{
                                                                width: '100%', height: '56px', borderRadius: '16px',
                                                                background: 'var(--rose)', color: '#fff',
                                                                fontSize: '0.9rem', fontWeight: '900',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                                            }}
                                                        >
                                                            PLAY NOW <Play size={18} fill="currentColor" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. STANDARD GAMES */}
                        <div>
                            <div className="flex-between" style={{ marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '950', color: '#fff', letterSpacing: '1px' }}>ALL GAMES</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                                {games?.map((game: any, index: number) => (
                                    <div key={game.id} className="animate-fade-in" style={{
                                        animationDelay: `${index * 100}ms`
                                    }}>
                                        <div className="glass-panel glass-vibrant" style={{
                                            borderRadius: '24px',
                                            border: '1px solid var(--glass-border)',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            {/* Game Image Area (Placeholder Gradient for now) */}
                                            <div style={{
                                                height: '200px',
                                                background: index % 2 === 0 ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : 'linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                {game.status === 'active' && (
                                                    <div style={{
                                                        position: 'absolute', top: '16px', right: '16px',
                                                        background: 'var(--emerald)', color: '#fff',
                                                        fontSize: '0.6rem', fontWeight: '950', padding: '4px 10px',
                                                        borderRadius: 'full', letterSpacing: '1px',
                                                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)'
                                                    }}>
                                                        LIVE
                                                    </div>
                                                )}
                                                {game.status === 'coming_soon' && (
                                                    <div style={{
                                                        position: 'absolute', top: '0', left: '0', right: '0', bottom: '0',
                                                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        zIndex: 10
                                                    }}>
                                                        <div className="badge-gold" style={{ border: '1px solid var(--text-dim)', color: 'var(--text-dim)' }}>COMING SOON</div>
                                                    </div>
                                                )}

                                                {/* Icon Placeholder since we assume limited assets initially */}
                                                <Trophy size={64} color="rgba(255,255,255,0.1)" strokeWidth={1} />
                                            </div>

                                            {/* Content */}
                                            <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ fontSize: '1.4rem', fontWeight: '950', color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                                                    {game.title}
                                                </h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px', flex: 1 }}>
                                                    {game.description}
                                                </p>

                                                {game.status === 'active' ? (
                                                    <Link href={game.route_path} className="btn" style={{
                                                        width: '100%', height: '56px', borderRadius: '16px',
                                                        background: 'var(--primary)', color: '#000',
                                                        fontSize: '0.9rem', fontWeight: '900',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px'
                                                    }}>
                                                        PLAY NOW <Play size={18} fill="currentColor" />
                                                    </Link>
                                                ) : (
                                                    <button disabled className="btn" style={{
                                                        width: '100%', height: '56px', borderRadius: '16px',
                                                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)',
                                                        fontSize: '0.9rem', fontWeight: '900',
                                                        cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        LOCKED
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Betting Modal */}
            {selectedEvent && (
                <div
                    className="modal-overlay flex-center"
                    style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="glass-panel animate-scale-up"
                        style={{ width: '95%', maxWidth: '500px', borderRadius: '24px', background: '#000', border: '1px solid #333', overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PredictionCard event={selectedEvent} user={user} onClose={() => setSelectedEvent(null)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function PredictionCard({ event, user, onClose }: { event: any, user: any, onClose: () => void }) {
    const queryClient = useQueryClient();
    const expires = new Date(event.expires_at);
    const timeLeft = Math.max(0, expires.getTime() - Date.now());
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    const betMutation = useMutation({
        mutationFn: async ({ amount, choice }: { amount: number, choice: string }) => {
            const res = await fetch('/api/game/prediction/bet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: event.id,
                    user_id: user.id,
                    amount,
                    choice
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Bet failed');
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['active-predictions'] });
            onClose();
            window.location.reload();
            alert(`BET PLACED! Balance: ${data.newBalance}`);
        },
        onError: (err: any) => alert(err.message)
    });

    const handleBet = (amount: number, choice: 'option_1' | 'option_2') => {
        if (confirm(`Confirm ${amount} FLOW bet on ${choice === 'option_1' ? 'KING' : 'QUEEN'}?`)) {
            betMutation.mutate({ amount, choice });
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {betMutation.isPending && (
                <div className="flex-center" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10, flexDirection: 'column' }}>
                    <div className="loader" />
                    <p style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--gold)' }}>PLACING BET...</p>
                </div>
            )}

            {/* Header */}
            <div style={{ padding: '24px', textAlign: 'center', borderBottom: '1px solid #222', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>
                <div className="flex-center" style={{ gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--rose)', borderRadius: '50%', boxShadow: '0 0 10px var(--rose)' }} className="animate-pulse" />
                    <span style={{ fontSize: '0.7rem', color: 'var(--rose)', fontWeight: '900', letterSpacing: '1px' }}>ENDING IN {hours}h {minutes}m</span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>{event.question}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Min Entry: <span style={{ color: 'var(--emerald)' }}>{event.min_bet} FLOW</span></p>
            </div>

            {/* Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
                {/* KING SIDE */}
                <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '140px', height: '190px', position: 'relative', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}>
                        <Image
                            src="/assets/king.png"
                            alt="King Card"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '20px' }}>KING</span>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                        {[10, 50, 100].map(amt => (
                            <button
                                key={amt}
                                onClick={() => handleBet(amt, 'option_1')}
                                className="btn"
                                style={{ padding: '12px 20px', background: 'var(--primary)', color: '#000', borderRadius: '12px', fontWeight: '900', fontSize: '0.85rem' }}
                            >
                                BUY {amt}
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>POOL: {(event.pool_1 || 0).toLocaleString()}</p>
                </div>

                <div style={{ width: '1px', background: '#222' }} />

                {/* QUEEN SIDE */}
                <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '140px', height: '190px', position: 'relative', marginBottom: '20px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(236, 72, 153, 0.3)' }}>
                        <Image
                            src="/assets/queen.png"
                            alt="Queen Card"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--secondary)', marginBottom: '20px' }}>QUEEN</span>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                        {[10, 50, 100].map(amt => (
                            <button
                                key={amt}
                                onClick={() => handleBet(amt, 'option_2')}
                                className="btn"
                                style={{ padding: '12px 20px', background: 'var(--secondary)', color: '#000', borderRadius: '12px', fontWeight: '900', fontSize: '0.85rem' }}
                            >
                                BUY {amt}
                            </button>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>POOL: {(event.pool_2 || 0).toLocaleString()}</p>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', textAlign: 'center', borderTop: '1px solid #222' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>TOTAL POOL: <span style={{ color: '#fff', fontWeight: 'bold' }}>{((event.pool_1 || 0) + (event.pool_2 || 0)).toLocaleString()} FLOW</span></p>
            </div>
        </div>
    );
}
