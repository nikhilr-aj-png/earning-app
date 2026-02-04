"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Flame, Target, Trophy, LogOut, ChevronRight, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function Dashboard() {
    const { user, logout, refreshUser } = useUser();
    const { showToast } = useToast();
    const router = useRouter();
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    });

    useEffect(() => {
        if (user) {
            if (user.is_admin) {
                router.push('/admin');
            } else {
                refreshUser();
            }
        }
    }, [user, refreshUser]);

    if (!user) {
        return (
            <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column', gap: '16px' }}>
                <div style={{ color: 'var(--primary)', animation: 'pulse-glow 2s infinite' }}>
                    <Zap size={48} fill="currentColor" />
                </div>
                <p style={{ color: 'var(--text-dim)', fontWeight: '600', letterSpacing: '0.05em' }}>SYNCING SESSION...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px' }}>
            {/* Header Section */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {greeting},
                    </p>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                        {user.name} <span style={{ opacity: 0.6 }}>👋</span>
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className="glass-panel"
                    style={{ padding: '12px', borderRadius: '16px', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Executive Balance Card */}
            <div className="glass-panel" style={{
                padding: '32px',
                background: '#000',
                border: '1px solid #fff',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '4px'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>
                            CREDIT BALANCE
                        </span>
                        <Zap size={18} color="#fff" strokeWidth={1} />
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '32px' }}>
                        <span style={{ fontSize: '3.5rem', fontWeight: '900', letterSpacing: '-3px', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
                            {user.coins.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-dim)', marginTop: '12px', letterSpacing: '2px' }}>FLOW</span>
                    </div>
                    <Link href="/wallet" className="btn" style={{ width: '100%', fontSize: '0.75rem', padding: '16px' }}>
                        EXECUTIVE WALLET <ChevronRight size={16} strokeWidth={3} />
                    </Link>
                </div>
                {/* Decorative Elements - Subtle Wireframe */}
                <div style={{
                    position: 'absolute', right: '-40px', bottom: '-40px',
                    opacity: 0.03, color: '#fff', transform: 'rotate(-10deg)'
                }}>
                    <Coins size={240} strokeWidth={0.5} />
                </div>
            </div>

            {/* Portfolio Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                {/* Performance Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
                        <div style={{ color: '#fff', marginBottom: '16px' }}>
                            <Flame size={24} strokeWidth={1} />
                        </div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px' }}>STREAK</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', fontWeight: '900' }}>2 DAYS</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
                        <div style={{ color: '#fff', marginBottom: '16px' }}>
                            <TrendingUp size={24} strokeWidth={1} />
                        </div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px' }}>RANK</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', fontWeight: '900' }}>ELITE</p>
                    </div>
                </div>

                {/* Operations Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Link href="/game" className="glass-panel flex-between" style={{ padding: '24px', textDecoration: 'none', borderRadius: '4px', border: '1px solid #222' }}>
                        <div className="flex-center" style={{ gap: '20px' }}>
                            <div style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#fff',
                                padding: '14px', borderRadius: '4px'
                            }}>
                                <Trophy size={24} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>ARENA OPERATIONS</h4>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>King & Queen Elite</p>
                            </div>
                        </div>
                        <span style={{
                            border: '1px solid #fff', color: '#fff',
                            fontSize: '0.6rem', fontWeight: '900',
                            padding: '4px 8px', borderRadius: '2px', letterSpacing: '1px'
                        }}>LIVE</span>
                    </Link>

                    <Link href="/earn" className="glass-panel flex-between" style={{ padding: '24px', textDecoration: 'none', borderRadius: '4px', border: '1px solid #222' }}>
                        <div className="flex-center" style={{ gap: '20px' }}>
                            <div style={{
                                background: 'transparent',
                                border: '1px solid #444',
                                color: '#fff',
                                padding: '14px', borderRadius: '4px'
                            }}>
                                <Target size={24} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>ASSET AQUISITION</h4>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tasks & Missions</p>
                            </div>
                        </div>
                        <div className="flex-center" style={{ gap: '4px', color: '#fff' }}>
                            <ChevronRight size={20} strokeWidth={1} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Referral Executive Card */}
            <div className="glass-panel" style={{
                padding: '40px',
                background: '#000',
                border: '1px solid #222',
                borderRadius: '2px',
                position: 'relative'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div className="flex-center" style={{ gap: '12px' }}>
                            <Users size={20} color="#fff" strokeWidth={1} />
                            <h4 style={{ fontWeight: '900', fontSize: '0.8rem', letterSpacing: '2px', color: '#fff' }}>NETWORK EXPANSION</h4>
                        </div>
                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '1px' }}>REWARD: 100 FLOW</span>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '32px', lineHeight: '1.6', letterSpacing: '0.5px' }}>
                        Onboard verified partners to the elite EarnFlow network. Portfolio credits are disbursed instantly upon successful activation.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid #333',
                            borderRadius: '2px',
                            padding: '16px',
                            fontSize: '1.2rem',
                            fontFamily: 'var(--font-outfit)',
                            fontWeight: '900',
                            color: '#fff',
                            letterSpacing: '6px',
                            textAlign: 'center'
                        }}>
                            {user.referral_code}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(user.referral_code);
                                showToast("REFERRAL CODE COPIED", "success");
                            }}
                            className="btn"
                            style={{
                                width: 'auto',
                                padding: '0 32px',
                                background: '#fff',
                                color: '#000',
                                borderRadius: '2px'
                            }}
                        >
                            COPY
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
