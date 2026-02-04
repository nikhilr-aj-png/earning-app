"use client";

import { ShieldAlert, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div className="flex-center" style={{ justifyContent: "flex-start", gap: "12px", marginBottom: "24px" }}>
                    <ShieldAlert size={24} color="#fff" strokeWidth={1} />
                    <h1 className="font-heading" style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px" }}>PRIVACY PROTOCOL</h1>
                </div>

                <p style={{ color: "var(--text-dim)", fontSize: "0.7rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "60px" }}>ENCRYPTION LEVEL: AES-256 | PRIVACY RATIO: 1.0</p>

                <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>1. DATA COLLECTION</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            We only capture essential telemetry required for transaction verification and account security. This includes your verified email and mission performance metrics.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>2. SECURITY INFRASTRUCTURE</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            All assets and identity data are secured using industry-standard encryption. Our database architecture ensures that sensitive credentials never enter plain-text storage.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "20px" }}>3. THIRD-PARTY DISCLOSURE</h2>
                        <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.9rem" }}>
                            EarnFlow does not trade your identity. Data is only shared with verified infrastructure providers (like Supabase) essential for the operational continuity of the platform.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
