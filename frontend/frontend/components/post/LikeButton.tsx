'use client'
import { Heart } from "lucide-react"
import clsx from "clsx"
import { useToggleLike } from "@/lib/api/hooks/useToggleLike"

type LikeButtonProps = {
    postId: string
    likedByMe: boolean
    likesCount: number
    disabled?: boolean
}

export function LikeButton({ postId, likedByMe, likesCount, disabled }: LikeButtonProps) {
    const { mutate, isPending } = useToggleLike()
    const handle = () => {
        if (disabled || isPending) return
        mutate({ postId, likedByMe })
    }
    return(
        <button
            type="button"
            onClick={handle}
            aria-pressed={likedByMe}
            aria-label={likedByMe ? 'Quitar like' : 'Dar like'}
            disabled={disabled || isPending}
            className={clsx(
                'flex items-center gap-1 rounded-full p-2 transition hover:bg-[var(--color-card)] disabled:opacity-50',
                likedByMe ? 'text-[#f91880]' : 'text-[var(--color-foreground)]'
            )}
        >
            <Heart size={18} fill={likedByMe ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className="text-sm tabular-nums">{likesCount}</span>
        </button>
    )
}

