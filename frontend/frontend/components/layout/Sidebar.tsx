'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
    Bell,
    Feather,
    Home,
    LogOut,
    MessageCircle,
    MoreHorizontal,
    Search,
    User,
    UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/useAuth'
import { BrandMark } from '@/components/brand/BrandMark'
import { ComposerDialog } from '@/components/post/ComposerDialog'
import { ConnectionDot } from './ConnectionDot'
import { GrokMark } from '../brand/GrokMark'
import { ComponentType } from 'react'

type NavItem = {
    href?: string
    label: string
    icon: ComponentType<{size?: number; strokeWidth?: number}>
    match?: (pathname: string) => boolean
}

const items: NavItem[] = [
    { href: '/', label: 'Inicio', icon: Home, match: (p) => p === '/' },
    { href: '/search', label: 'Buscar', icon: Search, match: (p) => p.startsWith('/search') },
    {
        href: '/notifications',
        label: 'Notificaciones',
        icon: Bell,
        match: (p) => p.startsWith('/notifications'),
    },
    { label: 'Comunidades', icon: UserPlus },
    { label: 'Mensajes', icon: MessageCircle },
    { href: '/grok', label: 'Grok', icon: GrokMark, match: (p) => p.startsWith('/grok') },
]

export function Sidebar() {
    const pathname = usePathname()
    const { userId, logout } = useAuth()
    const profileHref = userId ? `/profile/${userId}` : '/profile'

    return (
        <aside className="sticky top-0 hidden h-screen min-w-0 flex-col justify-between border-r border-[var(--color-border)] px-3 py-3 md:flex md:w-full">
            <div className="ml-auto flex w-full max-w-[320px] flex-col items-start">
                <Link
                    href="/"
                    aria-label="XClone: inicio"
                    title="Inicio"
                    className="mb-3 ml-2 flex h-14 w-14 items-center justify-center rounded-full text-[var(--color-foreground)] hover:bg-[var(--hover-strong)]"
                >
                    <BrandMark size={30} />
                </Link>

                <nav aria-label="Navegación principal" className="flex w-full flex-col items-stretch gap-1">
                    {items.map(({ href, label, icon: Icon, match }) => {
                        const active = href
                            ? match
                                ? match(pathname)
                                : pathname === href
                            : false

                        const className = clsx(
                            'nav-pill flex h-14 w-full items-center justify-start gap-4 rounded-full px-4 text-[var(--color-foreground)]',
                            active && 'font-bold'
                        )

                        return href ? (
                            <Link
                                key={label}
                                href={href}
                                aria-label={label}
                                aria-current={active ? 'page' : undefined}
                                title={label}
                                className={className}
                            >
                                <Icon size={28} strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                                <span className="truncate text-lg 2xl:text-[27px]">{label}</span>
                            </Link>
                        ) : (
                            <button
                                key={label}
                                type="button"
                                aria-label={label}
                                title={label}
                                className={className}
                                onClick={() => toast.info(`${label}: no disponible`)}
                            >
                                <Icon size={28} aria-hidden="true" />
                                <span className="truncate text-lg 2xl:text-[27px]">{label}</span>
                            </button>
                        )
                    })}

                    <Link
                        href={profileHref}
                        aria-label="Perfil"
                        aria-current={pathname.startsWith('/profile') ? 'page' : undefined}
                        title="Perfil"
                        className="nav-pill flex h-14 w-full items-center justify-start gap-4 rounded-full px-4 text-[var(--color-foreground)]"
                    >
                        <User size={28} aria-hidden="true" />
                        <span className="truncate text-lg 2xl:text-[27px]">Perfil</span>
                    </Link>

                    <button
                        type="button"
                        aria-label="Más opciones"
                        title="Más opciones"
                        className="nav-pill flex h-14 w-full items-center justify-start gap-4 rounded-full px-4 text-[var(--color-foreground)]"
                        onClick={() => toast.info('Más opciones no disponibles')}
                    >
                        <MoreHorizontal size={28} aria-hidden="true" />
                        <span className="truncate text-lg 2xl:text-[27px]">Más opciones</span>
                    </button>
                </nav>

                <div className="mt-3 w-full px-2">
                    <ComposerDialog
                        trigger={(
                            <span className="flex items-center gap-3">
                                <Feather size={24} aria-hidden="true" />
                                <span>Publicar</span>
                            </span>
                        )}
                        triggerClassName="flex h-14 w-full items-center justify-center rounded-full bg-[#eff3f4] px-5 text-lg font-bold text-black transition hover:bg-[#d7dbdc] 2xl:text-[25px]"
                    />
                </div>
            </div>

            <div className="ml-auto flex w-full max-w-[320px] flex-col items-start gap-2">
                <ConnectionDot />
                <button
                    type="button"
                    onClick={logout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className="nav-pill flex h-14 w-full items-center justify-start gap-4 rounded-full px-4 text-[var(--color-muted)]"
                >
                    <LogOut size={24} aria-hidden="true" />
                    <span className="text-lg 2xl:text-[27px]">Cerrar sesión</span>
                </button>
            </div>
        </aside>
    )
}
