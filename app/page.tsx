"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Zap, Rocket, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, login, register, verifyOtp, loading } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !loading) {
      if (user.is_admin) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await register(email, password, name, refCode);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await verifyOtp(email, otp);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh', color: 'var(--text-dim)' }}>Loading...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
      <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '60px' }}>
        <div className="glass-panel flex-center" style={{ width: '80px', height: '80px', borderRadius: '14px', marginBottom: '24px', border: '1px solid #fff', background: 'transparent' }}>
          <Zap size={40} color="#fff" strokeWidth={1} />
        </div>
        <h1 className="font-heading" style={{ fontSize: '3.5rem', marginBottom: '8px', textAlign: 'center', fontWeight: '900', letterSpacing: '-2px' }}>EARNFLOW</h1>
        <p style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.9rem', maxWidth: '300px', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600' }}>
          THE EXECUTIVE PORTFOLIO
        </p>
      </div>

      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ marginBottom: '48px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {step === 'email' ? (
            <>
              <div className="flex-between" style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <button
                  onClick={() => setIsLogin(true)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '6px',
                    background: isLogin ? '#fff' : 'transparent',
                    color: isLogin ? '#000' : 'var(--text-dim)',
                    border: 'none', fontWeight: '900', transition: 'all 0.4s var(--transition)',
                    fontSize: '0.75rem', letterSpacing: '2px'
                  }}
                >
                  SIGN IN
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '6px',
                    background: !isLogin ? '#fff' : 'transparent',
                    color: !isLogin ? '#000' : 'var(--text-dim)',
                    border: 'none', fontWeight: '900', transition: 'all 0.4s var(--transition)',
                    fontSize: '0.75rem', letterSpacing: '2px'
                  }}
                >
                  JOIN CLUB
                </button>
              </div>

              <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>IDENTITY NAME</label>
                    <input
                      type="text" placeholder="ENTER FULL NAME"
                      value={name} onChange={(e) => setName(e.target.value)}
                      style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '4px', color: '#fff', outline: 'none', transition: '0.3s', fontSize: '0.85rem' }}
                      onFocus={(e) => e.target.style.borderColor = '#fff'}
                      onBlur={(e) => e.target.style.borderColor = '#333'}
                      required
                    />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                  <input
                    type="email" placeholder="ADDRESS@DOMAIN.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '4px', color: '#fff', outline: 'none', transition: '0.3s', fontSize: '0.85rem' }}
                    onFocus={(e) => e.target.style.borderColor = '#fff'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>SECRET PASSKEY</label>
                  <input
                    type="password" placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '4px', color: '#fff', outline: 'none', transition: '0.3s', fontSize: '0.85rem' }}
                    onFocus={(e) => e.target.style.borderColor = '#fff'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                    required
                  />
                </div>

                {!isLogin && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>INVITATION CODE</label>
                    <input
                      type="text" placeholder="OPTIONAL CODE"
                      value={refCode} onChange={(e) => setRefCode(e.target.value)}
                      style={{ background: '#000', border: '1px solid #333', padding: '18px', borderRadius: '4px', color: '#fff', outline: 'none', transition: '0.3s', fontSize: '0.85rem' }}
                      onFocus={(e) => e.target.style.borderColor = '#fff'}
                      onBlur={(e) => e.target.style.borderColor = '#333'}
                    />
                  </div>
                )}

                {error && <div style={{ color: '#fff', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>{error}</div>}

                <button className="btn" type="submit" disabled={isSubmitting} style={{ marginTop: '12px' }}>
                  {isSubmitting ? 'AUTHORIZING...' : (isLogin ? 'ENTER FLOW' : 'REQUEST ACCESS')}
                  <Rocket size={16} strokeWidth={3} />
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '4px' }}>VERIFY IDENTITY</h3>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '1px' }}>CODE TRANSMITTED TO <b>{email.toUpperCase()}</b></p>
              </div>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: '900', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}>ENTER 6-DIGIT PASSCODE</label>
                  <input
                    type="text" placeholder="000000" maxLength={6}
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    style={{
                      background: '#000', border: '1px solid #333',
                      padding: '24px', borderRadius: '4px', color: '#fff', outline: 'none',
                      fontSize: '2rem', fontWeight: '900', letterSpacing: '0.6em', textAlign: 'center'
                    }}
                    required
                  />
                </div>

                {error && <div style={{ color: '#fff', fontSize: '0.75rem', textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>{error}</div>}

                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'VALIDATING...' : 'CONFIRM IDENTITY'}
                  <ShieldCheck size={16} strokeWidth={3} />
                </button>

                <button
                  type="button" onClick={() => setStep('email')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: '900', cursor: 'pointer', letterSpacing: '1px' }}
                >
                  RESET EMAIL ADDRESS
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
