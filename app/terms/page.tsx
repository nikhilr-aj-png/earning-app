"use client";

import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div className="flex-center" style={{ justifyContent: "flex-start", gap: "12px", marginBottom: "24px" }}>
                    <Shield size={24} color="#fff" strokeWidth={1} />
                    <h1 className="font-heading" style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px" }}>TERMS OF SERVICE</h1>
                </div>

                <p style={{ color: "var(--text-dim)", fontSize: "0.7rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "60px" }}>VERSION 2.0.4 | LAST MODIFIED FEB 2026</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>1. EXECUTIVE AGREEMENT</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            By accessing the EarnFlow ecosystem, you acknowledge that you are participating in a digital asset acquisition protocol. You agree to utilize the platform's features, including the Arena and Prediction markets, with professional integrity.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>2. CREDIT DISBURSEMENT</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            Flow Credits are earned through verified behavioral participation. EarnFlow reserves the right to audit and verify all mission completions before final credit settlement.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>3. ACCOUNT INTEGRITY</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            One identity per executive. Utilization of automated systems, bots, or exploit protocols will result in immediate identity revocation and asset seizure.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
