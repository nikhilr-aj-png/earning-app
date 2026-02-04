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
        { name: 'PROFILE', href: '/profile', icon: User },
    ];

    return (
        <nav style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)', maxWidth: '600px',
            background: 'rgba(5, 5, 5, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            zIndex: 1000,
            display: 'flex', justifyContent: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
        }}>
            <div style={{
                width: '100%',
                display: 'flex', justifyContent: 'space-around',
                padding: '12px 10px'
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
                                color: isActive ? '#fff' : 'var(--text-muted)',
                                textDecoration: 'none',
                                transition: 'all 0.4s var(--transition)',
                                transform: isActive ? 'scale(1.05)' : 'scale(1)'
                            }}
                        >
                            <div style={{
                                padding: '10px 20px', borderRadius: '12px',
                                background: isActive ? 'var(--sapphire-glow)' : 'transparent',
                                border: isActive ? '1px solid var(--sapphire)' : '1px solid transparent',
                                transition: 'all 0.4s var(--transition)',
                                color: isActive ? 'var(--sapphire)' : 'currentColor',
                                boxShadow: isActive ? '0 0 20px rgba(0, 112, 243, 0.2)' : 'none'
                            }}>
                                <Icon size={22} color={isActive ? 'var(--sapphire)' : 'currentColor'} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span style={{
                                fontSize: '0.6rem', fontWeight: '950',
                                letterSpacing: '1.5px',
                                opacity: isActive ? 1 : 0.5,
                                color: isActive ? '#fff' : 'inherit'
                            }}>{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
