"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, Wallet, CheckSquare, Zap, Trophy, Coins, User, TrendingUp } from "lucide-react";

export default function BottomNav() {
    const { user } = useUser();
    const pathname = usePathname();

    if (!user || user.is_admin || pathname === '/') return null;

    const navItems = [
        { name: 'DASHBOARD', href: '/dashboard', icon: Home },
        { name: 'TASKS', href: '/earn', icon: CheckSquare },
        { name: 'PLAY', href: '/game', icon: Trophy },
        { name: 'WALLET', href: '/wallet', icon: Wallet },
        { name: 'PROFILE', href: '/profile', icon: User },
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'fixed', bottom: '0', left: '0', right: '0',
            width: '100%', height: '44px',
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(50px)',
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center',
            boxShadow: '0 -5px 25px rgba(0,0,0,0.5)'
        }}>
            <div style={{
                width: '100%', maxWidth: '900px', margin: '0 auto',
                display: 'flex', justifyContent: 'space-around', alignItems: 'center',
                height: '100%', padding: '0 12px'
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                flex: 1,
                                height: '100%',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            <Icon
                                size={16}
                                color={isActive ? 'var(--primary)' : 'currentColor'}
                                strokeWidth={isActive ? 3 : 2}
                                style={{
                                    transition: '0.3s',
                                    filter: isActive ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none'
                                }}
                            />
                            <span style={{
                                fontSize: '0.65rem', fontWeight: '950',
                                letterSpacing: '1px',
                                opacity: isActive ? 1 : 0.4,
                                textTransform: 'uppercase',
                                transition: '0.3s'
                            }}>{item.name}</span>

                            {/* Minimalism: Precision Top Glow */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute', top: '-1px', left: '15%', right: '15%', height: '2px',
                                    background: 'var(--primary)',
                                    boxShadow: '0 0 15px var(--primary-glow)',
                                    borderRadius: '0 0 4px 4px'
                                }} />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
