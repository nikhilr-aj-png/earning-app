"use client";

export const dynamic = 'force-dynamic';

import { ShieldAlert, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO HOME
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-sapphire)' }}>
                        <ShieldAlert size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>PRIVACY POLICY</h1>
                        <p style={{ color: 'var(--primary)', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', textTransform: 'uppercase' }}>Your Data Security v1.0</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '60px' }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "1px" }}>
                        SUMMARY: WE RESPECT YOUR PRIVACY. WE DO NOT SELL YOUR PERSONAL DATA TO THIRD PARTIES.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>1. DATA COLLECTION</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            We only collect minimal data required to operate your account, such as your email address and profile name. We also track your completed tasks and game scores to calculate your earnings accurately.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>2. DATA SECURITY</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            All your data is encrypted. We use industry-standard security measures to protect your account from unauthorized access. Your password is never stored in plain text.
                        </p>
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                &quot;Your earning history and personal details are private.&quot;
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>3. THIRD PARTIES</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            We may share anonymous data with task providers to verify completion, but we never share your personal contact information without your explicit consent.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
