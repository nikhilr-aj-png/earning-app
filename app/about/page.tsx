"use client";

import { Zap, ChevronLeft, Target, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO HOME
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px', background: 'var(--grad-vibrant)' }}>
                        <Users size={32} color="#fff" strokeWidth={1} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.8rem", fontWeight: "900", letterSpacing: "-2px", lineHeight: 1 }}>ABOUT US</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '6px' }}>Your Daily Earning Partner</p>
                    </div>
                </div>

                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", letterSpacing: "0.5px", lineHeight: "1.8", marginBottom: "80px", fontWeight: '500' }}>
                    EarnFlow is the premier platform where fun meets finance. We are dedicated to providing a seamless experience for users to earn real money by playing games, completing simple tasks, and inviting friends.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "100px" }}>
                    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
                        <div>
                            <div className="badge-gold" style={{ marginBottom: '24px' }}>OUR MISSION</div>
                            <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#fff", marginBottom: "20px", letterSpacing: "-1px" }}>Empowering Global Earners</h2>
                            <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "1rem" }}>
                                We believe everyone should have access to digital earning opportunities. Our platform connects you with top brands and exciting games, turning your spare time into a productive asset. No complex requirements, just simple actions and instant rewards.
                            </p>
                        </div>
                        <div className="glass-panel" style={{ padding: "60px 40px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "32px", textAlign: "center", background: 'rgba(255,255,255,0.02)' }}>
                            <Target size={64} color="var(--primary)" strokeWidth={1} style={{ marginBottom: "24px" }} />
                            <h3 style={{ fontSize: "0.8rem", fontWeight: "900", letterSpacing: "5px", color: 'var(--text-main)' }}>RELIABLE & FAST</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '16px' }}>100% VERIFIED PAYOUTS</p>
                        </div>
                    </section>

                    <section style={{ borderTop: "1px solid #111", paddingTop: "80px" }}>
                        <div className="flex-between" style={{ marginBottom: '60px' }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff", letterSpacing: "2px" }}>CORE FEATURES</h2>
                            <span style={{ color: 'var(--primary)', fontWeight: '950', fontSize: '0.7rem' }}>USER FOCUSED</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px" }}>
                            {[
                                { icon: Shield, title: "SECURE & SAFE", desc: "Your data and earnings are protected with top-tier security measures.", color: 'var(--sapphire)' },
                                { icon: Zap, title: "INSTANT WITHDRAWALS", desc: "Get paid instantly via UPI, PayPal, or Crypto as soon as you reach the threshold.", color: 'var(--emerald)' },
                                { icon: Users, title: "COMMUNITY FIRST", desc: "Join thousands of active users and participate in exciting tournaments.", color: 'var(--gold)' }
                            ].map((item, i) => (
                                <div key={i} className="glass-panel" style={{ padding: "40px", border: "1px solid #111", borderRadius: '24px' }}>
                                    <div style={{ padding: '12px', background: `${item.color}15`, width: 'fit-content', borderRadius: '12px', marginBottom: '24px' }}>
                                        <item.icon size={24} color={item.color} strokeWidth={1.5} />
                                    </div>
                                    <h4 style={{ fontSize: "0.85rem", fontWeight: "900", marginBottom: "12px", letterSpacing: "2px", color: '#fff' }}>{item.title}</h4>
                                    <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", lineHeight: "1.6" }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="glass-panel" style={{ padding: '60px', borderRadius: '40px', background: 'var(--grad-sapphire)', border: 'none', textAlign: 'center' }}>
                        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fff", marginBottom: '24px', letterSpacing: '-2px' }}>Start Earning Today</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                            Join EarnFlow now and turn your free time into cash. It&apos;s free, fair, and fun.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
