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
            <div style={{ marginBottom: '40px' }}>
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <TrendingUp size={18} color="#fff" strokeWidth={1} />
                    <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '2px' }}>OPINION MARKETS</span>
                </div>
                <h1 className="font-heading" style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '8px' }}>Predict & Control</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', letterSpacing: '1px' }}>High-fidelity market sentiment and community intelligence.</p>
            </div>

            {/* Categories */}
            <div className="flex" style={{ gap: '8px', overflowX: 'auto', marginBottom: '40px', paddingBottom: '4px' }}>
                {['All', 'Finance', 'Crypto', 'Gaming', 'News'].map((cat) => (
                    <button key={cat} className="glass-panel" style={{
                        padding: '10px 24px', fontSize: '0.7rem', fontWeight: '900',
                        whiteSpace: 'nowrap', borderRadius: '2px',
                        border: cat === 'All' ? '1px solid #fff' : '1px solid #222',
                        background: cat === 'All' ? '#fff' : 'transparent',
                        color: cat === 'All' ? '#000' : 'var(--text-dim)',
                        letterSpacing: '1px'
                    }}>
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Events List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {events.length === 0 ? (
                    <div className="glass-panel flex-center" style={{ padding: '80px', flexDirection: 'column', gap: '20px', border: '1px solid #222', borderRadius: '4px' }}>
                        <AlertCircle size={32} color="var(--text-dim)" strokeWidth={1} />
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px' }}>NO ACTIVE MARKETS DETECTED.</p>
                    </div>
                ) : events.map((event) => (
                    <div key={event.id} className="glass-panel" style={{ padding: '32px', border: '1px solid #222', borderRadius: '4px' }}>
                        <div className="flex-between" style={{ marginBottom: '20px' }}>
                            <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {event.category}
                            </span>
                            <div className="flex-center" style={{ gap: '8px', fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900' }}>
                                <Clock size={12} strokeWidth={1} />
                                <span style={{ letterSpacing: '1px' }}>EXPIRY: {new Date(event.end_time).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px', lineHeight: '1.4', letterSpacing: '1px' }}>{event.question.toUpperCase()}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('yes'); }}
                                className="glass-panel flex-center"
                                style={{
                                    padding: '16px', borderRadius: '2px', gap: '12px',
                                    border: '1px solid #fff', background: '#fff',
                                    color: '#000', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '2px'
                                }}
                            >
                                <TrendingUp size={18} strokeWidth={2} /> BUY YES
                            </button>
                            <button
                                onClick={() => { setSelectedEvent(event); setTradeChoice('no'); }}
                                className="glass-panel flex-center"
                                style={{
                                    padding: '16px', borderRadius: '2px', gap: '12px',
                                    border: '1px solid #fff', background: 'transparent',
                                    color: '#fff', fontWeight: '900', fontSize: '0.75rem', letterSpacing: '2px'
                                }}
                            >
                                <TrendingDown size={18} strokeWidth={1} /> BUY NO
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trading Modal Overlay */}
            {selectedEvent && (
                <div className="flex-center" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)',
                    padding: '24px'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%', maxWidth: '400px', padding: '40px',
                        border: '1px solid #fff', borderRadius: '4px', background: '#000'
                    }}>
                        <h3 style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--text-dim)', marginBottom: '20px', letterSpacing: '2px' }}>
                            CONFIRM TRADE EXECUTION
                        </h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '40px', letterSpacing: '1px', lineHeight: '1.4' }}>{selectedEvent.question.toUpperCase()}</p>

                        <div style={{ marginBottom: '40px' }}>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '16px', fontWeight: '900', letterSpacing: '2px' }}>WAGER ALLOCATION</p>
                            <div className="flex-between" style={{ background: '#0a0a0a', padding: '20px', border: '1px solid #222' }}>
                                <button onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>-</button>
                                <span style={{ fontSize: '1.25rem', fontWeight: '900', letterSpacing: '2px' }}>{tradeAmount} FLOW</span>
                                <button onClick={() => setTradeAmount(tradeAmount + 10)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>+</button>
                            </div>
                        </div>

                        <div className="flex" style={{ gap: '16px' }}>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="btn btn-secondary" style={{ flex: 1, borderRadius: '2px' }}>CANCEL</button>
                            <button
                                onClick={handleTrade}
                                disabled={tradeMutation.isPending}
                                className="btn" style={{
                                    flex: 2, background: tradeChoice === 'yes' ? '#fff' : 'transparent',
                                    border: '1px solid #fff', color: tradeChoice === 'yes' ? '#000' : '#fff',
                                    borderRadius: '2px'
                                }}>
                                {tradeMutation.isPending ? 'PROCESSING...' : `PLACE ${tradeChoice.toUpperCase()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
