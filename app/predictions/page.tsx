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

export default function PredictionsPage() {
    const { user, refreshUser } = useUser();
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
            alert("TRADE EXECUTED SUCCESSFULLY!");
            refreshUser();
            setSelectedEvent(null);
            setTradeChoice(null);
        },
        onError: (err: any) => {
            alert(err.message);
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
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '90vh' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <TrendingUp size={18} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px' }}>OPINION TRADING</span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '8px' }}>Predict & Earn</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Market insights and community opinions at your fingertips.</p>
            </div>

            {/* Categories */}
            <div className="flex" style={{ gap: '12px', overflowX: 'auto', marginBottom: '32px', paddingBottom: '4px' }}>
                {['All', 'Finance', 'Crypto', 'Gaming', 'News'].map((cat) => (
                    <button key={cat} className="glass-panel" style={{
                        padding: '8px 20px', fontSize: '0.75rem', fontWeight: '800',
                        whiteSpace: 'nowrap', borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        background: cat === 'All' ? 'var(--primary-glow)' : 'transparent',
                        color: cat === 'All' ? 'var(--primary)' : 'var(--text-dim)'
                    }}>
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Events List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {events.length === 0 ? (
                    <div className="glass-panel flex-center" style={{ padding: '60px', flexDirection: 'column', gap: '16px', borderStyle: 'dashed' }}>
                        <AlertCircle size={32} color="var(--text-muted)" />
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active markets at the moment.</p>
                    </div>
                ) : events.map((event) => (
                    <div key={event.id} className="glass-panel" style={{ padding: '24px', border: '1px solid var(--glass-border)' }}>
                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {event.category}
                            </span>
                            <div className="flex-center" style={{ gap: '6px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                <Clock size={12} />
                                <span>Ends: {new Date(event.end_time).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', lineHeight: '1.4' }}>{event.question}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('yes'); }}
                                className="glass-panel flex-center"
                                style={{
                                    padding: '14px', borderRadius: '14px', gap: '8px',
                                    border: '1px solid rgba(0, 255, 163, 0.2)',
                                    color: 'var(--success)', fontWeight: '900'
                                }}
                            >
                                <TrendingUp size={18} /> YES
                            </button>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('no'); }}
                                className="glass-panel flex-center"
                                style={{
                                    padding: '14px', borderRadius: '14px', gap: '8px',
                                    border: '1px solid rgba(255, 77, 77, 0.2)',
                                    color: 'var(--error)', fontWeight: '900'
                                }}
                            >
                                <TrendingDown size={18} /> NO
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trading Modal Overlay */}
            {selectedEvent && (
                <div className="flex-center" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    padding: '24px'
                }}>
                    <div className="glass-panel animate-scale-in" style={{
                        width: '100%', maxWidth: '400px', padding: '32px',
                        border: `1px solid ${tradeChoice === 'yes' ? 'var(--success)' : 'var(--error)'}`
                    }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            CONFIRM YOUR TRADE
                        </h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '32px' }}>{selectedEvent.question}</p>

                        <div style={{ marginBottom: '32px' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Wager Amount</p>
                            <div className="flex-between" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px' }}>
                                <button onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '900' }}>-</button>
                                <span style={{ fontSize: '1.25rem', fontWeight: '900' }}>{tradeAmount} FLOW</span>
                                <button onClick={() => setTradeAmount(tradeAmount + 10)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '900' }}>+</button>
                            </div>
                        </div>

                        <div className="flex" style={{ gap: '12px' }}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="btn btn-secondary" style={{ flex: 1 }}>CANCEL</button>
                            <button
                                onClick={handleTrade}
                                disabled={tradeMutation.isPending}
                                className="btn" style={{
                                    flex: 2,
                                    background: tradeChoice === 'yes' ? 'var(--success)' : 'var(--error)',
                                    color: '#000'
                                }}>
                                {tradeMutation.isPending ? 'PROCESSING...' : 'PLACE TRADE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
