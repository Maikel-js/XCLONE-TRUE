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
          className="ml-auto flex items-center gap-2 px-3 text-sm text-[var(--color-muted)]"
            title={`WebSocket: ${label}`}
        >
            <span className={clsx('h-2 w-2 rounded-full', color)} aria-hidden="true" />
            <span className="hidden md:inline">{label}</span>
        </span>
    )
}
