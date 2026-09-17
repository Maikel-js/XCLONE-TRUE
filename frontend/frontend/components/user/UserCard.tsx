'use client'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { FollowButton } from './FollowButton'
import type { User } from '@/lib/types'

type Props = {
    user: User
    showFollow?: boolean
    compact?: boolean
    onUnfollow?: () => void
}

export function UserCard({ user, showFollow = true, compact, onUnfollow }: Props) {
    return (
        <div className="flex items-start gap-3 px-4 py-3 card-hover transition">
            <Link href={`/profile/${user.id}`} aria-label={`Ver perfil de ${user.displayName}`}>
                <Avatar src={user.avatar} alt={user.displayName} size={compact ? 'sm' : 'md'} />
            </Link>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <Link
                        href={`/profile/${user.id}`}
                        className="truncate font-bold hover:underline"
                    >
                        {user.displayName}
                    </Link>
                </div>
                <p className="truncate text-sm text-[var(--color-muted)]">@{user.username}</p>
                {!compact && user.bio && (
                    <p className="mt-1 line-clamp-2 text-sm">{user.bio}</p>
                )}
            </div>
            {showFollow && <FollowButton userId={user.id} following={false} onFollowChange={(v) => { if (!v) onUnfollow?.() }} />}
        </div>
    )
}
