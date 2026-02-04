"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Zap, Rocket, ShieldCheck, ChevronRight, Globe, TrendingUp, Wallet, Trophy, Play, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, login, register, verifyOtp, loading } = useUser();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'otp' | 'forgot_email' | 'forgot_otp'>('email');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [refCode, setRefCode] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { forgotPassword, resetPassword, resendOtp } = useUser();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await resendOtp(email, step === 'otp' ? 'signup' : 'recovery');
      setResendTimer(30);
    } catch (err) {
      console.error(err);
    }
  };

  // Removed auto-redirect to allow landing page visibility
  // useEffect(() => {
  //   if (user && !loading) {
  //     router.push(user.is_admin ? '/admin' : '/dashboard');
  //   }
  // }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    // Detect recovery token from email link
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setOtp(accessToken);
        setStep('forgot_otp');
        setShowAuth(true);
        // Clear hash to prevent re-triggering
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

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
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await forgotPassword(email);
      setStep('forgot_otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      await resetPassword(email, otp, newPassword);
      setShowAuth(false);
      setStep('email');
      setIsLogin(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '100vh', color: 'var(--text-dim)', background: 'var(--bg-primary)' }}>Loading...</div>;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Blooms */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'var(--sapphire)', filter: 'blur(180px)', opacity: 0.1, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'var(--violet)', filter: 'blur(180px)', opacity: 0.1, pointerEvents: 'none' }} />

      {/* Navigation Bar */}
      <nav style={{ padding: '32px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div className="flex-center" style={{ gap: '12px' }}>
          <div style={{ padding: '8px', background: 'var(--grad-vibrant)', borderRadius: '12px', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}>
            <Zap size={24} color="#fff" fill="currentColor" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-1px', color: '#fff' }}>EARNFLOW</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {user ? (
            <Link href="/dashboard" className="btn" style={{ padding: '12px 24px', fontSize: '0.8rem', borderRadius: '12px', background: '#fff', color: '#000' }}>
              START EARNING
            </Link>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn" style={{ padding: '12px 24px', fontSize: '0.8rem', borderRadius: '12px', background: '#fff', color: '#000' }}>
              LOGIN
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ position: 'relative', zIndex: 5, padding: '80px 24px', textAlign: 'center' }}>
        <div className="animate-fade-in">
          <div className="badge-gold" style={{ marginBottom: '24px', padding: '8px 20px', borderRadius: '12px', fontSize: '0.7rem' }}>
            THE DIGITAL CAPITAL PROTOCOL IS ACTIVE
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '950', letterSpacing: '-4px', lineHeight: 1, color: '#fff', marginBottom: '32px' }}>
            Accelerate Your <br />
            <span className="text-gradient" style={{ background: 'var(--grad-vibrant)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Financial Velocity</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', width: '90%', maxWidth: 'var(--max-width)', margin: '0 auto 48px', lineHeight: '1.6', fontWeight: '500' }}>
            EarnFlow is a state-of-the-art ecosystem for asset management, opinion trading, and competitive arena operations.
          </p>

          <div className="flex-center" style={{ gap: '20px' }}>
            {user ? (
              <Link href="/dashboard" className="btn" style={{ height: '72px', padding: '0 48px', fontSize: '1rem', borderRadius: '20px', background: 'var(--grad-sapphire)', color: '#fff' }}>
                START EARNING <ChevronRight size={24} strokeWidth={3} />
              </Link>
            ) : (
              <button onClick={() => setShowAuth(true)} className="btn" style={{ height: '72px', padding: '0 48px', fontSize: '1rem', borderRadius: '20px', background: 'var(--grad-sapphire)', color: '#fff' }}>
                GET STARTED <Rocket size={24} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Detailed Education Modules */}
        <div style={{ marginTop: '160px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '160px' }}>

          {/* Section 1: Market Signal Analysis */}
          <div className="flex-between" style={{ gap: '80px', flexWrap: 'wrap-reverse' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="badge-gold" style={{ marginBottom: '24px' }}>OPERATIONAL INTELLIGENCE</div>
              <h2 style={{ fontSize: '3rem', fontWeight: '950', color: '#fff', marginBottom: '24px', letterSpacing: '-2px' }}>
                Advanced Data <br /> Synchronicity
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
                Our proprietary signal streams aggregate real-time market data across global endpoints. Experience zero-latency updates and high-fidelity analytics designed for the modern executor.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '900', marginBottom: '8px' }}>REAL-TIME FEED</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Instantaneous data transmission across all protocols.</p>
                </div>
                <div>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '900', marginBottom: '8px' }}>PREDICTIVE EDGE</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Algorithmic forecasting for superior decision making.</p>
                </div>
              </div>
            </div>
            <div className="glass-panel glass-vibrant" style={{ flex: 1, minWidth: '300px', height: '400px', borderRadius: '40px', background: 'var(--grad-sapphire)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={120} color="#fff" strokeWidth={1} style={{ opacity: 0.5 }} />
            </div>
          </div>

          {/* Section 2: Competitive Arena */}
          <div className="flex-between" style={{ gap: '80px', flexWrap: 'wrap' }}>
            <div className="glass-panel glass-vibrant" style={{ flex: 1, minWidth: '300px', height: '400px', borderRadius: '40px', background: 'var(--grad-emerald)', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={120} color="#fff" strokeWidth={1} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div className="badge-emerald" style={{ marginBottom: '24px', background: 'var(--emerald)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900' }}>HIGH VELOCITY ARENA</div>
              <h2 style={{ fontSize: '3rem', fontWeight: '950', color: '#fff', marginBottom: '24px', letterSpacing: '-2px' }}>
                Capital Deployment <br /> Redefined
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '32px' }}>
                Engage in high-stakes arena operations where precision meets performance. Our platform handles millions of micro-transactions per second with absolute integrity and speed.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <li style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="var(--emerald)" /> Instant Liquidity Settlement
                </li>
                <li style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="var(--emerald)" /> Immutable Round History
                </li>
                <li style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="var(--emerald)" /> Fair-Play Algorithmic Verification
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      {/* Auth Modal / Section */}
      {showAuth && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 1000, background: 'rgba(2, 6, 23, 0.95)', backdropFilter: 'blur(30px)',
          padding: '40px 24px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'
        }}>
          <div className="glass-panel glass-vibrant" style={{
            width: '99%', maxWidth: 'var(--max-width)', padding: '56px 40px',
            borderRadius: '32px', position: 'relative',
            background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
            boxShadow: '0 50px 100px rgba(0,0,0,0.8)',
            marginBottom: '40px'
          }}>
            <button onClick={() => setShowAuth(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '2rem' }}>&times;</button>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <Zap size={40} color="var(--primary)" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: '950', color: '#fff', letterSpacing: '4px' }}>PROTOCOL ACCESS</h2>
            </div>

            {step === 'email' ? (
              <>
                <div className="flex-between" style={{ marginBottom: '32px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <button
                    onClick={() => setIsLogin(true)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '12px',
                      background: isLogin ? 'var(--grad-sapphire)' : 'transparent',
                      color: '#fff',
                      border: 'none', fontWeight: '950', transition: '0.4s',
                      fontSize: '0.75rem', letterSpacing: '2px'
                    }}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    style={{
                      flex: 1, padding: '14px', borderRadius: '12px',
                      background: !isLogin ? 'var(--grad-vibrant)' : 'transparent',
                      color: '#fff',
                      border: 'none', fontWeight: '950', transition: '0.4s',
                      fontSize: '0.75rem', letterSpacing: '2px'
                    }}
                  >
                    JOIN CLUB
                  </button>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {!isLogin && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>FULL NAME</label>
                      <input
                        type="text" placeholder="EXECUTIVE IDENTITY"
                        value={name} onChange={(e) => setName(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                        required
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                    <input
                      type="email" placeholder="IDENTITY@PROTOCOL.COM"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div className="flex-between">
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>PASSWORD</label>
                      {isLogin && (
                        <button type="button" onClick={() => setStep('forgot_email')} style={{ fontSize: '0.65rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '900', letterSpacing: '1px' }}>FORGOT?</button>
                      )}
                    </div>
                    <input
                      type="password" placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                      required
                    />
                  </div>

                  {error && <div style={{ color: 'var(--rose)', fontSize: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{error}</div>}

                  <button className="btn" type="submit" disabled={isSubmitting} style={{ height: '64px', borderRadius: '16px', background: '#fff', color: '#000', fontSize: '0.9rem', marginTop: '12px' }}>
                    {isSubmitting ? 'AUTHORIZING...' : (isLogin ? 'INITIALIZE PROTOCOL' : 'REQUEST JOIN')}
                    <ChevronRight size={20} strokeWidth={3} />
                  </button>
                </form>
              </>
            ) : step === 'otp' ? (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>CODE TRANSMITTED TO <br /><b style={{ color: '#fff' }}>{email.toUpperCase()}</b></p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text" placeholder="000000" maxLength={6}
                    value={otp} onChange={(e) => setOtp(e.target.value)}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)',
                      padding: '24px', borderRadius: '16px', color: '#fff', outline: 'none',
                      fontSize: '2.5rem', fontWeight: '950', letterSpacing: '0.5em', textAlign: 'center'
                    }}
                    required
                  />
                </div>
                <button className="btn" type="submit" disabled={isSubmitting} style={{ height: '72px', borderRadius: '16px', background: 'var(--grad-emerald)', color: '#fff' }}>
                  {isSubmitting ? 'VALIDATING...' : 'CONFIRM IDENTITY'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                    DIDN'T RECEIVE CODE?{' '}
                    <span
                      onClick={handleResend}
                      style={{
                        color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {resendTimer > 0 ? `RESEND IN ${resendTimer}S` : 'RESEND'}
                    </span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep('email')} style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '950', background: 'none', border: 'none', cursor: 'pointer' }}>RESET PROTOCOL</button>
              </form>
            ) : step === 'forgot_email' ? (
              <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>RECOVER ACCESS CREDENTIALS</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>REGISTERED EMAIL</label>
                  <input
                    type="email" placeholder="IDENTITY@PROTOCOL.COM"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                    required
                  />
                </div>
                {error && <div style={{ color: 'var(--rose)', fontSize: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
                <button className="btn" type="submit" disabled={isSubmitting} style={{ height: '64px', borderRadius: '16px', background: '#fff', color: '#000', fontSize: '0.9rem' }}>
                  {isSubmitting ? 'TRANSMITTING...' : 'SEND RECOVERY CODE'}
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
                <button type="button" onClick={() => setStep('email')} style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '950', background: 'none', border: 'none', cursor: 'pointer' }}>BACK TO LOGIN</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>DEFINE NEW SECURITY PASSWORD</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>VERIFICATION CODE</label>
                    <input
                      type="text" placeholder="000000" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '8px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '950', paddingLeft: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>NEW PASSWORD</label>
                    <input
                      type="password" placeholder="••••••••"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '12px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
                      required
                    />
                  </div>
                </div>
                {error && <div style={{ color: 'var(--rose)', fontSize: '0.75rem', textAlign: 'center', fontWeight: '600' }}>{error}</div>}
                <button className="btn" type="submit" disabled={isSubmitting} style={{ height: '64px', borderRadius: '16px', background: 'var(--grad-emerald)', color: '#fff', fontSize: '0.9rem' }}>
                  {isSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                  <ShieldCheck size={20} strokeWidth={3} />
                </button>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px' }}>
                    CODE NOT ARRIVED?{' '}
                    <span
                      onClick={handleResend}
                      style={{
                        color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                        cursor: resendTimer > 0 ? 'not-allowed' : 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {resendTimer > 0 ? `RE-TRANSMIT IN ${resendTimer}S` : 'RESEND'}
                    </span>
                  </p>
                </div>
                <button type="button" onClick={() => setStep('email')} style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontWeight: '950', background: 'none', border: 'none', cursor: 'pointer' }}>CANCEL</button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
