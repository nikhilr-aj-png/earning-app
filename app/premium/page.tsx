"use client";

import { useUser } from "@/context/UserContext";
import { Crown, Zap, Shield, TrendingUp, ChevronLeft, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function PremiumPage() {
    const { user, refreshUser } = useUser();
    const { showToast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = async () => {
        setIsProcessing(true);
        try {
            // Simulated payment/upgrade logic
            // In a real app, this would call a payment gateway and then update the DB
            const res = await fetch("/api/wallet/deposit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": user?.id || ""
                },
                body: JSON.stringify({ amountRupees: 999 }), // Simulate premium cost
            });

            // For now, let's just simulate the DB update if successful
            // In a real app, we'd have a separate /api/premium/upgrade
            // Here we'll just show the concept
            showToast("PROCESSING SECURE TRANSACTION...", "info");

            setTimeout(() => {
                showToast("UPGRADE FAILED: PAYMENT GATEWAY NOT CONFIGURED.", "error");
                setIsProcessing(false);
            }, 2000);

        } catch (err) {
            showToast("PROTOCOL ERROR", "error");
            setIsProcessing(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ width: '100%', padding: '24px 8px', minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <Link href="/dashboard" className="glass-panel flex-center" style={{ width: '40px', height: '40px', padding: '0', borderRadius: '12px' }}>
                    <ChevronLeft size={20} />
                </Link>
                <h1 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>PREMIUM TERMINAL</h1>
                <div style={{ width: '40px' }} />
            </div>

            {/* Hero Section */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '60px 32px',
                background: 'linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)',
                border: '2px solid var(--gold)',
                borderRadius: '32px',
                textAlign: 'center',
                marginBottom: '40px',
                boxShadow: '0 30px 60px rgba(234, 179, 8, 0.2)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-center" style={{
                        width: '80px', height: '80px', background: 'rgba(250, 204, 21, 0.1)',
                        borderRadius: '24px', margin: '0 auto 24px', border: '1px solid var(--gold)'
                    }}>
                        <Crown size={40} color="var(--gold)" fill="currentColor" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px', color: '#fff', marginBottom: '8px' }}>EARNFLOW ELITE</h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase' }}>ULTIMATE ASSET PROTOCOL</p>
                </div>
                {/* Visual Accent */}
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '200px', height: '200px', background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.2 }} />
            </div>

            {/* Benefits Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '48px' }}>
                <BenefitCard
                    icon={<Zap size={24} color="var(--gold)" />}
                    title="20% REWARD BOOST"
                    desc="Accelerated coin generation on all task completions."
                />
                <BenefitCard
                    icon={<Shield size={24} color="var(--gold)" />}
                    title="PRIORITY WITHDRAWAL"
                    desc="Dedicated server nodes for instant liquidity settlement."
                />
                <BenefitCard
                    icon={<Star size={24} color="var(--gold)" />}
                    title="EXECUTIVE BADGE"
                    desc="Elite profile identification across the global network."
                />
                <BenefitCard
                    icon={<TrendingUp size={24} color="var(--gold)" />}
                    title="REDUCED COMMISSION"
                    desc="Lower spreads on gaming and market operations."
                />
            </div>

            {/* Price Module */}
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', border: '1px solid #222', borderRadius: '24px' }}>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '2px', marginBottom: '12px' }}>LIFETIME ACCESS PROTOCOL</p>
                <div className="flex-center" style={{ gap: '8px', marginBottom: '32px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--gold)', marginTop: '-12px' }}>₹</span>
                    <span style={{ fontSize: '4rem', fontWeight: '950', color: '#fff', letterSpacing: '-4px' }}>999</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '900', marginTop: '20px' }}>ONE-TIME</span>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={isProcessing || user?.is_premium}
                    className="btn"
                    style={{
                        width: '100%', height: '72px', background: 'var(--gold)', color: '#000',
                        border: 'none', fontWeight: '950', fontSize: '1rem', letterSpacing: '2px',
                        boxShadow: '0 20px 40px rgba(234, 179, 8, 0.3)',
                        opacity: (isProcessing || user?.is_premium) ? 0.5 : 1
                    }}
                >
                    {user?.is_premium ? 'ALREADY ELITE' : isProcessing ? 'SYNCHRONIZING...' : 'UPGRADE TO ELITE'}
                </button>

                <p style={{ marginTop: '24px', color: 'var(--text-dim)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '1px' }}>
                    SECURE BLOCKCHAIN VERIFICATION ACTIVE.
                </p>
            </div>
        </div>
    );
}

function BenefitCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
    return (
        <div className="glass-panel flex-center" style={{ gap: '20px', padding: '24px', border: '1px solid #111', justifyContent: 'flex-start' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
                {icon}
            </div>
            <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: '950', color: '#fff', letterSpacing: '2px', marginBottom: '4px' }}>{title}</h4>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '800', lineHeight: '1.4' }}>{desc}</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <CheckCircle2 size={16} color="var(--gold)" opacity={0.5} />
            </div>
        </div>
    );
}
