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

            {/* Premium Balance Module */}
            <div className="glass-panel" style={{
                padding: '32px 24px',
                background: 'linear-gradient(180deg, rgba(0, 242, 255, 0.05) 0%, transparent 100%)',
                border: '1px solid var(--glass-border)',
                marginBottom: '32px',
                textAlign: 'center'
            }}>
                <div className="flex-center" style={{
                    width: '56px', height: '56px', borderRadius: '18px',
                    background: 'var(--primary-glow)', border: '1px solid var(--primary)',
                    margin: '0 auto 16px', color: '#000'
                }}>
                    <WalletIcon size={28} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
                    Available Credits
                </p>
                <div className="flex-center" style={{ gap: '10px' }}>
                    <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.02em', fontFamily: 'var(--font-outfit)' }}>
                        {user?.coins.toLocaleString()}
                    </h2>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem', marginTop: '12px' }}>FLOW</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                <button className="btn" style={{ padding: '16px' }} onClick={() => alert("Withdrawals require account verification.")}>
                    WITHDRAW
                </button>
                <button className="btn btn-secondary" style={{ padding: '16px' }} onClick={() => alert("P2P transfers are disabled.")}>
                    TRANSFER
                </button>
            </div>

            {/* Transaction Ledger */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="flex-between">
                    <div className="flex-center" style={{ gap: '10px' }}>
                        <History size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '2px' }}>ACTIVITY LOG</h3>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {transactions.length === 0 ? (
                        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderStyle: 'dashed' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No financial activity detected.</p>
                        </div>
                    ) : (
                        transactions.map((tx: Transaction) => (
                            <div key={tx.id} className="glass-panel flex-between" style={{ padding: '16px 20px' }}>
                                <div className="flex-center" style={{ gap: '16px' }}>
                                    <div style={{
                                        padding: '10px', borderRadius: '12px',
                                        background: tx.amount > 0 ? 'rgba(0, 255, 163, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                                        color: tx.amount > 0 ? 'var(--success)' : 'var(--error)'
                                    }}>
                                        {tx.amount > 0 ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '2px' }}>{tx.description}</h4>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '1rem', fontWeight: '900',
                                    color: tx.amount > 0 ? 'var(--success)' : 'var(--error)'
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
