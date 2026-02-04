"use client";

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Flame, Target, Trophy, LogOut, ChevronRight, Zap, TrendingUp, Users, Activity, Copy, Crown } from "lucide-react";
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
        <div className="animate-fade-in" style={{ padding: '24px 8px' }}>
            {/* Branding Header - Link to Landing Page */}
            <div style={{ paddingBottom: '24px', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                <Link href="/" className="flex-center" style={{
                    gap: '12px', textDecoration: 'none', padding: '12px 24px', borderRadius: 'full', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)'
                }}>
                    <Zap size={18} color="var(--primary)" fill="var(--primary)" />
                    <span style={{ color: '#fff', fontWeight: '950', letterSpacing: '4px', fontSize: '0.9rem' }}>EARNFLOW</span>
                </Link>
            </div>


            {/* Decorative Background Bloom */}
            <div style={{ position: 'fixed', top: '10%', left: '-10%', width: '400px', height: '400px', background: 'var(--sapphire)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'fixed', bottom: '20%', right: '-10%', width: '300px', height: '300px', background: 'var(--violet)', filter: 'blur(150px)', opacity: 0.1, pointerEvents: 'none', zIndex: 0 }} />

            {/* Header Section */}
            <div className="flex-between" style={{ marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                <div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>
                            {greeting},
                        </span>
                        <div className="badge-gold" style={{ fontSize: '0.55rem' }}>VIP GOLD</div>
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px' }}>
                        {user.name.toUpperCase()}
                    </h1>
                </div>
                <button
                    onClick={logout}
                    className="glass-panel flex-center"
                    style={{ padding: '12px', borderRadius: '16px', color: 'var(--text-dim)', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)' }}
                >
                    <LogOut size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Executive Balance Card - Extreme Vibrant */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '60px 40px',
                background: 'linear-gradient(135deg, #1e40af 0%, #7e22ce 50%, #020617 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '32px',
                boxShadow: '0 40px 80px rgba(59, 130, 246, 0.3)',
                zIndex: 1
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                <Zap size={24} color="#fff" fill="currentColor" />
                            </div>
                            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '4px' }}>
                                ASSET CONTROL
                            </span>
                        </div>
                        {user.is_premium ? (
                            <div className="badge-gold flex-center" style={{ gap: '8px', padding: '8px 16px', borderRadius: '12px' }}>
                                <Crown size={14} fill="currentColor" />
                                <span style={{ fontSize: '0.65rem', fontWeight: '950', letterSpacing: '2px' }}>PREMIUM ELITE</span>
                            </div>
                        ) : (
                            <Link href="/premium" className="glass-panel flex-center" style={{ gap: '8px', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)' }}>
                                <span style={{ fontSize: '0.65rem', fontWeight: '950', letterSpacing: '2px', color: '#fff', opacity: 0.6 }}>FREE TIER</span>
                                <span style={{ fontSize: '0.6rem', fontWeight: '950', color: 'var(--gold)', letterSpacing: '1px' }}>UPGRADE</span>
                            </Link>
                        )}
                    </div>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '48px' }}>
                        <span style={{ fontSize: '5rem', fontWeight: '950', letterSpacing: '-6px', lineHeight: 1, color: '#fff' }}>
                            {user.coins.toLocaleString()}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '950', color: '#fff', opacity: 0.8, letterSpacing: '4px' }}>FLOW</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '950', color: 'var(--emerald)', letterSpacing: '1px' }}>
                                ≈ ₹{(user.coins / 10).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    <Link href="/wallet" className="btn" style={{ width: '100%', height: '72px', fontSize: '0.9rem', borderRadius: '16px', background: '#fff', color: '#000', boxShadow: '0 15px 30px rgba(255,255,255,0.2)' }}>
                        WITHDRAWAL <ChevronRight size={24} strokeWidth={3} />
                    </Link>
                </div>
                {/* Visual Accent */}
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '250px', height: '250px', background: 'var(--violet)', filter: 'blur(100px)', opacity: 0.3 }} />
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

            {/* Referral Executive Card - Extreme Emerald */}
            <div className="glass-panel glass-vibrant" style={{
                padding: '48px',
                background: 'linear-gradient(135deg, #065f46 0%, #1e40af 100%)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '24px',
                marginBottom: '40px',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                boxShadow: '0 30px 60px rgba(16, 185, 129, 0.2)'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                <Users size={24} color="#fff" />
                            </div>
                            <h4 style={{ fontWeight: '950', fontSize: '1rem', letterSpacing: '4px', color: '#fff' }}>NETWORK SCALE</h4>
                        </div>
                        <span style={{ color: 'var(--gold)', fontWeight: '950', fontSize: '0.8rem', letterSpacing: '2px' }}>+100 FLOW</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem', marginBottom: '40px', lineHeight: '1.6', fontWeight: '600' }}>
                        Scale the ecosystem by onboarding high-value nodes. <br />
                        <span style={{ color: 'var(--gold)' }}>ACQUIRE PREMIUM BONUSES INSTANTLY.</span>
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '24px',
                            fontSize: '1.75rem',
                            fontWeight: '950',
                            color: '#fff',
                            letterSpacing: '10px',
                            textAlign: 'center',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                        }}>
                            {user.referral_code}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(user.referral_code);
                                showToast("REFERRAL CODE COPIED", "success");
                            }}
                            className="btn"
                            style={{ width: '80px', background: '#fff', color: '#000', borderRadius: '16px' }}
                        >
                            <Copy size={28} strokeWidth={3} />
                        </button>
                    </div>
                </div>
                {/* Visual Accent */}
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '150px', height: '150px', background: 'var(--emerald)', filter: 'blur(100px)', opacity: 0.3 }} />
            </div>
        </div>
    );
}
