"use client";

import { Mail, MessageSquare, Info, ChevronLeft, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/dashboard" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> RETURN TO DASHBOARD
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-vibrant)' }}>
                        <MessageSquare size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>SUPPORT TERMINAL</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '4px' }}>Executive Support Cluster</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '32px', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '24px', marginBottom: '64px', background: 'rgba(168, 85, 247, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <Info size={24} color="var(--violet)" />
                        <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#fff', marginBottom: '8px' }}>CRITICAL PROTOCOL</h3>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                For immediate identity restoration or large-scale asset synchronization issues, please prioritize the **Secure Signal Bridge** (Telegram Hub). Our executive responders operate on prioritized latency channels.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "80px" }}>
                    <div className="glass-panel" style={{ padding: "40px", border: "1px solid #222", borderRadius: "24px", background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ padding: '12px', background: 'rgba(56, 189, 248, 0.1)', width: 'fit-content', borderRadius: '12px', marginBottom: '24px' }}>
                            <Mail size={24} color="var(--primary)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: "0.85rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>ENCRYPTED EMAIL</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "32px", lineHeight: '1.6' }}>Formal documentation and asset verification disputes.</p>
                        <a href="mailto:support@earnflow.global" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: "#fff", fontSize: "1rem", fontWeight: "800", textDecoration: "none" }}>
                            support@earnflow.global <ExternalLink size={16} color="var(--primary)" />
                        </a>
                    </div>

                    <div className="glass-panel" style={{ padding: "40px", border: "1px solid #222", borderRadius: "24px", background: 'rgba(34, 197, 94, 0.05)' }}>
                        <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', width: 'fit-content', borderRadius: '12px', marginBottom: '24px' }}>
                            <Zap size={24} color="var(--emerald)" strokeWidth={1.5} />
                        </div>
                        <h3 style={{ fontSize: "0.85rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>SIGNAL HUB</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", marginBottom: "32px", lineHeight: '1.6' }}>Instant-response community and operational bridging.</p>
                        <button className="btn" style={{ background: 'var(--grad-emerald)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
                            OPEN BRIDGE <ChevronLeft size={16} style={{ rotate: '180deg' }} />
                        </button>
                    </div>
                </div>

                <section>
                    <div className="flex-between" style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "4px", color: "#fff" }}>KNOWLEDGE BASE</h2>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '900' }}>REV 2.0.4</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            {
                                q: "How are Flow Credits valued?",
                                a: "Flow Credits are internal platform assets representative of mission completion performance. They utilize a proprietary valuation algorithm calibrated against multi-source liquidity signals and ecosystem activity."
                            },
                            {
                                q: "When are mission rewards settled?",
                                a: "Standard settlement occurs instantaneously upon verified mission completion. High-volume acquisition missions may undergo a 12-to-24 hour executive audit to ensure protocol compliance and asset integrity."
                            },
                            {
                                q: "Can I manage multiple identities?",
                                a: "No. EarnFlow's security protocol strictly enforces a one-identity-per-executive policy. Cross-identity resource pooling is detected via biometric telemetry and results in immediate identity revocation."
                            },
                            {
                                q: "Is the Arena algorithmic performance verified?",
                                a: "Yes. Every single round in the Arena is governed by a fair-play cryptographic checksum. Audit logs for individual performance cycles are available via the 'Round History' module."
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
