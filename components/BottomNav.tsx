"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, CheckSquare, Trophy, User } from "lucide-react";

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
            width: '100%', minHeight: '56px', height: 'auto',
            paddingTop: '8px',
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(50px)',
            border: 'none',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center',
            boxShadow: '0 -5px 25px rgba(0,0,0,0.5)',
            paddingBottom: 'env(safe-area-inset-bottom)' // Handle iPhone home bar
        }}>
            <div style={{
                width: '100%', maxWidth: '900px', margin: '0 auto',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                height: '100%', padding: '0 8px'
            }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                textDecoration: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                flex: 1,
                                height: '100%',
                                position: 'relative',
                                minWidth: '60px'
                            }}
                        >
                            <Icon
                                size={20}
                                color={isActive ? 'var(--primary)' : 'currentColor'}
                                strokeWidth={isActive ? 2.5 : 2}
                                style={{
                                    transition: '0.3s',
                                    filter: isActive ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none',
                                    marginTop: isActive ? '-4px' : '0' // Subtle lift effect
                                }}
                            />
                            {/* Text Hidden on very small screens via CSS class or kept minimal */}
                            <span className="nav-label" style={{
                                fontSize: '0.55rem', fontWeight: '950',
                                letterSpacing: '0.5px',
                                opacity: isActive ? 1 : 0.5,
                                textTransform: 'uppercase',
                                transition: '0.3s',
                                display: 'block' // Rely on CSS for hiding if needed, but 0.55rem should fit
                            }}>{item.name}</span>

                            {/* Active Indicator Dot */}
                            {isActive && (
                                <div style={{
                                    position: 'absolute', top: '4px', width: '4px', height: '4px',
                                    background: 'var(--primary)', borderRadius: '50%',
                                    boxShadow: '0 0 8px var(--primary)'
                                }} />
                            )}
                        </Link>
                    );
                })}
            </div>

        </nav>
    );
}
