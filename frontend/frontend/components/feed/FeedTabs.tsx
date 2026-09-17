'use client'
import clsx from 'clsx'

export type FeedTab = 'for-you' | 'following'

type Props = {
    value: FeedTab
    onChange: (v: FeedTab) => void
}

const TABS: { id: FeedTab; label: string }[] = [
    { id: 'for-you', label: 'Para ti' },
    { id: 'following', label: 'Siguiendo' },
]

export function FeedTabs({ value, onChange }: Props) {
    return (
        <div role="tablist" className="flex border-b border-[var(--color-border)]">
            {TABS.map((t) => {
                const active = value === t.id
                return (
                    <button
                        key={t.id}
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(t.id)}
                        className={clsx(
                            'nav-pill relative flex-1 px-4 py-4 text-center text-[15px] font-medium transition',
                            active ? 'font-bold text-[var(--color-foreground)]' : 'text-[var(--color-muted)]'
                        )}
                    >
                        {t.label}
                        {active && (
                            <span
                                aria-hidden="true"
                                className="absolute bottom-0 left-1/2 h-[4px] w-14 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
