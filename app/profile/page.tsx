"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { User, Mail, Shield, Copy, LogOut, ChevronRight, Zap, Users, TrendingUp, Crown, Star } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function ProfilePage() {
    const { user, logout, refreshUser } = useUser();
    const { showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    if (!user) return <div className="flex-center" style={{ minHeight: '80vh', color: 'var(--text-dim)' }}>INITIALIZING PROFILE...</div>;

    const copyReferral = () => {
        navigator.clipboard.writeText(user.referral_code);
        showToast("REFERRAL CODE COPIED", "success");
    };

    const handleUpgrade = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            // Check internet/network
            if (!navigator.onLine) {
                throw new Error("No Internet Connection");
            }

            // Check if Razorpay is loaded
            if (typeof (window as any).Razorpay === 'undefined') {
                console.error("Razorpay SDK missing");
                throw new Error("Razorpay SDK not loaded. Check connection.");
            }

            showToast("INITIATING SECURE PROTOCOL...", "info");

            // 1. Create Razorpay Order
            console.log("Creating order...");
            const orderRes = await fetch("/api/payment/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, amount: 99, type: 'premium' })
            });

            const contentType = orderRes.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await orderRes.text();
                console.error("API Error (Non-JSON):", text);
                throw new Error("Server Error: Invalid API Response");
            }

            const orderData = await orderRes.json();
            if (!orderRes.ok) {
                console.error("Order API Error:", orderData);
                throw new Error(orderData.error || "Order Creation Failed");
            }

            // 2. Launch Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: orderData.amount,
                currency: "INR",
                name: "EarnFlow",
                description: "Elite Program Monthly Access",
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
                            type: 'premium',
                            amount: 99
                        })
                    });

                    const verifyResult = await verifyRes.json();
                    if (verifyRes.ok) {
                        showToast("UPGRADE SECURED. WELCOME ELITE.", "success");
                        refreshUser();
                    } else {
                        throw new Error(verifyResult.error);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                },
                theme: {
                    color: "#EAB308"
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

    return (
        <div className="animate-fade-in" style={{ width: '100%', padding: '24px 8px', minHeight: '100vh', paddingBottom: '140px' }}>
            {/* Header Section - Extreme Vibrant Identity */}
            <div style={{ marginBottom: '64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '32px' }}>
                    <div className="glass-panel glass-vibrant flex-center" style={{
                        width: '150px', height: '150px', borderRadius: '48px',
                        border: '3px solid var(--sapphire)',
                        background: 'linear-gradient(135deg, #1e40af 0%, #7e22ce 100%)',
                        boxShadow: '0 30px 60px rgba(59, 130, 246, 0.3)',
                        transform: 'rotate(5deg)'
                    }}>
                        <div style={{ transform: 'rotate(-5deg)' }}>
                            <User size={80} color="#fff" strokeWidth={1} fill="rgba(255,255,255,0.2)" />
                        </div>
                    </div>
                    {/* Floating Verified Badge */}
                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', zIndex: 2 }}>
                        <div className="badge-gold" style={{ padding: '12px', borderRadius: '16px', boxShadow: '0 10px 20px rgba(250,204,21,0.4)', border: '2px solid rgba(255,255,255,0.2)' }}>
                            <Shield size={20} color="#000" strokeWidth={3} />
                        </div>
                    </div>
                </div>
                <h1 style={{
                    fontSize: '2.4rem',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    marginBottom: '12px',
                    color: '#fff',
                    textTransform: 'uppercase',
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                }}>
                    {user.name}
                </h1>
                <div className="flex-center" style={{ gap: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '4px' }}>EXECUTIVE PROTOCOL</span>
                    {user.is_premium ? (
                        <span className="badge-gold" style={{ fontSize: '0.6rem', fontWeight: '950', padding: '6px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Crown size={12} fill="currentColor" /> PREMIUM
                        </span>
                    ) : (
                        <span style={{ fontSize: '0.6rem', fontWeight: '950', padding: '6px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                            FREE TIER
                        </span>
                    )}
                </div>
            </div>

            {/* Account Information - High Fidelity */}
            <div className="glass-panel" style={{ padding: '40px', border: '1px solid #111', borderRadius: '12px', marginBottom: '24px', background: 'rgba(255,255,255,0.01)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="flex-between">
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--sapphire-glow)' }}>
                                <Mail size={18} color="var(--sapphire)" strokeWidth={2} />
                            </div>
                            <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '800' }}>{user.email}</span>
                        </div>
                    </div>
                    <div className="flex-between" style={{ borderTop: '1px solid #111', paddingTop: '24px' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                                <TrendingUp size={18} color="var(--text-dim)" strokeWidth={2} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '1px' }}>UNIQUE IDENTITY</span>
                                <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '950', letterSpacing: '2px' }}>ID: {user.display_id || 'PROVISIONING...'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Upgrade Hub - Special Offer */}
            {!user.is_premium && (
                <div className="glass-panel glass-vibrant" style={{
                    width: '75%',
                    margin: '0 auto 24px',
                    padding: '32px',
                    border: '1px solid var(--gold)',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
                    boxShadow: '0 20px 40px rgba(234, 179, 8, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="flex-between" style={{ position: 'relative', zIndex: 2 }}>
                        <div>
                            <div className="flex-center" style={{ gap: '8px', marginBottom: '8px', justifyContent: 'flex-start' }}>
                                <Star size={16} color="var(--gold)" fill="currentColor" />
                                <span style={{ fontSize: '0.65rem', fontWeight: '950', color: 'var(--gold)', letterSpacing: '2px' }}>EXECUTIVE SPECIAL</span>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#fff', marginBottom: '8px' }}>ELITE ACCESS</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[
                                    '2X REFERRAL PAYOUTS (+100 FLOW)',
                                    'INSTANT WITHDRAWAL PRIORITY',
                                    'EXCLUSIVE HIGH-PAYOUT VIP TASKS'
                                ].map((point, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6rem', color: 'rgba(255,255,255,0.8)', fontWeight: '900', letterSpacing: '0.5px' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} />
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontWeight: '900' }}>₹499</div>
                            <div className="flex-center" style={{ gap: '4px' }}>
                                <span style={{ fontSize: '1.25rem', fontWeight: '950', color: 'var(--gold)' }}>₹99</span>
                                <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)', fontWeight: '800' }}>/mo</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="btn"
                        style={{
                            width: '100%', height: '56px', background: 'var(--gold)', color: '#000',
                            border: 'none', marginTop: '24px', fontWeight: '950', fontSize: '0.8rem',
                            letterSpacing: '2px', borderRadius: '12px',
                            opacity: isProcessing ? 0.7 : 1
                        }}
                    >
                        {isProcessing ? 'SYNCHRONIZING...' : 'UPGRADE NOW'}
                    </button>
                    {/* Background Visual */}
                    <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'var(--gold)', filter: 'blur(80px)', opacity: 0.15 }} />
                </div>
            )}

            {/* Portfolio Statistics - Accented */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '48px' }}>
                <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', textAlign: 'center', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                    <TrendingUp size={24} color="var(--sapphire)" style={{ marginBottom: '16px' }} strokeWidth={2} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '3px', marginBottom: '8px' }}>LIQUIDITY</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>{user.coins.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--sapphire)' }}>FLOW</span></h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--emerald)', fontWeight: '950', marginTop: '4px' }}>
                        ≈ ₹{(user.coins / 10).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', textAlign: 'center', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                    <Users size={24} color="var(--gold)" style={{ marginBottom: '16px' }} strokeWidth={2} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '3px', marginBottom: '8px' }}>PARTNERS</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>ELITE</h3>
                </div>
            </div>

            {/* Logout Action */}
            <button onClick={logout} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px' }}>
                LOGOUT <LogOut size={18} strokeWidth={2} />
            </button>
        </div>
    );
}
