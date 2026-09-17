import clsx from 'clsx'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type HeaderProps = {
    title: string
    subtitle?: string
    showBack?: boolean
    className?: string
    right?: React.ReactNode
}

export function Header({ title, subtitle, showBack, className, right }: HeaderProps) {
    return (
        <header
            className={clsx(
                'sticky top-0 z-20 flex items-center gap-4 border-b border-[var(--color-border)] bg-[rgba(0,0,0,0.65)] px-4 py-3 backdrop-blur',
                className
            )}
        >
            {showBack && (
                <Link
                    href="/"
                    aria-label="Volver"
                    className="-ml-2 rounded-full p-2 hover:bg-[var(--hover-strong)]"
                >
                    <ChevronLeft size={22} aria-hidden="true" />
                </Link>
            )}
            <div className="min-w-0">
                <h1 className="truncate text-xl font-bold leading-tight">{title}</h1>
                {subtitle && (
                    <p className="truncate text-xs text-[var(--color-muted)]">{subtitle}</p>
                )}
            </div>
            {right && <div className="ml-auto">{right}</div>}
        </header>
    )
}
