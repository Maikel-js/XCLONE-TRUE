'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Home, User, Search, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'
import { ConnectionDot } from './ConnectionDot'

const items = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/search', label: 'Buscar', icon: Search },
]

export function Sidebar() {
    const pathname = usePathname()
    const { userId, logout } = useAuth()
    const profileHref = userId ? `/profile/${userId}` : '/profile'

    return (
        <aside className="sticky top-0 hidden h-screen w-20 border-r border-[var(--color-border)] px-2 py-4 md:flex md:w-64 md:flex-col">
            <Link href="/" className="mb-4 px-3 text-2xl font-bold">X</Link>
            <nav className="flex flex-1 flex-col gap-1">
                {items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            className={clsx(
                                'flex items-center gap-4 rounded-full px-3 py-3 text-lg transition',
                                active
                                    ? 'font-bold text-[var(--color-foreground)]'
                                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-card)]'
                            )}
                        >
                            <Icon size={26} aria-hidden="true" />
                            <span className="hidden md:block">{label}</span>
                        </Link>
                    )
                })}
                <Link
                    href={profileHref}
                    aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
                    className={clsx(
                        'flex items-center gap-4 rounded-full px-3 py-3 text-lg transition',
                        pathname.startsWith('/profile')
                            ? 'font-bold text-[var(--color-foreground)]'
                            : 'text-[var(--color-foreground)] hover:bg-[var(--color-card)]'
                    )}
                >
                    <User size={26} aria-hidden="true" />
                    <span className="hidden md:block">Perfil</span>
                </Link>
            </nav>
            <div className="mt-auto px-3">
                <ConnectionDot />
            </div>
            <button
                type="button"
                onClick={logout}
                className="mt-2 flex items-center gap-4 rounded-full px-3 py-3 text-lg hover:bg-[var(--color-card)]"
            >
                <LogOut size={26} aria-hidden="true" />
                <span className="hidden md:block">Salir</span>
            </button>
        </aside>
    )
}
