"use client";

import { useUser } from "@/context/UserContext";
import { User, Mail, Shield, Copy, LogOut, ChevronRight, Zap, Users, TrendingUp } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function ProfilePage() {
    const { user, logout } = useUser();
    const { showToast } = useToast();

    if (!user) return <div className="flex-center" style={{ minHeight: '80vh', color: 'var(--text-dim)' }}>INITIALIZING PROFILE...</div>;

    const copyReferral = () => {
        navigator.clipboard.writeText(user.referral_code);
        showToast("REFERRAL CODE COPIED", "success");
    };

    return (
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '100vh', paddingBottom: '140px' }}>
            {/* Header Section - Vibrant Identity */}
            <div style={{ marginBottom: '56px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                    <div className="glass-panel flex-center" style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        border: '2px solid var(--sapphire)',
                        background: 'linear-gradient(135deg, #001f3f 0%, #000 100%)',
                        boxShadow: '0 20px 40px rgba(0, 112, 243, 0.2)'
                    }}>
                        <User size={56} color="var(--sapphire)" strokeWidth={1.5} fill="rgba(0,112,243,0.1)" />
                    </div>
                    {/* Floating Verified Badge */}
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px' }}>
                        <div className="badge-gold" style={{ padding: '6px', borderRadius: '50%', boxShadow: '0 5px 15px rgba(212,175,55,0.4)' }}>
                            <Shield size={14} color="#000" strokeWidth={3} />
                        </div>
                    </div>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '950', letterSpacing: '-2px', marginBottom: '8px', color: '#fff' }}>{user.name.toUpperCase()}</h1>
                <div className="flex-center" style={{ gap: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '950', letterSpacing: '4px' }}>EXECUTIVE PROTOCOL</span>
                    <span className="badge-gold" style={{ fontSize: '0.55rem', fontWeight: '950', padding: '3px 10px', borderRadius: '4px', letterSpacing: '1px' }}>VERIFIED PARTNER</span>
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
                            <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--gold-glow)' }}>
                                <Shield size={18} color="var(--gold)" strokeWidth={2} />
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: '800' }}>Secure Session Active</span>
                        </div>
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                </div>
            </div>

            {/* Portfolio Statistics - Accented */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', textAlign: 'center', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                    <TrendingUp size={24} color="var(--sapphire)" style={{ marginBottom: '16px' }} strokeWidth={2} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '3px', marginBottom: '8px' }}>LIQUIDITY</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>{user.coins.toLocaleString()} <span style={{ fontSize: '0.7rem', color: 'var(--sapphire)' }}>FLOW</span></h3>
                </div>
                <div className="glass-panel" style={{ padding: '32px', border: '1px solid #111', textAlign: 'center', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                    <Users size={24} color="var(--gold)" style={{ marginBottom: '16px' }} strokeWidth={2} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '950', letterSpacing: '3px', marginBottom: '8px' }}>PARTNERS</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '950', color: '#fff' }}>ELITE</h3>
                </div>
            </div>

            {/* Referral Management - Vibrant Emerald Hub */}
            <div className="glass-panel" style={{
                padding: '48px 40px',
                border: '1.5px solid var(--emerald)',
                borderRadius: '12px',
                marginBottom: '40px',
                background: 'linear-gradient(135deg, #064e3b 0%, #000 80%)',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div className="flex-between" style={{ marginBottom: '24px' }}>
                        <div className="flex-center" style={{ gap: '12px' }}>
                            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--emerald-glow)' }}>
                                <Zap size={20} color="var(--emerald)" fill="currentColor" />
                            </div>
                            <h2 style={{ fontSize: '0.8rem', fontWeight: '950', color: '#fff', letterSpacing: '4px', textTransform: 'uppercase' }}>INVITATION HUB</h2>
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '32px', lineHeight: '1.6' }}>Scale the EarnFlow ecosystem. Disburse **100 FLOW** instantly for every successful partnership.</p>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid #065f46', padding: '20px', borderRadius: '8px', fontSize: '1.4rem', fontWeight: '950', letterSpacing: '8px', textAlign: 'center', color: '#fff' }}>
                            {user.referral_code}
                        </div>
                        <button onClick={copyReferral} className="btn" style={{ width: '80px', background: 'var(--emerald)', color: '#000', borderRadius: '8px', border: 'none' }}>
                            <Copy size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle at 2px 2px, var(--emerald) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>

            {/* Logout Action */}
            <button onClick={logout} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px' }}>
                TERMINATE SESSION <LogOut size={18} strokeWidth={2} />
            </button>
        </div>
    );
}
