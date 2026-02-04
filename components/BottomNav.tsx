"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, Wallet, CheckSquare, Zap, Trophy, Coins, User, TrendingUp } from "lucide-react";

export default function BottomNav() {
    const { user } = useUser();
    const pathname = usePathname();

    if (!user || user.is_admin) return null;

    const navItems = [
        { name: 'HOME', href: '/dashboard', icon: Home },
        { name: 'TASKS', href: '/earn', icon: CheckSquare },
        { name: 'PREDICT', href: '/predictions', icon: TrendingUp },
        { name: 'PLAY', href: '/game', icon: Trophy },
        { name: 'WALLET', href: '/wallet', icon: Wallet },
    ];

    return (
        <nav style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 'var(--max-width)',
            background: '#000',
            borderTop: '1px solid #222',
            borderRadius: '0',
            zIndex: 100,
            display: 'flex', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', maxWidth: 'var(--max-width)',
                display: 'flex', justifyContent: 'space-around',
                padding: '12px 10px 24px'
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <div style={{
                                padding: '8px 16px', borderRadius: '14px',
                                background: isActive ? 'var(--primary-glow)' : 'transparent',
                                transition: 'all 0.3s ease'
                            }}>
                                <Icon size={22} color={isActive ? 'var(--primary)' : 'currentColor'} />
                            </div>
                            <span style={{
                                fontSize: '0.6rem', fontWeight: '800',
                                letterSpacing: '0.08em',
                                opacity: isActive ? 1 : 0.6
                            }}>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
