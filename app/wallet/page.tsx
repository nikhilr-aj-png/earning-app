"use client";

import { useUser } from "@/context/UserContext";
import { Transaction } from "@/lib/db";
import { ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon, ChevronLeft, Layers, X, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function WalletPage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

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

    const depositMutation = useMutation({
        mutationFn: async (amount: number) => {
            const res = await fetch("/api/wallet/deposit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || ""
                },
                body: JSON.stringify({ amountRupees: amount }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            return data;
        },
        onSuccess: (data) => {
            showToast(data.message, "success");
            setShowDepositModal(false);
            setDepositAmount("");
            refreshUser();
            queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
        },
        onError: (error: any) => {
            showToast(error.message || "PROTOCOL FAILURE", "error");
        },
        onSettled: () => {
            setIsProcessing(false);
        }
    });

    const handleDeposit = () => {
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast("INVALID CAPITAL INPUT", "error");
            return;
        }
        setIsProcessing(true);
        depositMutation.mutate(amount);
    };

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
        <div className="animate-fade-in" style={{ width: '100%', padding: '24px 8px' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px' }}>
                    <ChevronLeft size={20} />
                </Link>
                <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>CAPITAL CENTER</h1>
                <div style={{ width: '40px' }} />
            </div>

            {/* Capital Balance Module - Extreme Vibrant Sapphire */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '80px 40px',
                background: 'linear-gradient(135deg, #1e40af 0%, #020617 100%)',
                border: '1.5px solid var(--sapphire)',
                marginBottom: '48px',
                textAlign: 'center',
                borderRadius: '32px',
                boxShadow: '0 40px 80px rgba(0, 112, 243, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-center" style={{
                        width: '90px', height: '90px', borderRadius: '24px',
                        background: 'rgba(255,255,255,0.1)', border: '1px solid var(--sapphire)',
                        margin: '0 auto 32px', color: '#fff',
                        boxShadow: '0 10px 30px rgba(0, 112, 243, 0.2)'
                    }}>
                        <WalletIcon size={44} strokeWidth={2} fill="currentColor" />
                    </div>
                    <div className="flex-center" style={{ gap: '10px', marginBottom: '16px' }}>
                        <div className="badge-gold" style={{ fontSize: '0.65rem', padding: '4px 12px' }}>EXECUTIVE PARTNER</div>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '6px', marginBottom: '12px' }}>
                        LIQUIDITY RESERVE
                    </p>
                    <div className="flex-center" style={{ gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '5rem', fontWeight: '950', color: '#fff', letterSpacing: '-6px', lineHeight: 1 }}>
                                {user?.coins.toLocaleString()}
                            </h2>
                            <p style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--emerald)', letterSpacing: '1px', marginTop: '4px' }}>
                                ≈ ₹{(user?.coins / 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <span style={{ color: 'var(--primary)', fontWeight: '950', fontSize: '1.25rem', marginTop: '12px', letterSpacing: '4px' }}>FLOW</span>
                    </div>
                </div>
                {/* Visual Depth */}
                <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '250px', height: '250px', background: 'var(--sapphire)', filter: 'blur(120px)', opacity: 0.3 }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: '200px', height: '200px', background: 'var(--violet)', filter: 'blur(120px)', opacity: 0.2 }} />
            </div>

            {/* Quick Actions - Pro Palette */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                <button
                    onClick={() => setShowDepositModal(true)}
                    className="btn"
                    style={{ padding: '20px', background: 'var(--emerald)', color: '#fff', border: 'none', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                >
                    DEPOSIT
                </button>
                <button className="btn btn-secondary" style={{ padding: '20px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    WITHDRAWAL
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
                                    <p style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '900', marginTop: '2px' }}>
                                        ₹{(Math.abs(tx.amount) / 10).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="glass-panel animate-slide-up" style={{
                        width: '90%', maxWidth: '400px', padding: '32px',
                        border: '2px solid var(--emerald)', background: '#000',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowDepositModal(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-dim)' }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-center" style={{ gap: '16px', marginBottom: '32px' }}>
                            <TrendingUp size={32} color="var(--emerald)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '950', letterSpacing: '4px' }}>LIQUIDITY INJECTION</h2>
                        </div>

                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '24px', textAlign: 'center' }}>
                            CONVERSION RATIO: ₹1 = 10 FLOW
                        </p>

                        {/* Preset Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {[100, 500, 1000].map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setDepositAmount(amt.toString())}
                                    style={{
                                        padding: '12px', borderRadius: '4px', border: '1px solid #222',
                                        background: depositAmount === amt.toString() ? 'var(--emerald)' : 'transparent',
                                        color: depositAmount === amt.toString() ? '#000' : '#fff',
                                        fontSize: '0.75rem', fontWeight: '950'
                                    }}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--text-dim)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
                                CUSTOM RUPEE AMOUNT
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', color: 'var(--emerald)' }}>₹</span>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="0.00"
                                    style={{
                                        width: '100%', padding: '16px 16px 16px 32px', background: '#111', border: '1px solid #222',
                                        borderRadius: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: '950'
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '12px', textAlign: 'right' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '900' }}>
                                    YIELD: {(parseFloat(depositAmount) || 0) * 10} FLOW
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleDeposit}
                            disabled={isProcessing}
                            className="btn"
                            style={{
                                width: '100%', height: '64px', background: '#fff', color: '#000',
                                border: 'none', fontWeight: '950', letterSpacing: '2px',
                                opacity: isProcessing ? 0.5 : 1
                            }}
                        >
                            {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE INJECTION'}
                        </button>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.6 }}>
                            <Zap size={16} color="var(--emerald)" />
                            <p style={{ fontSize: '0.55rem', fontWeight: '900', letterSpacing: '1px' }}>SECURE GATEWAY ENCRYPTION ACTIVE</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
