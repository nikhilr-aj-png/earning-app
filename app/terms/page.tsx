"use client";

import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO HOME
            </Link>

            <div style={{ width: '99%', maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '16px', background: 'var(--grad-gold)' }}>
                        <Shield size={32} color="#fff" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-heading" style={{ fontSize: "2.5rem", fontWeight: "900", letterSpacing: "-1px", lineHeight: 1 }}>TERMS OF SERVICE</h1>
                        <p style={{ color: 'var(--gold)', fontSize: '0.7rem', fontWeight: '950', letterSpacing: '4px', textTransform: 'uppercase' }}>User Agreement v1.0</p>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'rgba(250, 204, 21, 0.05)', border: '1px solid rgba(250, 204, 21, 0.2)', marginBottom: '60px' }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontWeight: "700", letterSpacing: "1px" }}>
                        SUMMARY: BY USING EARNFLOW, YOU AGREE TO FOLLOW OUR FAIR PLAY RULES. CHEATING OR MULTIPLE ACCOUNTS WILL RESULT IN A BAN.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>1. ACCOUNT RULES</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            By creating an account on EarnFlow, you verify that you are a real person. You are allowed only ONE account. Creating multiple accounts to abuse the referral system or games will lead to immediate permanent suspension.
                        </p>
                        <div className="glass-panel" style={{ padding: '24px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                "We treat fair play seriously. Play fair, earn fair."
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>2. EARNINGS & PAYMENTS</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem", marginBottom: '20px' }}>
                            Withdrawal requests are processed automatically. However, we reserve the right to review high-value withdrawals for security purposes. Minimum withdrawal limits must be met before a request can be submitted.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%', marginTop: '8px' }} />
                                Payouts are made via UPI, PayPal, or Crypto.
                            </li>
                            <li style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                <div style={{ minWidth: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%', marginTop: '8px' }} />
                                Incorrect payment details are the user's responsibility.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "1rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "24px" }}>3. PROHIBITED ACTIVITIES</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                            Using VPNs, proxies, bots, or emulators is strictly prohibited. Any attempt to manipulate task completion or game outcomes will result in a forfeited balance and account ban.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
