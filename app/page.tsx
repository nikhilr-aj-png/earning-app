"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Zap, Rocket, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, sendOtp, verifyOtp, loading } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [refCode, setRefCode] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await sendOtp(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await verifyOtp(email, otp, isLogin ? undefined : name, isLogin ? undefined : refCode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh', color: 'var(--text-dim)' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
      <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '40px' }}>
        <div className="glass-panel flex-center" style={{ width: '70px', height: '70px', borderRadius: '24px', marginBottom: '20px', border: '1px solid var(--primary)', background: 'var(--primary-glow)' }}>
          <Zap size={36} color="#000" fill="#000" />
        </div>
        <h1 className="text-gradient" style={{ fontSize: '2.8rem', marginBottom: '4px', textAlign: 'center' }}>EarnFlow</h1>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '1rem', maxWidth: '280px' }}>
          Ultra-Secure Passwordless Earning
        </p>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ marginBottom: '32px' }}>
          {step === 'email' ? (
            <>
              <div className="flex-between" style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '14px' }}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: isLogin ? 'var(--primary)' : 'transparent',
                    color: isLogin ? '#000' : 'var(--text-dim)',
                    border: 'none', fontWeight: '800', transition: 'all 0.4s var(--transition)',
                    fontSize: '0.9rem'
                  }}
                >
                  LOGIN
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    background: !isLogin ? 'var(--primary)' : 'transparent',
                    color: !isLogin ? '#000' : 'var(--text-dim)',
                    border: 'none', fontWeight: '800', transition: 'all 0.4s var(--transition)',
                    fontSize: '0.9rem'
                  }}
                >
                  REGISTER
                </button>
              </div>

              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                    <input
                      type="text" placeholder="John Doe"
                      value={name} onChange={(e) => setName(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none', transition: '0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                      required
                    />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
                  <input
                    type="email" placeholder="email@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none', transition: '0.3s' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    required
                  />
                </div>
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referral Code (Optional)</label>
                    <input
                      type="text" placeholder="CODE123"
                      value={refCode} onChange={(e) => setRefCode(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '12px', color: '#fff', outline: 'none', transition: '0.3s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                    />
                  </div>
                )}

                {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255,77,77,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}

                <button className="btn" type="submit" disabled={isSubmitting} style={{ marginTop: '10px' }}>
                  {isSubmitting ? 'SENDING OTP...' : 'GET SECURE OTP'}
                  <Rocket size={18} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '8px' }}>VERIFY IDENTITY</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>OTP sent to <b>{email}</b></p>
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enter 6-Digit Code</label>
                  <input
                    type="text" placeholder="123456" maxLength={6}
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)',
                      padding: '16px', borderRadius: '12px', color: '#fff', outline: 'none',
                      fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.5em', textAlign: 'center'
                    }}
                    required
                  />
                </div>

                {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255,77,77,0.1)', padding: '8px', borderRadius: '8px' }}>{error}</div>}

                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'VERIFYING...' : 'CONFIRM & LOGIN'}
                  <ShieldCheck size={18} />
                </button>

                <button
                  type="button" onClick={() => setStep('email')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  CHANGE EMAIL ADDRESS
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px', padding: '16px 8px', borderRadius: '20px' }}>
          <Zap size={22} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Lightning Fast</span>
        </div>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px', padding: '16px 8px', borderRadius: '20px' }}>
          <ShieldCheck size={22} color="var(--success)" fill="var(--success)" fillOpacity={0.1} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Ultra Secure</span>
        </div>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', gap: '8px', padding: '16px 8px', borderRadius: '20px' }}>
          <Rocket size={22} color="var(--secondary)" fill="var(--secondary)" fillOpacity={0.1} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textAlign: 'center', fontWeight: '600', textTransform: 'uppercase' }}>Daily Growth</span>
        </div>
      </div>
    </div>
  );
}
