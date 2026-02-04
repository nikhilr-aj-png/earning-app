"use client";

import { Mail, MessageSquare, Info, ChevronLeft, Zap, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
    return (
        <div className="animate-fade-in" style={{ padding: "40px 24px" }}>
            <Link href="/dashboard" style={{ color: "#fff", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", marginBottom: "40px", fontSize: "0.8rem", fontWeight: "900", letterSpacing: "1px" }}>
                <ChevronLeft size={16} /> RETURN TO DASHBOARD
            </Link>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div className="flex-center" style={{ justifyContent: "flex-start", gap: "12px", marginBottom: "24px" }}>
                    <MessageSquare size={24} color="#fff" strokeWidth={1} />
                    <h1 className="font-heading" style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "2px" }}>SUPPORT CENTER</h1>
                </div>

                <p style={{ color: "var(--text-dim)", fontSize: "0.80rem", letterSpacing: "1px", lineHeight: "1.6", marginBottom: "60px" }}>
                    Our executive support team is available 24/7 to assist with your portfolio synchronization or credit disputes.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginBottom: "80px" }}>
                    <div className="glass-panel" style={{ padding: "32px", border: "1px solid #222", borderRadius: "4px" }}>
                        <Mail size={24} style={{ marginBottom: "24px" }} strokeWidth={1} />
                        <h3 style={{ fontSize: "0.8rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>EMAIL SUPPORT</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "24px" }}>Response time: &lt; 2 Hours</p>
                        <a href="mailto:support@earnflow.global" style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "700", textDecoration: "none", borderBottom: "1px solid #fff", paddingBottom: "4px" }}>support@earnflow.global</a>
                    </div>

                    <div className="glass-panel" style={{ padding: "32px", border: "1px solid #222", borderRadius: "4px" }}>
                        <Zap size={24} style={{ marginBottom: "24px" }} strokeWidth={1} />
                        <h3 style={{ fontSize: "0.8rem", fontWeight: "900", letterSpacing: "2px", marginBottom: "8px" }}>TELEGRAM HUB</h3>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: "24px" }}>Instant Community Support</p>
                        <a href="#" style={{ color: "#fff", fontSize: "0.85rem", fontWeight: "700", textDecoration: "none", borderBottom: "1px solid #fff", paddingBottom: "4px" }}>JOIN THE CHANNEL</a>
                    </div>
                </div>

                <section>
                    <h2 style={{ fontSize: "0.9rem", fontWeight: "900", letterSpacing: "2px", color: "#fff", marginBottom: "32px" }}>FREQUENTLY ASKED</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {[
                            { q: "How are Flow Credits valued?", a: "Flow Credits are internal platform assets representative of mission completion performance. They can be utilized within the Arena or Prediction markets." },
                            { q: "When are mission rewards settled?", a: "Settlement occurs instantly upon verified mission completion. In some cases, a 24-hour audit window may apply." },
                            { q: "Can I manage multiple identities?", a: "No. EarnFlow's security protocol strictly enforces a one-identity-per-executive policy to maintain ecosystem parity." }
                        ].map((faq, i) => (
                            <div key={i} className="glass-panel" style={{ padding: "24px", border: "1px solid #111" }}>
                                <h4 style={{ fontSize: "0.8rem", fontWeight: "900", color: "#fff", marginBottom: "12px", letterSpacing: "1px" }}>{faq.q.toUpperCase()}</h4>
                                <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", lineHeight: "1.6" }}>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
