"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, RefreshCw, Smartphone } from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function AdBlockDetector() {
    const { user } = useUser();
    const [isBlocked, setIsBlocked] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const checkAdBlock = async () => {
        setIsChecking(true);
        const baitDomains = [
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
            "https://nap5k.com/tag.min.js",
            "https://3nbf4.com/act/files/tag.min.js"
        ];

        let blocked = false;

        for (const domain of baitDomains) {
            try {
                // Using 'no-cors' to avoid CORS issues while still detecting network-level blocking
                const response = await fetch(domain, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
                // If it successfully "fetched" (even with no-cors), it's likely not blocked at DNS level
            } catch (error) {
                console.error(`[AdBlockDetector] Blocked on: ${domain}`);
                blocked = true;
                break;
            }
        }

        setIsBlocked(blocked);
        setIsChecking(false);
    };

    useEffect(() => {
        // Skip detection for premium users
        if (user?.is_premium) {
            setIsBlocked(false);
            setIsChecking(false);
            return;
        }

        checkAdBlock();

        // Periodic check to catch DNS changes without reload
        const interval = setInterval(checkAdBlock, 30000);
        return () => clearInterval(interval);
    }, [user?.is_premium]);

    if (!isBlocked) return null;

    return (
        <div className="modal-overlay" style={{
            zIndex: 99999,
            display: 'flex',
            background: 'rgba(2, 6, 23, 0.95)',
            backdropFilter: 'blur(20px)'
        }}>
            <div className="glass-panel animate-scale-up" style={{
                width: '90%',
                maxWidth: '450px',
                padding: '40px 32px',
                textAlign: 'center',
                border: '1px solid var(--rose)',
                background: 'rgba(244, 63, 94, 0.05)',
                borderRadius: '32px'
            }}>
                <div className="flex-center" style={{ marginBottom: '24px' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(244, 63, 94, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid var(--rose)',
                        boxShadow: '0 0 30px rgba(244, 63, 94, 0.2)'
                    }}>
                        <ShieldAlert size={40} color="var(--rose)" />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '950', marginBottom: '16px', color: '#fff' }}>
                    AD-BLOCKER DETECTED
                </h2>

                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    We detected that you are using an **AdBlocker** or **Private DNS** (e.g. AdGuard).
                    <br /><br />
                    To continue earning rewards and supporting the platform, please disable it and refresh.
                </p>

                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '20px',
                    borderRadius: '16px',
                    textAlign: 'left',
                    marginBottom: '32px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <Smartphone size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.75rem', color: '#fff', fontWeight: '800' }}>
                            HOW TO DISABLE PRIVATE DNS:
                        </p>
                    </div>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
                        <li>Go to <b>Settings</b> &rarr; <b>Network & Internet</b></li>
                        <li>Find <b>Private DNS</b></li>
                        <li>Set it to <b>Off</b> or <b>Automatic</b></li>
                    </ul>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="btn"
                    style={{
                        background: 'var(--rose)',
                        boxShadow: '0 10px 20px rgba(244, 63, 94, 0.3)',
                        padding: '20px'
                    }}
                >
                    <RefreshCw size={20} className={isChecking ? "animate-spin" : ""} />
                    {isChecking ? "CHECKING..." : "I'VE DISABLED IT - REFRESH"}
                </button>

                <p style={{ marginTop: '20px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                    PREMIUM MEMBERS DON'T SEE THIS MESSAGE.
                </p>
            </div>
        </div>
    );
}
