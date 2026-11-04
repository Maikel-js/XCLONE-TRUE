'use client'
import clsx from 'clsx'
import { Plus } from 'lucide-react'
import { ComposerDialog } from '@/components/post/ComposerDialog'

export type FeedTab = 'for-you' | 'following'

type Props = {
    value: FeedTab
    onChange: (v: FeedTab) => void
}

const TABS: { id: FeedTab; label: string }[] = [
    { id: 'for-you', label: 'For you' },
    { id: 'following', label: 'Following' },
]

export function FeedTabs({ value, onChange }: Props) {
    return (
        <div className="flex min-h-[52px] items-center border-b border-[var(--color-border)] 2xl:min-h-[68px]">
            <div role="tablist" className="flex h-full min-w-0 flex-1">
                {TABS.map((t) => {
                    const active = value === t.id
                    return (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={active}
                            onClick={() => onChange(t.id)}
                            className={clsx(
                                'nav-pill relative flex-1 px-3 py-3 text-center text-[17px] font-medium transition sm:px-4 2xl:text-[22px]',
                                active ? 'font-bold text-[var(--color-foreground)]' : 'text-[var(--color-muted)]'
                            )}
                        >
                            {t.label}
                            {active && (
                                <span
                                    aria-hidden="true"
                                    className="absolute bottom-0 left-1/2 h-[4px] w-16 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
            <ComposerDialog
                trigger={<Plus size={25} aria-hidden="true" />}
                triggerClassName="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--hover-strong)] hover:text-[var(--color-foreground)]"
            />
        </div>
    )
}
