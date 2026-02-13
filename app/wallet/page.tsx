"use client";

export const dynamic = 'force-dynamic';

import { useUser } from "@/context/UserContext";

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'earn' | 'game_win' | 'game_loss' | 'withdraw' | 'bonus' | 'deposit' | 'premium_upgrade';
    description: string;
    status?: string;
    created_at: string;
}

import { ArrowDownLeft, ArrowUpRight, History, Wallet as WalletIcon, ChevronLeft, Layers, X, CheckCircle2, TrendingUp, Zap, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function WalletPage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // UPI State
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiInput, setUpiInput] = useState('');

    const { data: userProfile, refetch: refetchProfile } = useQuery({
        queryKey: ['user-profile-upi', user?.id],
        queryFn: async () => {
            const res = await fetch('/api/user', { headers: { 'x-user-id': user?.id || '' } });
            return res.json();
        },
        enabled: !!user,
        refetchInterval: 5000,
    });

    // System Settings for Toggles
    const { data: systemSettings } = useQuery({
        queryKey: ['system-settings-wallet'],
        queryFn: async () => {
            const res = await fetch('/api/system/config');
            return res.json();
        }
    });

    const handleUpiUpdate = async () => {
        if (!upiInput.includes('@')) {
            showToast("INVALID UPI ID FORMAT", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const res = await fetch('/api/user/upi/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                body: JSON.stringify({ upiId: upiInput })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast(data.message, "success");
            setShowUpiModal(false);
            setUpiInput('');
            refetchProfile();
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async (flowAmount: number) => {
        if (!user) return;
        if (user.coins < flowAmount) {
            showToast("INSUFFICIENT FLOW BALANCE", "error");
            return;
        }

        setIsProcessing(true);
        try {
            showToast("INITIATING WITHDRAWAL PROTOCOL...", "info");
            const res = await fetch("/api/user/withdraw", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user.id
                },
                body: JSON.stringify({ flowAmount })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            showToast(data.message, "success");
            setShowWithdrawModal(false);
            refreshUser();
            queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
        } catch (err: any) {
            showToast(err.message || "WITHDRAWAL ERROR", "error");
        } finally {
            setIsProcessing(false);
        }
    };

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
        refetchInterval: 5000,
    });

    const handleBuyFlow = async (flowAmount: number) => {
        if (!user) return;
        const rupeeAmount = flowAmount / 10;
        setIsProcessing(true);
        try {
            showToast("INITIATING SECURE PROTOCOL...", "info");

            // 1. Create Razorpay Order
            const orderRes = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, amount: rupeeAmount, type: 'coins' })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error);

            // 2. Launch Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: orderData.amount,
                currency: "INR",
                name: "EarnFlow",
                description: `Purchase ${flowAmount.toLocaleString()} FLOW Coins`,
                order_id: orderData.id,
                handler: async (response: any) => {
                    showToast("VERIFYING TRANSACTION...", "info");

                    const verifyRes = await fetch("/api/payment/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            userId: user.id,
                            type: 'coins',
                            amount: rupeeAmount
                        })
                    });

                    const verifyResult = await verifyRes.json();
                    if (verifyRes.ok) {
                        showToast("FLOW SECURED. LIQUIDITY INJECTED.", "success");
                        setShowDepositModal(false);
                        refreshUser();
                        queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
                    } else {
                        throw new Error(verifyResult.error);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#10b981"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) {
            showToast(err.message || "PROTOCOL ERROR", "error");
        } finally {
            setIsProcessing(false);
        }
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
        <div className="animate-fade-in" style={{ width: '100%', padding: '24px 8px', paddingBottom: '140px' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px' }}>
                    <ChevronLeft size={20} />
                </Link>
                <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>CAPITAL CENTER</h1>
                <div style={{ width: '40px' }} />
            </div>

            {/* UPI ID SECTION */}
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', margin: '0 auto 24px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', flexShrink: 0 }}>
                        <Zap size={20} color="var(--gold)" fill="var(--gold)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '1px', marginBottom: '2px' }}>LINKED UPI ID</p>
                        <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '700', letterSpacing: '0.5px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {userProfile?.upi_id || 'NOT LINKED'}
                        </p>
                        {userProfile?.new_upi_id && (
                            <p style={{ fontSize: '0.55rem', color: 'var(--gold)', fontWeight: '800', marginTop: '2px' }}>
                                PENDING: {userProfile.new_upi_id}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowUpiModal(true)}
                    disabled={!!userProfile?.new_upi_id}
                    className="btn-secondary"
                    style={{
                        padding: '8px 14px', fontSize: '0.65rem', height: 'auto',
                        background: userProfile?.new_upi_id ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                        opacity: userProfile?.new_upi_id ? 0.5 : 1,
                        cursor: userProfile?.new_upi_id ? 'not-allowed' : 'pointer',
                        border: userProfile?.new_upi_id ? '1px solid #333' : '1px solid rgba(255,255,255,0.1)',
                        fontWeight: '800', letterSpacing: '1px',
                        whiteSpace: 'nowrap', flexShrink: 0, borderRadius: '8px'
                    }}
                >
                    {userProfile?.new_upi_id ? 'WAITING' : (userProfile?.upi_id ? 'CHANGE' : 'LINK')}
                </button>
            </div>

            {/* Capital Balance Module - Extreme Vibrant Sapphire */}
            <div className="glass-panel glass-vibrant responsive-width" style={{
                margin: '0 auto 40px',
                padding: '60px 24px',
                background: 'linear-gradient(135deg, #1e40af 0%, #020617 100%)',
                border: '1.5px solid var(--sapphire)',
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '950', color: '#fff', letterSpacing: '4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                                {(user?.coins || 0).toLocaleString()}
                            </h2>
                            <span style={{ fontSize: '1rem', fontWeight: '950', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>FLOW</span>
                        </div>
                        <div style={{ padding: '6px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--emerald)', letterSpacing: '0.5px' }}>
                                ≈ ₹{((user?.coins || 0) / 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>
                {/* Visual Depth */}
                <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '250px', height: '250px', background: 'var(--sapphire)', filter: 'blur(120px)', opacity: 0.3 }} />
                <div style={{ position: 'absolute', bottom: '-20%', left: '-15%', width: '200px', height: '200px', background: 'var(--violet)', filter: 'blur(120px)', opacity: 0.2 }} />
            </div>

            {/* Quick Actions - Pro Palette */}
            <div style={{ display: 'grid', gridTemplateColumns: systemSettings?.buy_flow_enabled ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '48px' }}>
                {systemSettings?.buy_flow_enabled && (
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="btn"
                        style={{ padding: '20px', background: 'var(--emerald)', color: '#fff', border: 'none', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        BUY FLOW
                    </button>
                )}
                <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="btn btn-secondary"
                    style={{ padding: '20px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}
                >
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
                    {transactions.filter(tx => ['deposit', 'withdraw', 'premium_upgrade'].includes(tx.type)).length === 0 ? (
                        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', border: '1px solid #222', borderRadius: '4px' }}>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '2px' }}>NO RECENT OPERATIONS DETECTED.</p>
                        </div>
                    ) : (
                        transactions
                            .filter(tx => ['deposit', 'withdraw', 'premium_upgrade'].includes(tx.type))
                            .map((tx: Transaction) => (
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
                                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                                <h4 style={{ fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px', color: '#fff', margin: 0 }}>{tx.description.toUpperCase()}</h4>
                                                {tx.status && (
                                                    <span style={{
                                                        fontSize: '0.5rem', padding: '2px 6px', borderRadius: '4px',
                                                        background: tx.status === 'completed' ? 'var(--emerald)' : tx.status === 'rejected' ? 'var(--red)' : 'var(--gold)',
                                                        color: '#000', fontWeight: '800', letterSpacing: '0.5px'
                                                    }}>
                                                        {tx.status.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '900', letterSpacing: '1px' }}>{formatDate(tx.created_at)}</p>
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

            {/* BUY FLOW Modal */}
            {showDepositModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="glass-panel animate-slide-up" style={{
                        width: '95%', maxWidth: '500px', padding: '24px',
                        maxHeight: '85vh', overflowY: 'auto',
                        border: '2px solid var(--emerald)', background: '#000',
                        position: 'relative', borderRadius: '24px'
                    }}>
                        <button
                            onClick={() => setShowDepositModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-dim)' }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-center" style={{ gap: '16px', marginBottom: '32px' }}>
                            <TrendingUp size={32} color="var(--emerald)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '950', letterSpacing: '4px' }}>BUY FLOW</h2>
                        </div>

                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '24px', textAlign: 'center' }}>
                            SELECT CONVERSION TIER
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            {[1000, 5000, 10000, 20000, 30000, 40000, 50000].map((flowAmt) => (
                                <button
                                    key={flowAmt}
                                    onClick={() => handleBuyFlow(flowAmt)}
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%', padding: '20px', background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid #222', borderRadius: '12px', display: 'flex',
                                        justifyContent: 'space-between', alignItems: 'center', transition: '0.3s',
                                        opacity: isProcessing ? 0.5 : 1
                                    }}
                                    className="buy-option-hover"
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', display: 'block' }}>{flowAmt.toLocaleString()} FLOW</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--emerald)', fontWeight: '800' }}>BASIC LIQUIDITY</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--emerald)' }}>₹{flowAmt / 10}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.6, justifyContent: 'center' }}>
                            <Zap size={16} color="var(--emerald)" />
                            <p style={{ fontSize: '0.55rem', fontWeight: '900', letterSpacing: '1px' }}>SECURE GATEWAY ENCRYPTION ACTIVE</p>
                        </div>
                    </div>
                </div>
            )}
            {/* WITHDRAW FLOW Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="glass-panel animate-slide-up" style={{
                        width: '95%', maxWidth: '500px', padding: '24px',
                        maxHeight: '85vh', overflowY: 'auto',
                        border: '2px solid var(--primary)', background: '#000',
                        position: 'relative', borderRadius: '24px'
                    }}>
                        <button
                            onClick={() => setShowWithdrawModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-dim)' }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-center" style={{ gap: '16px', marginBottom: '32px' }}>
                            <ArrowUpRight size={32} color="var(--primary)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '950', letterSpacing: '4px' }}>WITHDRAW FLOW</h2>
                        </div>

                        <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '24px', textAlign: 'center' }}>
                            SELECT WITHDRAWAL TIER
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                            {[5000, 10000, 25000, 50000].map((flowAmt) => (
                                <button
                                    key={flowAmt}
                                    onClick={() => handleWithdraw(flowAmt)}
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%', padding: '20px', background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid #222', borderRadius: '12px', display: 'flex',
                                        justifyContent: 'space-between', alignItems: 'center', transition: '0.3s',
                                        opacity: isProcessing ? 0.5 : 1
                                    }}
                                    className="buy-option-hover"
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '950', color: '#fff', display: 'block' }}>{flowAmt.toLocaleString()} FLOW</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '800' }}>CASHOUT READY</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--primary)' }}>₹{flowAmt / 10}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', opacity: 0.6, justifyContent: 'center' }}>
                            <Shield size={16} color="var(--primary)" />
                            <p style={{ fontSize: '0.55rem', fontWeight: '900', letterSpacing: '1px' }}>MINIMUM PAYOUT: 5,000 FLOW</p>
                        </div>
                    </div>
                </div>
            )}
            {/* UPI MODAL */}
            {showUpiModal && (
                <div className="modal-overlay" style={{ display: 'flex' }}>
                    <div className="glass-panel animate-slide-up" style={{
                        width: '95%', maxWidth: '400px', padding: '32px',
                        border: '1px solid var(--gold)', background: '#000',
                        position: 'relative', borderRadius: '24px', textAlign: 'center'
                    }}>
                        <button
                            onClick={() => setShowUpiModal(false)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-dim)' }}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-center" style={{ marginBottom: '24px', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', border: '1px solid var(--gold)' }}>
                                <Zap size={32} color="var(--gold)" />
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '950', letterSpacing: '2px' }}>
                                {userProfile?.upi_id ? 'REQUEST UPI CHANGE' : 'LINK UPI ID'}
                            </h2>
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.6 }}>
                            {userProfile?.upi_id
                                ? "Changing your UPI ID requires Admin Approval. This process may take up to 24-48 hours."
                                : "Link your UPI ID for instant withdrawals. Once linked, it can only be changed with approval."}
                        </p>

                        <input
                            type="text"
                            placeholder="example@upi"
                            value={upiInput}
                            onChange={(e) => setUpiInput(e.target.value)}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                color: '#fff', fontSize: '1rem', textAlign: 'center', marginBottom: '24px', fontWeight: '800'
                            }}
                        />

                        <button
                            onClick={handleUpiUpdate}
                            disabled={isProcessing || !upiInput}
                            className="btn"
                            style={{ width: '100%', padding: '16px', background: 'var(--gold)', color: '#000', fontWeight: '950', letterSpacing: '1px' }}
                        >
                            {isProcessing ? 'PROCESSING...' : userProfile?.upi_id ? 'SUBMIT REQUEST' : 'LINK INSTANTLY'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
