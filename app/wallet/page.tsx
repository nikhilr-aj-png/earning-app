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

            {/* Capital Balance Module */}
            <div className="glass-panel" style={{
                padding: '48px 24px',
                background: '#000',
                border: '1px solid #fff',
                marginBottom: '40px',
                textAlign: 'center',
                borderRadius: '4px'
            }}>
                <div className="flex-center" style={{
                    width: '64px', height: '64px', borderRadius: '4px',
                    background: 'transparent', border: '1px solid #fff',
                    margin: '0 auto 24px', color: '#fff'
                }}>
                    <WalletIcon size={28} strokeWidth={1} />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>
                    LIQUIDITY RESERVE
                </p>
                <div className="flex-center" style={{ gap: '12px' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff', letterSpacing: '-3px', fontFamily: 'var(--font-outfit)' }}>
                        {user?.coins.toLocaleString()}
                    </h2>
                    <span style={{ color: 'var(--text-dim)', fontWeight: '900', fontSize: '0.8rem', marginTop: '16px', letterSpacing: '2px' }}>FLOW</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
                <button className="btn" style={{ padding: '20px' }}>
                    WITHDRAWAL
                </button>
                <button className="btn btn-secondary" style={{ padding: '20px', borderRadius: '4px', border: '1px solid #333' }}>
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
                            <div key={tx.id} className="glass-panel flex-between" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
                                <div className="flex-center" style={{ gap: '20px' }}>
                                    <div style={{
                                        padding: '12px', borderRadius: '2px',
                                        background: 'transparent',
                                        border: '1px solid #444',
                                        color: '#fff'
                                    }}>
                                        {tx.amount > 0 ? <ArrowDownLeft size={20} strokeWidth={1} /> : <ArrowUpRight size={20} strokeWidth={1} />}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px' }}>{tx.description.toUpperCase()}</h4>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '1px' }}>{formatDate(tx.createdAt)}</p>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: '1.1rem', fontWeight: '900',
                                    color: '#fff', letterSpacing: '-1px'
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
