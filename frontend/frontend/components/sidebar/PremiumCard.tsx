'use client'

import { toast } from 'sonner'

export function PremiumCard() {
    return (
        <section className="rounded-[18px] border border-[var(--color-border)] px-6 py-5">
            <h2 className="text-[23px] font-bold leading-tight">Subscribe to Premium</h2>
            <p className="mt-3 text-[18px] leading-[1.4] text-[var(--color-foreground)]">
                Get rid of ads, see your analytics, boost your replies and unlock 20+ features.
            </p>
            <button
                type="button"
                onClick={() => toast.info('Premium no está disponible')}
                className="mt-5 rounded-full bg-[var(--color-accent)] px-5 py-2 text-[18px] font-bold text-white transition hover:bg-[var(--color-accent-hover)]"
            >
                Subscribe
            </button>
        </section>
    )
}
