"use client";

import { Zap, ChevronLeft, Target, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '20px', borderRadius: '24px', background: 'var(--grad-vibrant)' }}>
                        <Users size={32} color="#fff" strokeWidth={1} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.8rem", fontWeight: "900", letterSpacing: "-2px", lineHeight: 1 }}>ECOSYSTEM IDENTITY</h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '6px' }}>Protocol Governance v2.0</p>
                    </div>
                </div>

                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.2rem", letterSpacing: "0.5px", lineHeight: "1.8", marginBottom: "80px", fontWeight: '500' }}>
                    EarnFlow is a next-generation orchestration layer for digital participation. We are building the infrastructure that transforms raw engagement into high-fidelity financial outcomes for the modern executor.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "100px" }}>
                    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "60px", alignItems: "center" }}>
                        <div>
                            <div className="badge-gold" style={{ marginBottom: '24px' }}>STRATEGIC VISION</div>
                            <h2 style={{ fontSize: "2rem", fontWeight: "900", color: "#fff", marginBottom: "20px", letterSpacing: "-1px" }}>The Liquidity Paradigm</h2>
                            <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "1rem" }}>
                                We believe in a self-sovereign digital future where participation equals value. Our platform acts as a decentralized terminal, synchronizing global mission data with local asset acquisition to provide the most professional earning environment in the sector.
                            </p>
                        </div>
                        <div className="glass-panel" style={{ padding: "60px 40px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "32px", textAlign: "center", background: 'rgba(255,255,255,0.02)' }}>
                            <Target size={64} color="var(--primary)" strokeWidth={1} style={{ marginBottom: "24px" }} />
                            <h3 style={{ fontSize: "0.8rem", fontWeight: "900", letterSpacing: "5px", color: 'var(--text-main)' }}>PRECISION SCALE</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '16px' }}>CALIBRATED TO 10^⁻6 ACCURACY</p>
                        </div>
                    </section>

                    <section style={{ borderTop: "1px solid #111", paddingTop: "80px" }}>
                        <div className="flex-between" style={{ marginBottom: '60px' }}>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff", letterSpacing: "2px" }}>OPERATIONAL STACK</h2>
                            <span style={{ color: 'var(--primary)', fontWeight: '950', fontSize: '0.7rem' }}>ISO-27001 COMPLIANT</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "32px" }}>
                            {[
                                { icon: Shield, title: "SECURITY LAYER", desc: "Multi-factor cryptographic authentication and AES-256 data-at-rest encryption protocols.", color: 'var(--sapphire)' },
                                { icon: Zap, title: "VELOCITY ENGINE", desc: "Proprietary high-frequency settlement cluster ensuring <200ms transaction finality.", color: 'var(--emerald)' },
                                { icon: Users, title: "ELITE NETWORK", desc: "Access to a global network of 15k+ high-performance executors and mission coordinators.", color: 'var(--gold)' }
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
                        <h2 style={{ fontSize: "2.5rem", fontWeight: "900", color: "#fff", marginBottom: '24px', letterSpacing: '-2px' }}>Operational Excellence</h2>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
                            At EarnFlow, we prioritize system integrity above all else. Our governance model ensures that every mission reward is backed by real utility and verified participant engagement.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
