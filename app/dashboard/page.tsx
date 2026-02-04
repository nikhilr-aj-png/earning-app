"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Flame, Target, Trophy, LogOut, ChevronRight, Zap, TrendingUp, Users, Activity } from "lucide-react";
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
            {/* Live Operational Ticker */}
            <div className="ticker-wrap glass-panel" style={{
                padding: '12px 0',
                marginBottom: '24px',
                borderRadius: '2px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="ticker-item" style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--emerald)', letterSpacing: '2px' }}>
                    LIVE: EXECUTIVE ID 82** ACQUIRED 500 FLOW • ARENA ROUND #812 PAYOUT: 1.25M FLOW • NETWORK VOLUME: 4.82M • VIP UPGRADE: USER_ELITE GOLD
                </div>
            </div>

            {/* Header Section */}
            <div className="flex-between" style={{ marginBottom: '32px' }}>
                <div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {greeting},
                        </span>
                        <div className="badge-gold" style={{
                            fontSize: '0.55rem',
                            fontWeight: '900',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            letterSpacing: '1px'
                        }}>VIP GOLD</div>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-0.5px' }}>
                        {user.name}
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className="glass-panel flex-center"
                    style={{ padding: '12px', borderRadius: '12px', color: 'var(--text-dim)', border: '1px solid var(--glass-border)' }}
                >
                    <LogOut size={20} strokeWidth={1.5} />
                </button>
            </div>

            {/* Executive Balance Card - Vibrant sapphire */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '40px 32px',
                background: 'linear-gradient(135deg, #001f3f 0%, #000 70%)',
                border: '1px solid var(--sapphire)',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0, 112, 243, 0.15)'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <div className="flex-center" style={{ gap: '8px' }}>
                            <div style={{ padding: '6px', borderRadius: '4px', background: 'var(--sapphire-glow)' }}>
                                <Zap size={14} color="var(--sapphire)" fill="currentColor" />
                            </div>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '3px' }}>
                                PORTFOLIO ASSETS
                            </span>
                        </div>
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '32px' }}>
                        <span style={{ fontSize: '3.8rem', fontWeight: '900', letterSpacing: '-4px', fontFamily: 'var(--font-outfit)', color: '#fff' }}>
                            {user.coins.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--sapphire)', marginTop: '16px', letterSpacing: '2px' }}>FLOW</span>
                    </div>
                    <Link href="/wallet" className="btn" style={{ width: '100%', fontSize: '0.75rem', padding: '20px', background: '#fff', color: '#000' }}>
                        MANAGE CAPITAL <ChevronRight size={18} strokeWidth={3} />
                    </Link>
                </div>
                {/* Decorative Elements - Vibrant Sapphire Glow */}
                <div style={{
                    position: 'absolute', right: '-60px', bottom: '-60px',
                    opacity: 0.1, color: 'var(--sapphire)', transform: 'rotate(-10deg)'
                }}>
                    <Zap size={300} strokeWidth={1} />
                </div>
            </div>

            {/* Market Analytics - Global Velocity */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', marginBottom: '40px', borderRadius: '4px' }}>
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', color: 'var(--text-dim)' }}>PORTFOLIO VELOCITY</h3>
                    <Activity size={16} color="var(--emerald)" />
                </div>
                <div style={{ height: '80px', width: '100%', position: 'relative' }}>
                    <svg viewBox="0 0 400 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <path
                            d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10"
                            fill="none"
                            stroke="var(--emerald)"
                            strokeWidth="3"
                            style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
                        />
                        <path
                            d="M0,80 Q50,20 100,50 T200,30 T300,70 T400,10 L400,100 L0,100 Z"
                            fill="url(#goldGradient)"
                            opacity="0.1"
                        />
                        <defs>
                            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--emerald)" />
                                <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Portfolio Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                {/* Performance Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
                        <div style={{ color: 'var(--rose)', marginBottom: '16px' }}>
                            <Flame size={24} strokeWidth={1} />
                        </div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px' }}>STREAK</h3>
                        <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900' }}>2 DAYS</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '4px', border: '1px solid #222' }}>
                        <div style={{ color: 'var(--gold)', marginBottom: '16px' }}>
                            <Trophy size={24} strokeWidth={1} />
                        </div>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '900', marginBottom: '4px', letterSpacing: '1px' }}>RANK</h3>
                        <p style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: '900' }}>GOLD</p>
                    </div>
                </div>

                {/* Operations Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Link href="/game" className="glass-panel flex-between" style={{ padding: '24px', textDecoration: 'none', borderRadius: '4px', border: '1px solid #222' }}>
                        <div className="flex-center" style={{ gap: '20px' }}>
                            <div style={{
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                color: '#fff',
                                padding: '14px', borderRadius: '4px'
                            }}>
                                <Zap size={24} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>ARENA OPERATIONS</h4>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Payouts Enabled</p>
                            </div>
                        </div>
                        <span style={{
                            background: 'var(--rose)', color: '#fff',
                            fontSize: '0.6rem', fontWeight: '900',
                            padding: '4px 8px', borderRadius: '2px', letterSpacing: '1px',
                            animation: 'pulse 2s infinite'
                        }}>LIVE</span>
                    </Link>

                    <Link href="/earn" className="glass-panel flex-between" style={{ padding: '24px', textDecoration: 'none', borderRadius: '4px', border: '1px solid #222' }}>
                        <div className="flex-center" style={{ gap: '20px' }}>
                            <div style={{
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                color: '#fff',
                                padding: '14px', borderRadius: '4px'
                            }}>
                                <Target size={24} strokeWidth={1} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '900', fontSize: '0.9rem', color: '#fff', letterSpacing: '1px' }}>ASSET AQUISITION</h4>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px' }}>High Reward Missions</p>
                            </div>
                        </div>
                        <ChevronRight size={20} color="var(--text-dim)" />
                    </Link>
                </div>
            </div>

            {/* Referral Executive Card - Vibrant Emerald */}
            <div className="glass-panel" style={{
                padding: '40px',
                background: 'linear-gradient(135deg, #064e3b 0%, #000 80%)',
                border: '1px solid var(--emerald)',
                borderRadius: '8px',
                position: 'relative',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div className="flex-center" style={{ gap: '12px' }}>
                            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--emerald-glow)' }}>
                                <Users size={20} color="var(--emerald)" fill="currentColor" strokeWidth={1} />
                            </div>
                            <h4 style={{ fontWeight: '900', fontSize: '0.8rem', letterSpacing: '2px', color: '#fff' }}>NETWORK GROWTH</h4>
                        </div>
                        <span style={{ color: 'var(--emerald)', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '2px' }}>+100 FLOW</span>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '32px', lineHeight: '1.6' }}>
                        Scale the EarnFlow ecosystem. Disburse assets instantly to your portfolio for every successfully verified onboarding.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid #065f46',
                            borderRadius: '4px',
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
                                background: 'var(--emerald)',
                                color: '#000',
                                border: 'none'
                            }}
                        >
                            COPY
                        </button>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>
        </div>
    );
}
