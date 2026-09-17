'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Home, Search, User, Bell, LogOut, Feather } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'
import { BrandMark } from '@/components/brand/BrandMark'
import { ConnectionDot } from './ConnectionDot'
import { ComposerDialog } from '@/components/post/ComposerDialog'

type NavItem = { href: string; label: string; icon: typeof Home; match?: (p: string) => boolean }

const items: NavItem[] = [
    { href: '/', label: 'Inicio', icon: Home, match: (p) => p === '/' },
    { href: '/search', label: 'Buscar', icon: Search, match: (p) => p.startsWith('/search') },
    { href: '/notifications', label: 'Notificaciones', icon: Bell, match: (p) => p.startsWith('/notifications') },
]

export function Sidebar() {
    const pathname = usePathname()
    const { userId, logout, username } = useAuth()
    const profileHref = userId ? `/profile/${userId}` : '/profile'

    const isActive = (item: NavItem) =>
        item.href === '/profile'
            ? pathname.startsWith('/profile')
            : item.match
              ? item.match(pathname)
              : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

    return (
        <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col justify-between border-r border-[var(--color-border)] px-2 py-3 md:flex md:w-64 md:px-3">
            <div className="flex flex-col">
                <Link
                    href="/"
                    aria-label="XClone inicio"
                    className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-full text-[var(--color-foreground)] hover:bg-[var(--hover-strong)]"
                >
                    <BrandMark size={26} />
                </Link>
                <nav className="flex flex-col gap-1">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = isActive({ href, label, icon: Icon })
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={clsx(
                                    'nav-pill flex items-center gap-4 rounded-full px-3 py-3 text-xl transition',
                                    active ? 'font-bold text-[var(--color-foreground)]' : 'text-[var(--color-foreground)]'
                                )}
                            >
                                <Icon size={26} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                                <span className="hidden lg:inline">{label}</span>
                            </Link>
                        )
                    })}
                    <Link
                        href={profileHref}
                        aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
                        className={clsx(
                            'nav-pill flex items-center gap-4 rounded-full px-3 py-3 text-xl transition',
                            pathname.startsWith('/profile')
                                ? 'font-bold text-[var(--color-foreground)]'
                                : 'text-[var(--color-foreground)]'
                        )}
                    >
                        <User size={26} aria-hidden="true" />
                        <span className="hidden lg:inline">Perfil</span>
                    </Link>
                </nav>
                <div className="mt-4 px-1">
                    <ComposerDialog
                        trigger={
                            <span className="hidden lg:block">Postear</span>
                        }
                        compactTrigger={<Feather size={24} aria-hidden="true" />}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <ConnectionDot />
                <button
                    type="button"
                    onClick={logout}
                    aria-label="Cerrar sesión"
                    className="nav-pill flex items-center gap-4 rounded-full px-3 py-3 text-xl text-[var(--color-muted)]"
                >
                    <LogOut size={24} aria-hidden="true" />
                    <span className="hidden lg:inline">{username ? `Salir (@${username})` : 'Salir'}</span>
                </button>
            </div>
        </aside>
    )
}
