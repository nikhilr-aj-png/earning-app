"use client";

export const dynamic = 'force-dynamic';

import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Flame, Target, Trophy, LogOut, ChevronRight, Zap, TrendingUp, Users, Activity, Copy, Crown, History, Share2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

export default function Dashboard() {
    const { user, logout, refreshUser, loading } = useUser(); // Added loading
    const { showToast } = useToast();
    const router = useRouter();
    const [greeting] = useState(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    });

    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('/api/user/transactions', {
                    headers: { 'x-user-id': user?.id || '' }
                });
                const data = await response.json();
                if (Array.isArray(data)) {
                    setTransactions(data);
                }
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            }
        };

        if (user?.id) {
            fetchTransactions();
        }
    }, [user?.id]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        } else if (user) {
            if (user.is_admin) {
                router.push('/admin');
            } else {
                refreshUser();
            }
        }
    }, [user, loading, refreshUser, router]); // Added dependencies

    if (loading || !user) { // Show loading if loading OR user is not yet present (but redirect will happen if !loading && !user)
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
                        {user.is_premium && (
                            <div className="badge-gold" style={{ fontSize: '0.55rem' }}>VIP GOLD</div>
                        )}
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-2px' }}>
                        {user.name?.toUpperCase()}
                    </h1>
                </div>
            </div>

            {/* Executive Balance Card - Extreme Vibrant */}
            <div className="glass-panel glass-vibrant" style={{
                width: '75%',
                margin: '0 auto 40px',
                padding: '40px 24px',
                background: 'linear-gradient(135deg, #1e40af 0%, #7e22ce 50%, #020617 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '32px',
                boxShadow: '0 40px 80px rgba(59, 130, 246, 0.3)',
                zIndex: 1
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', marginBottom: '48px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(3rem, 12vw, 5rem)', fontWeight: '950', letterSpacing: '-2px', lineHeight: 1, color: '#fff' }}>
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


            {/* Portfolio Sections Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', marginBottom: '40px' }}>
                {/* Performance Metrics */}
                {/* Recent Activity Log */}
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '4px', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex-between" style={{ marginBottom: '12px' }}>
                        <div className="flex-center" style={{ gap: '8px' }}>
                            <div style={{ width: '4px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} />
                            <h3 style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '2px', color: '#fff' }}>RECENT ACTIVITY</h3>
                        </div>
                        <History size={16} color="var(--text-dim)" />
                    </div>

                    <div style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: '8px'
                    }}>
                        {transactions.length > 0 ? (
                            transactions.slice(0, 6).map((tx: any, index: number) => (
                                <div key={tx.id || index} className="animate-fade-in" style={{
                                    padding: '10px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    animationDelay: `${index * 50}ms`,
                                    position: 'relative',
                                    minHeight: '66px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '3px', background: 'rgba(52, 211, 153, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Zap size={10} color="var(--primary)" />
                                        </div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '950',
                                            color: tx.amount >= 0 ? 'var(--emerald)' : 'var(--rose)',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {tx.amount >= 0 ? '+' : ''}{tx.amount}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                        <div style={{
                                            fontSize: '0.6rem',
                                            fontWeight: '900',
                                            color: '#fff',
                                            letterSpacing: '0.2px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '100%'
                                        }}>
                                            {tx.description.includes('Result:')
                                                ? tx.description.split('|')[1]?.trim() || tx.description.split(']')[1]?.trim()
                                                : tx.type === 'earn' ? 'MISSION SUCCESS' : tx.description.split(']')[1]?.trim() || tx.type.toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: '0.5rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {tx.type}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-center" style={{ flex: 1, gridColumn: 'span 3', flexDirection: 'column', gap: '8px', opacity: 0.3, minHeight: '140px' }}>
                                <History size={24} />
                                <p style={{ fontSize: '0.6rem', fontWeight: '900', letterSpacing: '2px' }}>NO RECENT DATA</p>
                            </div>
                        )}
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
                        <span style={{ color: 'var(--gold)', fontWeight: '950', fontSize: '0.8rem', letterSpacing: '2px' }}>+{user.is_premium ? '100' : '50'} FLOW</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6', fontWeight: '600' }}>
                        Invite high-value nodes to the ecosystem. <br />
                        <span style={{ color: 'var(--gold)' }}>ACQUIRE {user.is_premium ? '100' : '50'} FLOW PER VALID ONBOARDING.</span>
                    </p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '24px',
                            fontSize: '0.9rem',
                            fontWeight: '800',
                            color: '#fff',
                            letterSpacing: '1px',
                            textAlign: 'center',
                            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            earnflow.in/?ref={user.referral_code}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    const refLink = `https://earnflow.in/?ref=${user.referral_code}`;
                                    navigator.clipboard.writeText(refLink);
                                    showToast("REFERRAL LINK COPIED", "success");
                                }}
                                className="btn"
                                style={{ width: '64px', height: '64px', background: '#fff', color: '#000', borderRadius: '16px', padding: 0 }}
                                title="Copy Referral Link"
                            >
                                <Copy size={24} strokeWidth={3} />
                            </button>
                            <button
                                onClick={() => {
                                    const refLink = `https://earnflow.in/?ref=${user.referral_code}`;
                                    const message = encodeURIComponent(`🚀 Join EARNFLOW and start earning today! \n\nRegister here: ${refLink}`);
                                    window.open(`https://wa.me/?text=${message}`, '_blank');
                                }}
                                className="btn"
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    background: '#25D366',
                                    color: '#fff',
                                    borderRadius: '16px',
                                    padding: 0,
                                    boxShadow: '0 10px 20px rgba(37, 211, 102, 0.3)'
                                }}
                                title="Invite on WhatsApp"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
