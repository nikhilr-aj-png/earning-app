"use client";

import { ShieldAlert, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-sapphire)' }}>
                        <ShieldAlert size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>PRIVACY PROTOCOL</h1>
                        <p style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', textTransform: 'uppercase' }}>Zero-Trust Framework v2.0</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '60px' }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "1px" }}>
                        TELEMETRY RATIO: 1.0 (MINIMAL) | DATA RETENTION: VOLATILE | ENCRYPTION: SHA-256 / AES-256
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>1. TELEMETRY MINIMALIZATION</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            EarnFlow operates on a "Need-to-Know" data principle. We only capture essential telemetry required for transaction verification and account security. This includes your verified email, mission performance metrics, and high-level behavioral signals for anti-exploit auditing.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>2. ZERO-TRUST ARCHITECTURE</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            All assets and identity data are secured using a Zero-Trust infrastructure. Sensitive credentials, including passkeys and liquidity tokens, are hashed and secured in an encrypted vault. Our architecture ensures that plain-text data never persists in non-volatile memory.
                        </p>
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                "Your identity is a cryptographic node, not a commercial commodity."
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>3. THIRD-PARTY ISOLATION</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            EarnFlow does not trade, monetize, or outsource your identity. Data is only shared with verified infrastructure providers (like Supabase) essential for technical continuity. All external signals are anonymized via a proprietary middle-ware proxy to maintain participant obfuscation.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
