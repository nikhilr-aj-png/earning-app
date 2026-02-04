"use client";

import Link from "next/link";
import { Zap, Shield, Twitter, Github, Mail, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isAuthPage = pathname === "/";

    if (isAuthPage) return null;

    return (
        <footer style={{
            background: "#000",
            borderTop: "1px solid #111",
            padding: "80px 24px 120px",
            marginTop: "60px",
            color: "#fff"
        }}>
            <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "60px", marginBottom: "80px" }}>
                    {/* Brand Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <Zap size={24} color="#fff" strokeWidth={2} />
                            <span style={{ fontWeight: "900", letterSpacing: "2px", fontSize: "1.2rem" }}>EARNFLOW</span>
                        </div>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.80rem", lineHeight: "1.8", letterSpacing: "1px" }}>
                            The elite standard in high-fidelity digital asset acquisition. Built for precision, security, and exponential growth.
                        </p>
                        <div style={{ display: "flex", gap: "16px" }}>
                            <Link href="#" style={{ color: "var(--text-dim)", transition: "0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}><Twitter size={18} /></Link>
                            <Link href="#" style={{ color: "var(--text-dim)", transition: "0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}><Github size={18} /></Link>
                            <Link href="#" style={{ color: "var(--text-dim)", transition: "0.3s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#fff"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-dim)"}><Mail size={18} /></Link>
                        </div>
                    </div>

                    {/* Navigation Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <h4 style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase" }}>OPERATIONS</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                            <li><Link href="/dashboard" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Dashboard</Link></li>
                            <li><Link href="/game" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Arena</Link></li>
                            <li><Link href="/predictions" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Predict</Link></li>
                            <li><Link href="/earn" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Tasks</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <h4 style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase" }}>SUPPORT</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
                            <li><Link href="/support" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Help Center</Link></li>
                            <li><Link href="/about" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>About Identity</Link></li>
                            <li><Link href="/terms" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Terms of Service</Link></li>
                            <li><Link href="/privacy" style={{ color: "var(--text-dim)", textDecoration: "none", fontSize: "0.8rem", transition: "0.3s" }}>Privacy Protocol</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Disclaimer */}
                <div style={{ borderTop: "1px solid #222", paddingTop: "40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "24px" }}>
                    <p style={{ color: "var(--text-dim)", fontSize: "0.65rem", fontWeight: "900", letterSpacing: "1px" }}>
                        &copy; 2026 EARNFLOW GLOBAL PORTFOLIO. ALL SYSTEMS OPERATIONAL.
                    </p>
                    <div className="flex-center" style={{ gap: "24px" }}>
                        <div className="flex-center" style={{ gap: "8px", color: "var(--success)" }}>
                            <Shield size={14} />
                            <span style={{ fontSize: "0.6rem", fontWeight: "900", letterSpacing: "1px" }}>SECURED BY AES-256</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
