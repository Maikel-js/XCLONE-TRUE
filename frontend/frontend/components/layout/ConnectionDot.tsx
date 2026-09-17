'use client'
import clsx from 'clsx'
import { useRealtimeStatus } from '@/lib/realtime/RealtimeProvider'

export function ConnectionDot() {
    const status = useRealtimeStatus()
    const label =
        status === 'open' ? 'Conectado' : status === 'connecting' ? 'Conectando' : 'Desconectado'
    const color =
        status === 'open'
            ? 'bg-emerald-500'
            : status === 'connecting'
                ? 'bg-yellow-500'
                : 'bg-red-500'
    return (
        <span
            role="status"
            aria-live="polite"
            title={`WebSocket: ${label}`}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-xs text-[var(--color-muted)]"
        >
            <span className={clsx('h-2 w-2 rounded-full', color)} aria-hidden="true" />
            <span className="hidden lg:inline">{label}</span>
        </span>
    )
}
