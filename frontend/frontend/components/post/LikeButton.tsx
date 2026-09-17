'use client'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import { useToggleLike } from '@/lib/api/hooks/useToggleLike'
import { formatCount } from '@/lib/utils/format'

type LikeButtonProps = {
    postId: string
    likedByMe: boolean
    likesCount: number
    disabled?: boolean
}

export function LikeButton({ postId, likedByMe, likesCount, disabled }: LikeButtonProps) {
    const { mutate, isPending } = useToggleLike()
    const handle = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled || isPending) return
        mutate({ postId, likedByMe })
    }
    return (
        <button
            type="button"
            onClick={handle}
            aria-pressed={likedByMe}
            aria-label={likedByMe ? 'Quitar me gusta' : 'Me gusta'}
            disabled={disabled || isPending}
            className={clsx(
                'text-hover-like group relative flex items-center gap-1 rounded-full p-2 transition disabled:opacity-60',
                likedByMe ? 'text-[var(--color-like)]' : 'text-[var(--color-muted)] hover:text-[var(--color-like)]'
            )}
        >
            <Heart
                size={18}
                fill={likedByMe ? 'currentColor' : 'none'}
                className="transition-transform group-active:scale-125"
                aria-hidden="true"
            />
            {likesCount > 0 && <span className="text-sm tabular-nums">{formatCount(likesCount)}</span>}
        </button>
    )
}
