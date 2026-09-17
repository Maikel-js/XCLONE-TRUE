'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { Home, Search, User, Bell } from 'lucide-react'
import { useAuth } from '@/lib/auth/useAuth'

export function MobileNav() {
    const pathname = usePathname()
    const { userId } = useAuth()
    const profileHref = userId ? `/profile/${userId}` : '/profile'

    const items = [
        { href: '/', label: 'Inicio', icon: Home, active: pathname === '/' },
        { href: '/search', label: 'Buscar', icon: Search, active: pathname.startsWith('/search') },
        { href: '/notifications', label: 'Notificaciones', icon: Bell, active: pathname.startsWith('/notifications') },
        { href: profileHref, label: 'Perfil', icon: User, active: pathname.startsWith('/profile') },
    ]

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-[var(--color-border)] bg-[rgba(0,0,0,0.9)] px-2 py-2 backdrop-blur md:hidden"
        >
            {items.map(({ href, label, icon: Icon, active }) => (
                <Link
                    key={href}
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                        'flex flex-1 items-center justify-center rounded-full p-3',
                        active ? 'text-[var(--color-accent)]' : 'text-[var(--color-foreground)]'
                    )}
                    aria-label={label}
                >
                    <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
                </Link>
            ))}
        </nav>
    )
}
