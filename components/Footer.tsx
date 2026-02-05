"use client";

import Link from "next/link";
import { Zap, Shield, Twitter, Github, Mail, ExternalLink } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    if (!isHomePage) return null;

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
                            The #1 platform for daily earnings. Play games, complete tasks, and withdraw instant cash rewards.
                        </p>
                    </div>

                    {/* Navigation Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <h4 style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", color: 'var(--primary)' }}>EARN</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                            <li>
                                <Link href="/dashboard" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)' }}>
                                        <Zap size={14} color="var(--primary)" />
                                    </div>
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/game" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)' }}>
                                        <Zap size={14} color="var(--emerald)" />
                                    </div>
                                    Arena
                                </Link>
                            </li>
                            <li>
                                <Link href="/earn" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(250, 204, 21, 0.1)' }}>
                                        <Zap size={14} color="var(--gold)" />
                                    </div>
                                    Tasks
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <h4 style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px", textTransform: "uppercase", color: 'var(--violet)' }}>SUPPORT</h4>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                            <li>
                                <Link href="/support" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)' }}>
                                        <Mail size={14} color="var(--violet)" />
                                    </div>
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)' }}>
                                        <Shield size={14} color="var(--primary)" />
                                    </div>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(148, 163, 184, 0.1)' }}>
                                        <ExternalLink size={14} color="var(--text-muted)" />
                                    </div>
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="flex-center" style={{ justifyContent: 'flex-start', gap: '12px', color: "var(--text-dim)", textDecoration: "none", fontSize: "0.85rem", transition: "0.3s" }}>
                                    <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.1)' }}>
                                        <Shield size={14} color="var(--rose)" />
                                    </div>
                                    Privacy Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginTop: "80px", color: "var(--text-dim)", fontSize: "0.7rem", letterSpacing: "1px", opacity: 0.5 }}>
                    <p>© 2026 EARNFLOW. ALL RIGHTS RESERVED. v2.0 Live</p>
                </div>
            </div>
        </footer>
    );
}
