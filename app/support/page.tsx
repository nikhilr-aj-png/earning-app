"use client";

import { Mail, MessageSquare, Info, ChevronLeft, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/dashboard" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO DASHBOARD
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-vibrant)' }}>
                        <MessageSquare size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>HELP CENTER</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>We are here to help you</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '24px', marginBottom: '64px', background: 'rgba(168, 85, 247, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <Info size={24} color="var(--violet)" />
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>NEED QUICK HELP?</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                If you are facing payment issues or login problems, use our **Live Chat** option below for faster resolution. Our support team is online 24/7.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "80px" }}>
                    <div className="glass-panel" style={{ padding: "40px", border: "1px solid #222", borderRadius: "24px", background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', width: 'fit-content', borderRadius: '12px', marginBottom: '24px' }}>
                            <Mail size={24} color="var(--primary)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: "0.85rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>EMAIL SUPPORT</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "32px", lineHeight: '1.6' }}>For account recovery and payment queries.</p>
                        <a href="mailto:support@earnflow.com" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: "#fff", fontSize: "1rem", fontWeight: "800", textDecoration: "none" }}>
                            support@earnflow.com <ExternalLink size={16} color="var(--primary)" />
                        </a>
                    </div>

                    <div className="glass-panel" style={{ padding: "40px", border: "1px solid #222", borderRadius: "24px", background: 'rgba(34, 197, 94, 0.05)' }}>
                        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', width: 'fit-content', borderRadius: '12px', marginBottom: '24px' }}>
                            <Zap size={24} color="var(--emerald)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: "0.85rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>LIVE CHAT</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "32px", lineHeight: '1.6' }}>Talk to our support agent instantly.</p>
                        <button className="btn" style={{ background: 'var(--grad-emerald)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
                            START CHAT <ChevronLeft size={16} style={{ rotate: '180deg' }} />
                        </button>
                    </div>
                </div>

                <section>
                    <div className="flex-between" style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "4px", color: "#fff" }}>FREQUENTLY ASKED QUESTIONS</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            {
                                q: "How do I withdraw my earnings?",
                                a: "You can withdraw your earnings instantly once you reach the minimum balance. Go to the Wallet section and select your preferred payment method (UPI, PayPal, etc.)."
                            },
                            {
                                q: "When are tasks updated?",
                                a: "New tasks are added daily. Check the 'Tasks' section every morning to find new high-paying offers from our partners."
                            },
                            {
                                q: "Can I use multiple accounts?",
                                a: "No. Using multiple accounts on the same device is strictly prohibited and will lead to a permanent ban to ensure fair play for everyone."
                            },
                            {
                                q: "Are the games fair?",
                                a: "Yes! All our games use certified random number generators to ensure fairness. Every round is verifiable."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="glass-panel" style={{ padding: "32px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: '16px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <div style={{ color: 'var(--primary)', fontWeight: '950', fontSize: '1.2rem' }}>?</div>
                                    <div>
                                        <h4 style={{ fontSize: "0.9rem", fontWeight: "900", color: "#fff", marginBottom: "12px", letterSpacing: "1px" }}>{faq.q.toUpperCase()}</h4>
                                        <p style={{ color: "var(--text-dim)", fontSize: "0.95rem", lineHeight: "1.7", fontWeight: '500' }}>{faq.a}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
