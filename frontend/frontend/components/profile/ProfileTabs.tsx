'use client'
import clsx from 'clsx'

export type ProfileTab = 'posts' | 'replies' | 'media' | 'likes'

const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Respuestas' },
    { id: 'media', label: 'Multimedia' },
    { id: 'likes', label: 'Me gusta' },
]

type Props = { value: ProfileTab; onChange: (v: ProfileTab) => void }

export function ProfileTabs({ value, onChange }: Props) {
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
