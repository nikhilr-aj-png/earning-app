"use client";

import { Zap, ChevronLeft, Target, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> BACK TO TERMINAL
            </Link>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div className="flex-center" style={{ justifyContent: "flex-start", gap: "12px", marginBottom: "24px" }}>
                    <Zap size={24} color="#fff" strokeWidth={1} />
                    <h1 className="font-heading" style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px" }}>ABOUT IDENTITY</h1>
                </div>

                <p style={{ color: "var(--text-dim)", fontSize: "0.80rem", letterSpacing: "1px", lineHeight: "1.6", marginBottom: "60px" }}>
                    EarnFlow is not just a platform; it is a digital infrastructure for the next generation of asset managers.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", alignItems: "center" }}>
                        <div>
                            <h2 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff", marginBottom: "20px", letterSpacing: "1px" }}>OUR VISION</h2>
                            <p style={{ color: "var(--text-dim)", lineHeight: "1.8", fontSize: "0.95rem" }}>
                                We believe in a world where digital participation translates directly into tangible asset growth. Our mission is to provide the most secure and professional terminal for Flow Credit acquisition.
                            </p>
                        </div>
                        <div className="glass-panel" style={{ padding: "40px", border: "1px solid #222", borderRadius: "14px", textAlign: "center" }}>
                            <Target size={48} color="#fff" strokeWidth={1} style={{ marginBottom: "20px" }} />
                            <h3 style={{ fontSize: "0.7rem", fontWeight: "900", letterSpacing: "3px" }}>PRECISION ENGINEERED</h3>
                        </div>
                    </section>

                    <section style={{ borderTop: "1px solid #111", paddingTop: "60px" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#fff", marginBottom: "40px", letterSpacing: "1px", textAlign: "center" }}>CORE PROTOCOLS</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
                            {[
                                { icon: Shield, title: "SECURITY", desc: "Military-grade encryption for every transaction." },
                                { icon: Zap, title: "VELOCITY", desc: "Instant settlement and lightning-fast execution." },
                                { icon: Users, title: "COMMUNITY", desc: "Join an elite network of over 10k+ professionals." }
                            ].map((item, i) => (
                                <div key={i} className="glass-panel" style={{ padding: "24px", border: "1px solid #111", textAlign: "center" }}>
                                    <item.icon size={24} color="#fff" strokeWidth={1} style={{ marginBottom: "16px" }} />
                                    <h4 style={{ fontSize: "0.75rem", fontWeight: "900", marginBottom: "12px", letterSpacing: "2px" }}>{item.title}</h4>
                                    <p style={{ color: "var(--text-dim)", fontSize: "0.8rem", lineHeight: "1.5" }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
