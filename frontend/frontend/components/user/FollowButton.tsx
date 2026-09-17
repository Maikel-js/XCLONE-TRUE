'use client'
import { useState } from 'react'
import clsx from 'clsx'
import { useFollowToggle } from '@/lib/api/hooks/useFollowToggle'

type Props = {
    userId: string
    following?: boolean
    className?: string
    onFollowChange?: (v: boolean) => void
}

export function FollowButton({ userId, following = false, className, onFollowChange }: Props) {
    const follow = useFollowToggle()
    const [hover, setHover] = useState(false)

    const isBusy = follow.isPending

    return (
        <button
            type="button"
            onClick={() =>
                follow.mutate({ userId, following }, { onSuccess: () => onFollowChange?.(!following) })
            }
            disabled={isBusy}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            aria-pressed={following}
            className={clsx(
                'rounded-full px-4 py-1.5 text-sm font-bold transition disabled:opacity-60',
                following
                    ? hover
                        ? 'border border-[var(--color-danger)] text-[var(--color-danger)]'
                        : 'border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)]'
                    : 'bg-white text-black hover:bg-gray-200',
                className
            )}
        >
            {isBusy ? '…' : following ? (hover ? 'Dejar de seguir' : 'Siguiendo') : 'Seguir'}
        </button>
    )
}
