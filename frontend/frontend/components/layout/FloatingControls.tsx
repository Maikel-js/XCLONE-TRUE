'use client'

import { MessageCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export function FloatingControls() {
    return (
        <div className="fixed bottom-4 right-4 z-40 hidden flex-col gap-2 xl:flex">
            <button
                type="button"
                aria-label="Open Grok"
                title="Grok"
                onClick={() => toast.info('Grok no está disponible')}
                className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--color-border)] bg-black text-[var(--color-foreground)] shadow-[0_0_20px_rgba(255,255,255,0.13)] transition hover:bg-[var(--color-card)]"
            >
                <Sparkles size={28} aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label="Messages"
                title="Messages"
                onClick={() => toast.info('Mensajes no disponibles')}
                className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[var(--color-border)] bg-black text-[var(--color-foreground)] shadow-[0_0_20px_rgba(255,255,255,0.13)] transition hover:bg-[var(--color-card)]"
            >
                <MessageCircle size={28} aria-hidden="true" />
            </button>
        </div>
    )
}
