"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { Coins, Flame, Target, Trophy, LogOut, ChevronRight, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    const { user, logout, refreshUser } = useUser();
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    });

    useEffect(() => {
        if (user) {
            refreshUser();
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

            {/* Premium Balance Card */}
            <div className="glass-panel" style={{
                padding: '28px',
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, #1a1f26 100%)',
                border: '1px solid var(--glass-border)',
                marginBottom: '32px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Available Credits
                        </span>
                        <Zap size={18} color="var(--primary)" />
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            background: 'var(--primary)',
                            borderRadius: '12px',
                            width: '32px', height: '32px'
                        }} className="flex-center">
                            <Coins size={18} color="#000" />
                        </div>
                        <span style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', fontFamily: 'var(--font-outfit)' }}>
                            {user.coins.toLocaleString()}
                        </span>
                    </div>
                    <Link href="/wallet" className="btn" style={{ width: '100%', fontSize: '0.85rem', padding: '12px' }}>
                        MANAGE WALLET <ChevronRight size={16} />
                    </Link>
                </div>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute', right: '-20px', bottom: '-20px',
                    opacity: 0.05, color: 'var(--primary)', transform: 'rotate(-15deg)'
                }}>
                    <Coins size={160} />
                </div>
            </div>

            {/* Dashboard Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Quick Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '12px' }}>
                            <Flame size={24} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Streak</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Active 2 days</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <div style={{ color: 'var(--secondary)', marginBottom: '12px' }}>
                            <TrendingUp size={24} />
                        </div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Rank</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Gold Tier</p>
                    </div>
                </div>

                {/* Main Menu Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Link href="/game" className="glass-panel flex-between" style={{ padding: '18px 20px', textDecoration: 'none' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{
                                background: 'rgba(189, 0, 255, 0.1)',
                                color: 'var(--secondary)',
                                padding: '12px', borderRadius: '14px'
                            }}>
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Elite 2-Card</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Win up to 10k coins</p>
                            </div>
                        </div>
                        <span style={{
                            background: 'rgba(189, 0, 255, 0.2)', color: 'var(--secondary)',
                            fontSize: '0.65rem', fontWeight: '800',
                            padding: '4px 8px', borderRadius: '6px'
                        }}>HOT</span>
                    </Link>

                    <Link href="/earn" className="glass-panel flex-between" style={{ padding: '18px 20px', textDecoration: 'none' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{
                                background: 'rgba(0, 242, 255, 0.1)',
                                color: 'var(--primary)',
                                padding: '12px', borderRadius: '14px'
                            }}>
                                <Target size={24} />
                            </div>
                            <div>
                                <h4 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Task Hub</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>New tasks added</p>
                            </div>
                        </div>
                        <div className="flex-center" style={{ gap: '4px', color: 'var(--primary)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Explore</span>
                            <ChevronRight size={14} />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Referral Professional Card */}
            <div className="glass-panel" style={{
                padding: '24px',
                background: 'linear-gradient(90deg, #1a1e2e 0%, #151926 100%)',
                border: '1px solid rgba(0, 242, 255, 0.1)'
            }}>
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <div className="flex-center" style={{ gap: '10px' }}>
                        <Users size={20} color="var(--primary)" />
                        <h4 style={{ fontWeight: '700', fontSize: '1rem' }}>Invite Friends</h4>
                    </div>
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem' }}>GET +100</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '20px', lineHeight: '1.4' }}>
                    Grow your network and earn passive coins for every verified referral.
                </p>
                <div className="flex" style={{ gap: '10px' }}>
                    <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-dim)',
                        textAlign: 'center'
                    }}>
                        {user.referral_code}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(user.referral_code);
                            alert("Code copied!");
                        }}
                        style={{
                            background: 'var(--primary)', color: '#000',
                            border: 'none', borderRadius: '12px', padding: '0 20px',
                            fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer'
                        }}
                    >
                        COPY
                    </button>
                </div>
            </div>
        </div>
    );
}
