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
        <div className="animate-fade-in" style={{ padding: '24px 20px', minHeight: '100vh', paddingBottom: '120px' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                    <div className="glass-panel flex-center" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '1.5px solid #fff', background: '#000' }}>
                        <User size={48} color="#fff" strokeWidth={1} />
                    </div>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>{user.name.toUpperCase()}</h1>
                <div className="flex-center" style={{ gap: '8px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', letterSpacing: '2px' }}>EXECUTIVE PROTOCOL</span>
                    <span style={{ background: '#fff', color: '#000', fontSize: '0.55rem', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' }}>VERIFIED</span>
                </div>
            </div>

            {/* Account Information Card */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #222', borderRadius: '4px', marginBottom: '24px', background: '#000' }}>
                <h2 style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '24px', textTransform: 'uppercase' }}>Identity Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="flex-between">
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <Mail size={18} color="var(--text-dim)" strokeWidth={1} />
                            <span style={{ fontSize: '0.85rem', color: '#fff' }}>{user.email}</span>
                        </div>
                    </div>
                    <div className="flex-between" style={{ borderTop: '1px solid #111', paddingTop: '20px' }}>
                        <div className="flex-center" style={{ gap: '16px' }}>
                            <Shield size={18} color="var(--text-dim)" strokeWidth={1} />
                            <span style={{ fontSize: '0.85rem', color: '#fff' }}>Secured by EarnFlow</span>
                        </div>
                        <ChevronRight size={16} color="var(--text-dim)" />
                    </div>
                </div>
            </div>

            {/* Portfolio Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #111', textAlign: 'center' }}>
                    <TrendingUp size={20} color="#fff" style={{ marginBottom: '12px' }} strokeWidth={1} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>TOTAL BALANCE</p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>{user.coins} <span style={{ fontSize: '0.6rem' }}>FLOW</span></h3>
                </div>
                <div className="glass-panel" style={{ padding: '24px', border: '1px solid #111', textAlign: 'center' }}>
                    <Users size={20} color="#fff" style={{ marginBottom: '12px' }} strokeWidth={1} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '1px', marginBottom: '4px' }}>REFERRALS</p>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900' }}>EXECUTIVE</h3>
                </div>
            </div>

            {/* Referral Management */}
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid #fff', borderRadius: '4px', marginBottom: '40px', background: '#000' }}>
                <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '0.7rem', fontWeight: '900', color: '#fff', letterSpacing: '3px', textTransform: 'uppercase' }}>Invitation Hub</h2>
                    <Zap size={18} color="#fff" strokeWidth={1} />
                </div>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '24px', lineHeight: '1.6' }}>Expand the elite network and acquire **100 Flow Credits** for every verified onboarding.</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid #222', padding: '16px', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '900', letterSpacing: '4px', textAlign: 'center' }}>
                        {user.referral_code}
                    </div>
                    <button onClick={copyReferral} className="btn" style={{ padding: '0 24px', background: '#fff', color: '#000', borderRadius: '4px' }}>
                        <Copy size={20} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Logout Action */}
            <button onClick={logout} className="btn" style={{ width: '100%', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', padding: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '2px' }}>
                TERMINATE SESSION <LogOut size={18} strokeWidth={2} />
            </button>
        </div>
    );
}
