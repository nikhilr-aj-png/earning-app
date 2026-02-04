"use client";

import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-gold)' }}>
                        <Shield size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>TERMS OF SERVICE</h1>
                        <p style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', textTransform: 'uppercase' }}>Governance Protocol v2.0.4</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', marginBottom: '60px' }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "1px" }}>
                        EXECUTIVE SUMMARY: BY INITIALIZING THE PROTOCOL, YOU AGREE TO BE BOUND BY CONTINUOUS IDENTITY VERIFICATION AND ASSET AUDITING.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>1. EXECUTIVE GOVERNANCE</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            By accessing the EarnFlow ecosystem, you acknowledge that you are participating in a high-fidelity digital asset acquisition protocol. You agree to utilize the platform's features, including the Arena and Task modules, with professional integrity and absolute adherence to system parameters.
                        </p>
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                "The platform serves as an orchestration layer; final asset valuation is subject to algorithmic stability checks."
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>2. ASSET SETTLEMENT & SECURITY</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            Flow Credits are internal platform assets representative of mission performance and behavioral synchronicity. EarnFlow reserves the right to audit and verify all mission completions before final credit settlement. Cross-node identity detection will result in immediate resource freezing.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%', marginTop: '8px' }} />
                                Instant settlement is targeted for all low-volume acquisition cycles.
                            </li>
                            <li style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%', marginTop: '8px' }} />
                                High-stake Arena operations are subject to immutable ledger verification.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>3. IDENTITY INTEGRITY PROTOCOL</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            One identity per executive. Utilization of automated systems, bots, or exploit protocols to manipulate the Arena outcome or Task velocity will result in immediate identity revocation and total asset seizure.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
