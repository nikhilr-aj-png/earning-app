"use client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trophy, History, Gamepad2, X, ChevronLeft, Crown, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function GameHub() {
    const { user, loading, refreshUser } = useUser();
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
        refetchInterval: 5000
    });

    const { data: playHistory = [] } = useQuery({
        queryKey: ['bet-history', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await fetch('/api/game/prediction/history', {
                headers: { 'x-user-id': user.id }
            });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!user?.id
    });

    const queryClient = useQueryClient();
    const [resolutionData, setResolutionData] = useState<any>(null);
    const [timeOffset, setTimeOffset] = useState(0);

    // AUTO-LOOP: Poll every 5s to progress game state & Sync Data
    useQuery({
        queryKey: ['game-loop-tick'],
        queryFn: async () => {
            const res = await fetch('/api/game/loop');
            const data = await res.json();

            // 1. Sync Time
            if (data.server_time) {
                const serverTime = new Date(data.server_time).getTime();
                const clientTime = Date.now();
                setTimeOffset(serverTime - clientTime);
            }

            // 2. Real-time Updates: Handle Resolution with 3s Delay
            if (data.status === 'resolved' && data.resolved_games?.length > 0) {
                // A. Show Result Overlay immediately
                setResolutionData(data.resolved_games[0]);

                // B. Wait 3 seconds for "Reveal Animation"
                setTimeout(async () => {
                    setResolutionData(null); // Clear overlay 

                    // C. Refresh Data (Fetch New Game + History)
                    await Promise.all([
                        queryClient.invalidateQueries({ queryKey: ['active-predictions'] }),
                        queryClient.invalidateQueries({ queryKey: ['games-list'] }),
                        queryClient.invalidateQueries({ queryKey: ['bet-history'] }),
                        queryClient.invalidateQueries({ queryKey: ['bet-check'] }), // Ensure card unlocks for new game
                        refreshUser()
                    ]);
                }, 3000);
            }
            else if (data.status === 'restarted') {
                // Immediate refresh if just restarted (fallback)
                queryClient.invalidateQueries({ queryKey: ['active-predictions'] });
            }
            return true;
        },
        refetchInterval: 5000,
        refetchOnWindowFocus: true
    });

    // Auto-Switch to New Game logic
    useEffect(() => {
        // If the modal is open (selectedEvent exists) AND we have a new active prediction
        // AND the current selectedEvent is expired/resolved... switch to the new one.
        if (selectedEvent && predictions && predictions.length > 0) {
            const latestGame = predictions[0];
            // If current game ID is different from latest (meaning we moved to next round)
            if (selectedEvent.id !== latestGame.id) {
                // Only switch if current is expired or we just finished resolution
                const now = Date.now() + timeOffset;
                if (new Date(selectedEvent.expires_at).getTime() < now) {
                    setSelectedEvent(latestGame);
                }
            }
        }
    }, [predictions, selectedEvent, timeOffset]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) return null;

    const allGames = [
        ...(predictions || []).map((p: any) => ({ ...p, type: 'prediction', id: p.id, title: p.question || 'Card Game' })),
        ...(games || []).map((g: any) => ({ ...g, type: 'standard' }))
    ];

    return (
        <div className="animate-fade-in" style={{ minHeight: '100vh', position: 'relative', background: '#000', paddingBottom: '80px', overflowX: 'hidden', width: '100%' }}>
            {/* Background Blurs Layer - Contained to prevent overflow */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', top: '10%', right: '0', width: '500px', height: '500px', background: 'var(--violet)', filter: 'blur(180px)', opacity: 0.08 }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '0', width: '500px', height: '500px', background: 'var(--sapphire)', filter: 'blur(180px)', opacity: 0.08 }} />
            </div>

            <div style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '24px 16px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Horizontal History Strip */}
                {playHistory && playHistory.length > 0 && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(0,0,0,0.8))',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div className="flex-between" style={{ marginBottom: '12px' }}>
                            <div className="flex-center" style={{ gap: '8px' }}>
                                <History size={16} color="var(--primary)" strokeWidth={2.5} />
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '950',
                                    color: '#fff',
                                    letterSpacing: '1px'
                                }}>RECENT RESULTS</span>
                            </div>
                            <span style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-dim)',
                                fontWeight: '700'
                            }}>
                                Last {Math.min(playHistory.length, 15)} Games
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            overflowX: 'auto',
                            paddingBottom: '8px'
                        }}>
                            {playHistory.slice(0, 15).map((bet: any, index: number) => {
                                const isWinner = bet.prediction_events?.winning_option === bet.choice;
                                const wonKing = bet.prediction_events?.winning_option === 'option_1';

                                return (
                                    <div
                                        key={bet.id || index}
                                        style={{
                                            minWidth: '85px',
                                            padding: '12px',
                                            borderRadius: '12px',
                                            background: isWinner
                                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(0,0,0,0.6))'
                                                : 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(0,0,0,0.6))',
                                            border: `1px solid ${isWinner ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '8px',
                                            position: 'relative'
                                        }}
                                    >
                                        {isWinner && (
                                            <Crown size={10} color="var(--gold)" fill="var(--gold)" style={{ position: 'absolute', top: '6px', right: '6px' }} />
                                        )}
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            background: wonKing ? 'var(--primary)' : 'var(--secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            fontWeight: '900',
                                            color: '#000',
                                            boxShadow: `0 4px 12px ${wonKing ? 'rgba(59, 130, 246, 0.5)' : 'rgba(236, 72, 153, 0.5)'}`
                                        }}>
                                            {wonKing ? 'KING' : 'QUEEN'}
                                        </div>
                                        <span style={{
                                            fontSize: '0.68rem',
                                            fontWeight: '950',
                                            color: isWinner ? 'var(--emerald)' : 'var(--rose)',
                                            letterSpacing: '0.3px'
                                        }}>
                                            {isWinner ? `+${bet.payout || 0}` : `-${bet.amount}`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Link href="/dashboard" className="flex-center" style={{
                        gap: '6px',
                        marginBottom: '18px',
                        width: 'fit-content',
                        textDecoration: 'none',
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        letterSpacing: '0.8px',
                        transition: 'color 0.3s'
                    }}>
                        <ChevronLeft size={15} />
                        BACK TO DASHBOARD
                    </Link>

                    <div className="flex-between">
                        <div>
                            <div className="flex-center" style={{ gap: '12px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, var(--rose), var(--violet))',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(244, 63, 94, 0.3)'
                                }}>
                                    <Gamepad2 size={20} color="#000" strokeWidth={2.5} />
                                </div>
                                <h1 style={{
                                    fontSize: '2.2rem',
                                    fontWeight: '950',
                                    color: '#fff',
                                    margin: 0,
                                    letterSpacing: '-0.8px'
                                }}>ALL GAMES</h1>
                            </div>
                            <p style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-dim)',
                                margin: 0,
                                letterSpacing: '0.8px',
                                fontWeight: '700'
                            }}>
                                {allGames.length} EXPERIENCE{allGames.length !== 1 ? 'S' : ''} AVAILABLE
                            </p>
                        </div>

                        <div className="glass-panel" style={{
                            padding: '14px 22px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0,0,0,0.5))',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)'
                        }}>
                            <div className="flex-center" style={{ gap: '10px' }}>
                                <div style={{
                                    width: '9px',
                                    height: '9px',
                                    background: 'var(--emerald)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 14px var(--emerald)'
                                }} />
                                <span style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '950',
                                    color: '#fff',
                                    letterSpacing: '-0.4px'
                                }}>
                                    {user.coins.toLocaleString()}
                                </span>
                                <span style={{
                                    fontSize: '0.62rem',
                                    color: 'var(--emerald)',
                                    fontWeight: '900',
                                    letterSpacing: '0.8px'
                                }}>FLOW</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Grid */}
                {isLoading ? (
                    <div className="flex-center" style={{ height: '300px', flexDirection: 'column', gap: '16px' }}>
                        <div className="loader" style={{ borderTopColor: 'var(--primary)' }} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '2px' }}>LOADING GAMES...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {allGames.map((game: any, index: number) => (
                            <GameCard key={game.id || index} game={game} index={index} setSelectedEvent={setSelectedEvent} timeOffset={timeOffset} />
                        ))}
                    </div>
                )}
            </div>

            {/* Split-Screen Game Modal */}
            {selectedEvent && (
                <div
                    className="modal-overlay"
                    style={{ zIndex: 1000, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)' }}
                    onClick={() => setSelectedEvent(null)}
                >
                    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '40px' }}>
                        <PredictionCard
                            event={selectedEvent}
                            user={user}
                            onClose={() => setSelectedEvent(null)}
                            timeOffset={timeOffset}
                            resolutionData={resolutionData} // PASS THE RESULT
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function GameCard({ game, index, setSelectedEvent, timeOffset }: any) {
    if (game.type === 'prediction') {
        const [now, setNow] = useState(Date.now() + (timeOffset || 0));

        useEffect(() => {
            const interval = setInterval(() => {
                setNow(Date.now() + (timeOffset || 0));
            }, 100); // Update every 100ms for smoothness
            return () => clearInterval(interval);
        }, [timeOffset]);

        const expires = new Date(game.expires_at);
        const timeLeft = Math.max(0, expires.getTime() - now);
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        return (
            <div className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="glass-panel" style={{
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    background: 'linear-gradient(165deg, rgba(20, 20, 20, 0.6) 0%, rgba(10, 10, 10, 0.95) 100%)',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 50px -10px rgba(244, 63, 94, 0.3)';
                        e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.5)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                >
                    {/* Header Image Area */}
                    <div style={{
                        height: '180px',
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden'
                    }}>
                        {/* Target Audience Badge */}
                        <div style={{
                            position: 'absolute', top: '12px', left: '12px',
                            background: game.target_audience === 'premium' ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' :
                                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: game.target_audience === 'premium' ? '#000' : '#fff',
                            fontSize: '0.6rem', fontWeight: '950', padding: '4px 10px',
                            borderRadius: '8px', letterSpacing: '0.8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 10,
                            textTransform: 'uppercase'
                        }}>
                            {game.target_audience === 'premium' ? 'PREMIUM' : 'EVERYONE'}
                        </div>

                        {/* Countdown Badge */}
                        <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: timeLeft > 0 ? 'rgba(244, 63, 94, 0.9)' : 'rgba(100, 100, 100, 0.9)',
                            backdropFilter: 'blur(8px)',
                            color: '#fff',
                            fontSize: '0.65rem', fontWeight: '800', padding: '6px 10px',
                            borderRadius: '12px', letterSpacing: '0.5px',
                            boxShadow: timeLeft > 0 ? '0 4px 12px rgba(244, 63, 94, 0.4)' : 'none',
                            zIndex: 10,
                            display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                            {timeLeft > 0 ? (
                                <>
                                    <Clock size={12} strokeWidth={3} />
                                    {minutes}m {seconds}s
                                </>
                            ) : (
                                "EXPIRED"
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', zIndex: 1 }}>
                            {/* Option 1 Image */}
                            <div style={{
                                width: '70px',
                                height: '90px',
                                background: '#1a1a1a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                                border: '2px solid rgba(255,255,255,0.1)',
                                transform: 'rotate(-6deg)',
                                transition: 'transform 0.3s ease'
                            }}>
                                <Image
                                    src={game.option_1_image || "/assets/king.png"}
                                    alt="Option 1"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>

                            <span style={{
                                fontSize: '1.5rem',
                                color: '#fff',
                                fontWeight: '900',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                fontStyle: 'italic',
                                opacity: 0.9
                            }}>VS</span>

                            {/* Option 2 Image */}
                            <div style={{
                                width: '70px',
                                height: '90px',
                                background: '#1a1a1a',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                                border: '2px solid rgba(255,255,255,0.1)',
                                transform: 'rotate(6deg)',
                                transition: 'transform 0.3s ease'
                            }}>
                                <Image
                                    src={game.option_2_image || "/assets/queen.png"}
                                    alt="Option 2"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            color: '#fff',
                            marginBottom: '16px',
                            letterSpacing: '-0.5px',
                            lineHeight: '1.2'
                        }}>
                            {game.title}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', flex: 1 }}>
                            <div className="flex-between">
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                                    {game.bet_mode === 'fixed' ? 'Fixed Entry' : 'Min Entry'}
                                </span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--emerald)', fontWeight: '800' }}>{game.min_bet} FLOW</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (timeLeft > 0) setSelectedEvent(game);
                            }}
                            disabled={timeLeft <= 0}
                            className={timeLeft > 0 ? "btn-shimmer" : ""}
                            style={{
                                width: '100%', height: '52px', borderRadius: '14px',
                                background: timeLeft > 0 ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : '#333',
                                color: timeLeft > 0 ? '#fff' : '#888',
                                fontSize: '0.9rem', fontWeight: '800',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                letterSpacing: '1px',
                                border: 'none',
                                boxShadow: timeLeft > 0 ? '0 4px 15px rgba(244, 63, 94, 0.4)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'uppercase',
                                cursor: timeLeft > 0 ? 'pointer' : 'not-allowed',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (timeLeft > 0) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(244, 63, 94, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (timeLeft > 0) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 63, 94, 0.4)';
                                }
                            }}
                        >
                            {timeLeft > 0 ? (
                                <>PLAY NOW <Play size={18} fill="currentColor" /></>
                            ) : (
                                <>EVENT EXPIRED <Clock size={18} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="glass-panel" style={{
                borderRadius: '18px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(0,0,0,0.9))',
                transition: 'all 0.3s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    height: '140px',
                    background: index % 2 === 0 ? 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)' : 'linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {game.status === 'active' && (
                        <div style={{
                            position: 'absolute', top: '10px', right: '10px',
                            background: 'var(--emerald)', color: '#000',
                            fontSize: '0.55rem', fontWeight: '950', padding: '3px 8px',
                            borderRadius: 'full', letterSpacing: '0.6px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.5)'
                        }}>LIVE</div>
                    )}
                    {game.status === 'coming_soon' && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'var(--text-dim)',
                                fontSize: '0.6rem',
                                fontWeight: '950',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                letterSpacing: '1px'
                            }}>COMING SOON</div>
                        </div>
                    )}
                    <Trophy size={50} color="rgba(255,255,255,0.12)" strokeWidth={1} />
                </div>

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                        {game.title}
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '18px', flex: 1, fontWeight: '600' }}>
                        {game.description}
                    </p>

                    {game.status === 'active' ? (
                        <Link href={game.route_path} className="btn" style={{
                            width: '100%', height: '48px', borderRadius: '12px',
                            background: 'var(--primary)', color: '#000',
                            fontSize: '0.82rem', fontWeight: '950',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            letterSpacing: '0.8px',
                            textDecoration: 'none'
                        }}>
                            PLAY <Play size={16} fill="currentColor" />
                        </Link>
                    ) : (
                        <button disabled className="btn" style={{
                            width: '100%', height: '48px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)',
                            fontSize: '0.82rem', fontWeight: '950',
                            cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.03)',
                            letterSpacing: '0.8px'
                        }}>
                            LOCKED
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function PredictionCard({ event, user, onClose, timeOffset, resolutionData }: { event: any, user: any, onClose: () => void, timeOffset: number, resolutionData?: any }) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [now, setNow] = useState(Date.now() + (timeOffset || 0));

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now() + (timeOffset || 0));
        }, 100);
        return () => clearInterval(interval);
    }, [timeOffset]);

    const expires = new Date(event.expires_at);
    // SYNCED TIME
    const timeLeft = Math.max(0, expires.getTime() - now);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    // Fetch history SPECIFICALLY for this event to ensure lock state is accurate
    // (Bypasses the 50-item limit of general history)
    const { data: eventHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: ['bet-check', user?.id, event?.id], // Unique key for this event
        queryFn: async () => {
            if (!user?.id || !event?.id) return [];
            const res = await fetch(`/api/game/prediction/history?event_id=${event.id}`, {
                headers: { 'x-user-id': user.id }
            });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!user?.id && !!event?.id,
        refetchInterval: 5000,
        refetchOnMount: 'always',
        staleTime: 0
    });

    // Check if user already has a bet on this event
    // Using String() to ensure type safety (UUID vs string vs number)
    const betOnOption1 = eventHistory.find((b: any) => String(b.event_id) === String(event?.id) && b.choice === 'option_1');
    const betOnOption2 = eventHistory.find((b: any) => String(b.event_id) === String(event?.id) && b.choice === 'option_2');

    // Use Object to track multiple local bets with amounts
    const [localBets, setLocalBets] = useState<Record<string, number>>({});

    const onOption1 = !!betOnOption1 || localBets.hasOwnProperty('option_1');
    const onOption2 = !!betOnOption2 || localBets.hasOwnProperty('option_2');

    const [betAmount, setBetAmount] = useState(event.bet_mode === 'fixed' ? event.min_bet.toString() : '10');

    // Determine display amount: Prefer server data, fallback to local fixed amount
    const wagerAmount1 = betOnOption1 ? betOnOption1.amount : localBets['option_1'];
    const wagerAmount2 = betOnOption2 ? betOnOption2.amount : localBets['option_2'];

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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['active-predictions'] });
            queryClient.invalidateQueries({ queryKey: ['bet-history'] });
            showToast(`BET PLACED! Balance: ${data.newBalance}`, 'success');
            // Keep local lock for this specific choice
        },
        onError: (err: any, variables) => {
            showToast(err.message, 'error');
            // Unlock specific choice on error
            setLocalBets(prev => {
                const newRecord = { ...prev };
                delete newRecord[variables.choice];
                return newRecord;
            });
        }
    });

    const handleBet = (amount: number, choice: 'option_1' | 'option_2') => {
        if ((choice === 'option_1' && onOption1) || (choice === 'option_2' && onOption2)) return;

        if (user.coins < amount) {
            showToast(`Insufficient balance! Need ${amount} FLOW`, 'error');
            return;
        }
        // Optimistically lock with specific amount
        setLocalBets(prev => ({ ...prev, [choice]: amount }));
        betMutation.mutate({ amount, choice });
    };

    return (
        <div style={{
            width: '95vw',
            maxWidth: '1600px',
            height: '85vh',
            margin: 'auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            background: '#000',
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
            border: '2px solid #333'
        }}>
            {/* RESULT OVERLAY */}
            {resolutionData && resolutionData.id === event.id && (
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 100,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div className="animate-bounce" style={{ marginBottom: '20px' }}>
                        {resolutionData.winner === 'tie' ? (
                            <div style={{ fontSize: '4rem' }}>🤝</div>
                        ) : (
                            <div style={{
                                width: '120px', height: '160px',
                                background: resolutionData.winner === 'option_1' ? 'var(--primary)' : 'var(--secondary)',
                                borderRadius: '16px', padding: '4px',
                                boxShadow: resolutionData.winner === 'option_1'
                                    ? '0 0 50px rgba(59, 130, 246, 0.6)'
                                    : '0 0 50px rgba(236, 72, 153, 0.6)'
                            }}>
                                <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                                    <Image
                                        src={resolutionData.winner === 'option_1' ? '/assets/king.png' : '/assets/queen.png'}
                                        fill alt="Winner" style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <h2 style={{
                        fontSize: '3rem', fontWeight: '950', color: '#fff', margin: 0,
                        textTransform: 'uppercase', letterSpacing: '2px',
                        textShadow: '0 4px 20px rgba(255,255,255,0.4)'
                    }}>
                        {resolutionData.winner === 'tie' ? 'DRAW!' :
                            resolutionData.winner === 'option_1' ? 'KING WINS!' : 'QUEEN WINS!'}
                    </h2>
                    {resolutionData.isTie && (
                        <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontSize: '1rem', fontWeight: '600' }}>
                            50% REFUND ISSUED
                        </p>
                    )}
                </div>
            )}

            {/* REMOVED BLOCKING LOADER */}

            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    cursor: 'pointer',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20
                }}
            >
                <X size={24} strokeWidth={2.5} />
            </button>

            {/* COLUMN 1 (50%) - GAME AREA */}
            <div style={{
                gridColumn: '1',
                gridRow: '1 / 3',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #000 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '30px',
                position: 'relative',
                borderRight: '2px solid #333'
            }}>
                {/* Target Audience Badge - NEW */}
                <div style={{
                    position: 'absolute', top: '20px', left: '20px',
                    background: event.target_audience === 'premium' ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' :
                        event.target_audience === 'free' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                            'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: event.target_audience === 'premium' ? '#000' : '#fff',
                    fontSize: '0.7rem', fontWeight: '950', padding: '6px 12px',
                    borderRadius: '8px', letterSpacing: '0.8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 20,
                    textTransform: 'uppercase'
                }}>
                    {event.target_audience === 'all' ? 'EVERYONE' : event.target_audience}
                </div>

                {/* ... (Timer) ... */}

                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '6px 14px',
                    background: 'rgba(244, 63, 94, 0.18)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <div style={{ width: '6px', height: '6px', background: 'var(--rose)', borderRadius: '50%', boxShadow: '0 0 8px var(--rose)' }} className="animate-pulse" />
                    <span style={{ fontSize: '0.68rem', color: 'var(--rose)', fontWeight: '950', letterSpacing: '0.8px' }}>
                        {minutes}m {seconds}s LEFT
                    </span>
                </div>

                {/* King vs Queen - Larger cards */}
                <div style={{
                    display: 'flex',
                    gap: '30px',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    marginBottom: '0'
                }}>
                    {/* King Card + Button */}
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animationDelay: '0.1s' }}>
                        <div style={{
                            width: '260px',
                            height: '340px',
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.4)',
                            border: '4px solid rgba(59, 130, 246, 0.8)',
                            transform: 'rotate(-4deg)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'rotate(-2deg) scale(1.05) translateY(-10px)';
                                e.currentTarget.style.borderColor = '#60a5fa';
                                e.currentTarget.style.boxShadow = '0 30px 80px rgba(59, 130, 246, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'rotate(-4deg) scale(1) translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.8)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(59, 130, 246, 0.4)';
                            }}
                        >
                            <Image src={event.option_1_image || "/assets/king.png"} alt="Option 1" fill style={{ objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 10%, transparent)',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '2px', textShadow: '0 2px 10px rgba(59, 130, 246, 0.8)' }}>
                                    {event.option_1_label || 'KING'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const amount = parseInt(betAmount || '10');
                                if (amount >= event.min_bet && user.coins >= amount) {
                                    handleBet(amount, 'option_1');
                                }
                            }}
                            disabled={betMutation.isPending || onOption1}
                            className={onOption1 ? "" : "btn-shimmer"}
                            style={{
                                width: '260px',
                                padding: '16px',
                                background: isHistoryLoading ? 'rgba(255,255,255,0.1)' :
                                    onOption1 ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                color: onOption1 ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: '900',
                                letterSpacing: '1px',
                                boxShadow: isHistoryLoading ? 'none' :
                                    onOption1 ? '0 4px 15px rgba(255, 215, 0, 0.4)' : '0 8px 25px rgba(37, 99, 235, 0.4)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                textTransform: 'uppercase',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: (isHistoryLoading || onOption1 || event.status !== 'active') ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                if (!onOption1) {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!onOption1) {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                                }
                            }}
                        >
                            {isHistoryLoading ? 'CHECKING...' :
                                onOption1 ? `LOCKED ${wagerAmount1} 🔒` : 'BUY'
                            }
                        </button>
                    </div>

                    {/* VS Badge, centered */}
                    <div style={{
                        alignSelf: 'center',
                        fontSize: '4.5rem',
                        fontWeight: '900',
                        fontStyle: 'italic',
                        background: 'linear-gradient(to right, #60a5fa, #f472b6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))',
                        animation: 'pulse 2s infinite',
                        margin: '0 20px',
                        transform: 'translate(-20px, -30px)', // Lift to center, nudge left
                        zIndex: 20
                    }}>VS</div>

                    {/* Queen Card + Button */}
                    <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animationDelay: '0.2s' }}>

                        <div style={{
                            width: '260px',
                            height: '340px',
                            position: 'relative',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(236, 72, 153, 0.4)',
                            border: '4px solid rgba(236, 72, 153, 0.8)',
                            transform: 'rotate(4deg)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'rotate(2deg) scale(1.05) translateY(-10px)';
                                e.currentTarget.style.borderColor = '#f472b6';
                                e.currentTarget.style.boxShadow = '0 30px 80px rgba(236, 72, 153, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'rotate(4deg) scale(1) translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.8)';
                                e.currentTarget.style.boxShadow = '0 20px 60px rgba(236, 72, 153, 0.4)';
                            }}
                        >
                            <Image src={event.option_2_image || "/assets/queen.png"} alt="Option 2" fill style={{ objectFit: 'cover' }} />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 10%, transparent)',
                                textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', letterSpacing: '2px', textShadow: '0 2px 10px rgba(236, 72, 153, 0.8)' }}>
                                    {event.option_2_label || 'QUEEN'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const amount = parseInt(betAmount || '10');
                                if (amount >= event.min_bet && user.coins >= amount) {
                                    handleBet(amount, 'option_2');
                                }
                            }}
                            disabled={betMutation.isPending || onOption2}
                            className={onOption2 ? "" : "btn-shimmer"}
                            style={{
                                width: '260px',
                                padding: '16px',
                                background: isHistoryLoading ? 'rgba(255,255,255,0.1)' :
                                    onOption2 ? 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)' : 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
                                color: onOption2 ? '#000' : '#fff',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '1rem',
                                fontWeight: '900',
                                cursor: (isHistoryLoading || onOption2 || event.status !== 'active') ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                if (!onOption2) {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(219, 39, 119, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!onOption2) {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(219, 39, 119, 0.4)';
                                }
                            }}
                        >
                            {isHistoryLoading ? 'CHECKING...' :
                                onOption2 ? `LOCKED ${wagerAmount2} 🔒` : 'BUY'
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* TOP RIGHT (25%) - HISTORY */}
            <div style={{
                gridColumn: '2',
                gridRow: '1',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.09), rgba(0,0,0,0.96))',
                borderBottom: '2px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '26px 22px 18px',
                    borderBottom: '2px solid #333'
                }}>
                    <div className="flex-center" style={{ gap: '10px', justifyContent: 'flex-start' }}>
                        <History size={18} color="var(--primary)" strokeWidth={2.5} />
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: '950',
                            color: '#fff',
                            margin: 0,
                            letterSpacing: '1.2px'
                        }}>
                            RECENT RESULTS
                        </h3>
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}>
                    {eventHistory && eventHistory.length > 0 ? (
                        eventHistory.map((bet: any, index: number) => {
                            const isWinner = bet.prediction_events?.winning_option === bet.choice;
                            const wonKing = bet.prediction_events?.winning_option === 'option_1';

                            return (
                                <div
                                    key={bet.id || index}
                                    style={{
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        background: isWinner
                                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(0,0,0,0.6))'
                                            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(0,0,0,0.6))',
                                        border: `1px solid ${isWinner ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '54px',
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        border: `2px solid ${wonKing ? 'var(--primary)' : 'var(--secondary)'}`,
                                        boxShadow: `0 4px 12px ${wonKing ? 'rgba(59, 130, 246, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
                                        flexShrink: 0
                                    }}>
                                        <Image
                                            src={wonKing ? '/assets/king.png' : '/assets/queen.png'}
                                            alt={wonKing ? 'King' : 'Queen'}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '950',
                                            color: isWinner ? 'var(--emerald)' : 'var(--rose)',
                                            margin: 0,
                                            letterSpacing: '0.4px'
                                        }}>
                                            {isWinner ? `+${bet.payout || 0}` : `-${bet.amount}`} FLOW
                                        </p>
                                    </div>
                                    {isWinner && (
                                        <Crown size={13} color="var(--gold)" fill="var(--gold)" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex-center" style={{ flex: 1, flexDirection: 'column', gap: '12px', opacity: 0.25 }}>
                            <History size={38} color="var(--text-dim)" />
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center', margin: 0 }}>
                                No game history yet
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM RIGHT (25%) - BETTING CONTROLS */}
            <div style={{
                gridColumn: '2',
                gridRow: '2',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.09), rgba(0,0,0,0.96))',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '26px 22px 18px',
                    borderBottom: '2px solid #333'
                }}>
                    <div className="flex-between" style={{ marginBottom: '10px' }}>
                        <h3 style={{
                            fontSize: '0.9rem',
                            fontWeight: '950',
                            color: '#fff',
                            margin: 0,
                            letterSpacing: '1.2px'
                        }}>
                            PLACE BET
                        </h3>
                        <div style={{
                            padding: '5px 12px',
                            background: 'rgba(16, 185, 129, 0.17)',
                            border: '1px solid rgba(16, 185, 129, 0.28)',
                            borderRadius: '8px'
                        }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: '950' }}>
                                {user.coins.toLocaleString()} FLOW
                            </span>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', margin: 0, fontWeight: '700' }}>
                        Min Bet: <span style={{ color: 'var(--emerald)' }}>{event.min_bet} FLOW</span>
                    </p>
                </div>

                <div style={{
                    flex: 1,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    overflowY: 'auto'
                }}>
                    {/* Bet Controls - Conditional based on Mode */}
                    {event.bet_mode === 'fixed' ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '12px',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                FIXED WAGER AMOUNT
                            </span>
                            <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', textShadow: '0 2px 10px rgba(59, 130, 246, 0.5)' }}>
                                {parseInt(betAmount).toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--primary)' }}>FLOW</span>
                            </span>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                *This event has a fixed entry fee
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Quick Bet Buttons */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {[10, 25, 50, 100, 250].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setBetAmount(amount.toString())}
                                        style={{
                                            flex: '1 1 calc(20% - 6px)',
                                            minWidth: '50px',
                                            padding: '10px 6px',
                                            background: betAmount === amount.toString() ? 'var(--primary)' : 'rgba(59, 130, 246, 0.15)',
                                            border: `1px solid ${betAmount === amount.toString() ? 'var(--primary)' : 'rgba(59, 130, 246, 0.3)'}`,
                                            borderRadius: '8px',
                                            color: betAmount === amount.toString() ? '#000' : 'var(--primary)',
                                            fontSize: '0.8rem',
                                            fontWeight: '950',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Amount Input + SET Button */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    placeholder="Enter coins"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    style={{
                                        padding: '10px 20px',
                                        background: 'var(--emerald)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#000',
                                        fontSize: '0.8rem',
                                        fontWeight: '950',
                                        cursor: 'pointer'
                                    }}
                                >
                                    SET
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}
