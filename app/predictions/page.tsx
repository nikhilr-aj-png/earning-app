"use client";

import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { Zap, TrendingUp, TrendingDown, Clock, Search, ChevronRight, BarChart3, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProboEvent {
    id: string;
    question: string;
    category: string;
    end_time: string;
    status: string;
}

import { useToast } from "@/context/ToastContext";

export default function PredictionsPage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [selectedEvent, setSelectedEvent] = useState<ProboEvent | null>(null);
    const [tradeChoice, setTradeChoice] = useState<'yes' | 'no' | null>(null);
    const [tradeAmount, setTradeAmount] = useState(10);

    const { data: events = [], isLoading } = useQuery<ProboEvent[]>({
        queryKey: ['probo-events'],
        queryFn: async () => {
            const res = await fetch("/api/probo/events");
            return res.json();
        }
    });

    const tradeMutation = useMutation({
        mutationFn: async (payload: { eventId: string, choice: string, amount: number }) => {
            const res = await fetch("/api/probo/trade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || ""
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error);
            }
            return res.json();
        },
        onSuccess: () => {
            showToast("TRADE EXECUTED SUCCESSFULLY", "success");
            refreshUser();
            setSelectedEvent(null);
            setTradeChoice(null);
        },
        onError: (err: any) => {
            showToast(err.message, "error");
        }
    });

    const handleTrade = () => {
        if (!selectedEvent || !tradeChoice) return;
        tradeMutation.mutate({
            eventId: selectedEvent.id,
            choice: tradeChoice,
            amount: tradeAmount
        });
    };

    if (isLoading) return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: 'var(--primary)', animation: 'pulse-glow 2s infinite' }}>
                <BarChart3 size={48} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '2px' }}>LOADING MARKETS...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '90vh', paddingBottom: '120px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '40px', position: 'relative' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '4px', borderRadius: '4px', background: 'var(--gold-glow)' }}>
                        <TrendingUp size={18} color="var(--gold)" strokeWidth={1.5} />
                    </div>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '4px' }}>INSIGHT TERMINAL</span>
                </div>
                <h1 className="font-heading" style={{ fontSize: '3.2rem', fontWeight: '950', letterSpacing: '-4px', marginBottom: '8px', lineHeight: 1.1 }}>Market Intelligence</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Leverage high-fidelity community intelligence to scale your assets.</p>
                {/* Visual Depth */}
                <div style={{ position: 'absolute', top: '0', right: '0', width: '250px', height: '100px', background: 'var(--gold)', filter: 'blur(120px)', opacity: 0.1 }} />
            </div>

            {/* Categories */}
            <div className="flex" style={{ gap: '10px', overflowX: 'auto', marginBottom: '40px', paddingBottom: '12px' }}>
                {['All', 'Finance', 'Crypto', 'Gaming', 'News'].map((cat) => (
                    <button key={cat} className="glass-panel" style={{
                        padding: '12px 28px', fontSize: '0.75rem', fontWeight: '950',
                        whiteSpace: 'nowrap', borderRadius: '8px',
                        border: cat === 'All' ? '1px solid var(--gold)' : '1px solid #111',
                        background: cat === 'All' ? 'var(--gold)' : 'rgba(255,255,255,0.01)',
                        color: cat === 'All' ? '#000' : 'var(--text-dim)',
                        letterSpacing: '2px',
                        transition: 'all 0.3s var(--transition)'
                    }}>
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Events List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {events.length === 0 ? (
                    <div className="glass-panel flex-center" style={{ padding: '80px', flexDirection: 'column', gap: '20px', border: '1px solid #111', borderRadius: '12px' }}>
                        <div style={{ padding: '16px', borderRadius: '50%', background: 'var(--gold-glow)' }}>
                            <AlertCircle size={32} color="var(--gold)" strokeWidth={1} />
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px' }}>NO ACTIVE MARKETS DETECTED.</p>
                    </div>
                ) : events.map((event) => (
                    <div key={event.id} className="glass-panel" style={{
                        padding: '40px',
                        border: '1px solid #111',
                        borderRadius: '12px',
                        background: 'rgba(5,5,5,0.8)',
                        transition: '0.5s',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="flex-between" style={{ marginBottom: '24px', position: 'relative', zIndex: 2 }}>
                            <div className="badge-gold" style={{ fontSize: '0.6rem', padding: '2px 10px', borderRadius: '4px', fontWeight: '950', letterSpacing: '2px' }}>
                                {event.category.toUpperCase()}
                            </div>
                            <div className="flex-center" style={{ gap: '8px', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '950' }}>
                                <Clock size={14} strokeWidth={1.5} />
                                <span style={{ letterSpacing: '1px' }}>EXPIRY: {new Date(event.end_time).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '950', marginBottom: '40px', lineHeight: '1.3', letterSpacing: '0.5px', color: '#fff' }}>{event.question.toUpperCase()}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('yes'); }}
                                className="btn"
                                style={{
                                    height: '60px', borderRadius: '8px', gap: '12px',
                                    border: 'none', background: 'var(--sapphire)',
                                    color: '#fff', fontWeight: '950', fontSize: '0.85rem', letterSpacing: '3px',
                                    boxShadow: '0 10px 30px rgba(0, 112, 243, 0.2)'
                                }}
                            >
                                <TrendingUp size={20} strokeWidth={2} /> BUY YES
                            </button>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('no'); }}
                                className="btn btn-secondary"
                                style={{
                                    height: '60px', borderRadius: '8px', gap: '12px',
                                    border: '1.5px solid var(--rose)', background: 'transparent',
                                    color: 'var(--rose)', fontWeight: '950', fontSize: '0.85rem', letterSpacing: '3px',
                                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)'
                                }}
                            >
                                <TrendingDown size={20} strokeWidth={2} /> BUY NO
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trading Modal Overlay - Vibrant Executive */}
            {selectedEvent && (
                <div className="flex-center animate-fade-in" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
                    padding: '24px'
                }}>
                    <div className="glass-panel glass-vibrant" style={{
                        width: '100%', maxWidth: '440px', padding: '48px',
                        border: '1px solid var(--sapphire)', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #001f3f 0%, #000 100%)',
                        boxShadow: '0 40px 80px rgba(0, 112, 243, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                                <div className="badge-gold" style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px' }}>EXECUTION PROTOCOL</div>
                            </div>
                            <h3 style={{ fontSize: '0.7rem', fontWeight: '950', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '3px' }}>
                                CONFIRM TRADE
                            </h3>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: '950', marginBottom: '40px', letterSpacing: '0.5px', lineHeight: '1.4', color: '#fff' }}>
                                {selectedEvent.question.toUpperCase()}
                            </h2>

                            <div style={{ marginBottom: '48px' }}>
                                <div className="flex-between" style={{ marginBottom: '16px' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '3px' }}>WAGER ALLOCATION</p>
                                    <span style={{ fontSize: '0.7rem', color: tradeChoice === 'yes' ? 'var(--sapphire)' : 'var(--rose)', fontWeight: '950', letterSpacing: '1px' }}>
                                        POSITION: {tradeChoice?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-between" style={{ background: 'rgba(0,0,0,0.5)', padding: '24px', border: '1px solid #111', borderRadius: '8px' }}>
                                    <button onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))} className="flex-center" style={{ width: '40px', height: '40px', background: 'transparent', border: '1px solid #222', color: '#fff', borderRadius: '50%', fontSize: '1.5rem', transition: '0.3s' }}>-</button>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: '2.2rem', fontWeight: '950', letterSpacing: '-2px', color: '#fff' }}>{tradeAmount}</span>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '2px' }}>FLOW CREDIT</p>
                                    </div>
                                    <button onClick={() => setTradeAmount(tradeAmount + 10)} className="flex-center" style={{ width: '40px', height: '40px', background: 'transparent', border: '1px solid #222', color: '#fff', borderRadius: '50%', fontSize: '1.5rem', transition: '0.3s' }}>+</button>
                                </div>
                            </div>

                            <div className="flex" style={{ gap: '16px' }}>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="btn btn-secondary" style={{ flex: 1, borderRadius: '8px', border: '1.5px solid #111', height: '64px', fontSize: '0.75rem' }}>CANCEL</button>
                                <button
                                    onClick={handleTrade}
                                    disabled={tradeMutation.isPending}
                                    className="btn" style={{
                                        flex: 2,
                                        background: tradeChoice === 'yes' ? 'var(--sapphire)' : 'var(--rose)',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '8px',
                                        height: '64px',
                                        fontWeight: '950',
                                        fontSize: '0.85rem',
                                        letterSpacing: '3px',
                                        boxShadow: tradeChoice === 'yes' ? '0 10px 30px rgba(0, 112, 243, 0.4)' : '0 10px 30px rgba(239, 68, 68, 0.4)'
                                    }}>
                                    {tradeMutation.isPending ? 'PROCESSING...' : `DEPLOY ${tradeChoice?.toUpperCase() || ''}`}
                                </button>
                            </div>
                        </div>
                        {/* Background Visual */}
                        <div style={{ position: 'absolute', bottom: '-20%', right: '-20%', width: '150px', height: '150px', background: tradeChoice === 'yes' ? 'var(--sapphire)' : 'var(--rose)', filter: 'blur(100px)', opacity: 0.15 }} />
                    </div>
                </div>
            )}
        </div>
    );
}
