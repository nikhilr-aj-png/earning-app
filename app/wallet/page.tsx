"use client";

import { useUser } from "@/context/UserContext";
import { Transaction } from "@/lib/db";
import { ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon, ChevronLeft, Layers } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export default function WalletPage() {
    const { user } = useUser();

    const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            const res = await fetch("/api/user/transactions", {
                headers: { "x-user-id": user?.id || "" },
            });
            if (!res.ok) throw new Error("Failed to fetch transactions");
            return res.json();
        },
        enabled: !!user,
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (isLoading) return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
            <div style={{ color: 'var(--primary)', animation: 'pulse-glow 2s infinite' }}>
                <Layers size={40} />
            </div>
            <p style={{ color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.05em' }}>LEDGER SYNCING...</p>
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px' }}>
                    <ChevronLeft size={20} />
                </Link>
                <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>CAPITAL CENTER</h1>
                <div style={{ width: '40px' }} />
            </div>

            {/* Capital Balance Module - Vibrant Sapphire */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '60px 32px',
                background: 'linear-gradient(135deg, #001f3f 0%, #000 100%)',
                border: '1px solid var(--sapphire)',
                marginBottom: '40px',
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: '0 30px 60px rgba(0, 112, 243, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-center" style={{
                        width: '72px', height: '72px', borderRadius: '12px',
                        background: 'var(--sapphire-glow)', border: '1px solid var(--sapphire)',
                        margin: '0 auto 24px', color: 'var(--sapphire)'
                    }}>
                        <WalletIcon size={32} strokeWidth={1.5} fill="currentColor" />
                    </div>
                    <div className="flex-center" style={{ gap: '8px', marginBottom: '12px' }}>
                        <div className="badge-gold" style={{ fontSize: '0.55rem', padding: '2px 8px', borderRadius: '4px' }}>EXECUTIVE RESERVE</div>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>
                        CURRENT LIQUIDITY
                    </p>
                    <div className="flex-center" style={{ gap: '12px' }}>
                        <h2 style={{ fontSize: '4.2rem', fontWeight: '950', color: '#fff', letterSpacing: '-4px', fontFamily: 'var(--font-outfit)' }}>
                            {user?.coins.toLocaleString()}
                        </h2>
                        <span style={{ color: 'var(--sapphire)', fontWeight: '900', fontSize: '0.9rem', marginTop: '24px', letterSpacing: '2px' }}>FLOW</span>
                    </div>
                </div>
                {/* Visual Depth */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'var(--sapphire)', filter: 'blur(100px)', opacity: 0.2 }} />
            </div>

            {/* Quick Actions - Pro Palette */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                <button className="btn" style={{ padding: '20px', background: 'var(--sapphire)', color: '#fff', border: 'none' }}>
                    WITHDRAWAL
                </button>
                <button className="btn btn-secondary" style={{ padding: '20px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    TRANSFER
                </button>
            </div>

            {/* Transaction Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="flex-between">
                    <div className="flex-center" style={{ gap: '12px' }}>
                        <History size={20} color="#fff" strokeWidth={1} />
                        <h3 style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '4px' }}>LEDGER ACTIVITY</h3>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', border: '1px solid #222', borderRadius: '4px' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>NO RECENT OPERATIONS DETECTED.</p>
                        </div>
                    ) : (
                        transactions.map((tx: Transaction) => (
                            <div key={tx.id} className="glass-panel flex-between" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #111', background: 'rgba(0,0,0,0.3)' }}>
                                <div className="flex-center" style={{ gap: '20px' }}>
                                    <div style={{
                                        padding: '12px', borderRadius: '8px',
                                        background: tx.amount > 0 ? 'var(--emerald-glow)' : 'var(--glass-bg)',
                                        border: tx.amount > 0 ? '1px solid var(--emerald)' : '1px solid var(--glass-border)',
                                        color: tx.amount > 0 ? 'var(--emerald)' : '#fff',
                                        boxShadow: tx.amount > 0 ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none'
                                    }}>
                                        {tx.amount > 0 ? <ArrowDownLeft size={20} strokeWidth={2} /> : <ArrowUpRight size={20} strokeWidth={2} />}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.85rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px', color: '#fff' }}>{tx.description.toUpperCase()}</h4>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1px' }}>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        fontSize: '1.25rem', fontWeight: '950',
                                        color: tx.amount > 0 ? 'var(--emerald)' : '#fff', letterSpacing: '-1px'
                                    }}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                    </span>
                                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '900', marginTop: '2px' }}>CREDITED</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
