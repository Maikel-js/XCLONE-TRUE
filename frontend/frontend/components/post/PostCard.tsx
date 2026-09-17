'use client'
import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { Avatar } from "../ui/Avatar"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { Spinner } from "../ui/Spinner"
import { LikeButton } from "./LikeButton"
import { useDeletePost } from "@/lib/api/hooks/useDeletePost"
import { useAuth } from "@/lib/auth/useAuth"
import { timeAgo } from "@/lib/utils/time"
import type { Post } from "@/lib/types"

type PostCardProps = { post: Post }

export function PostCard({ post }: PostCardProps) {
    const { userId } = useAuth()
    const { mutate, isPending } = useDeletePost()
    const [confirm, setConfirm] = useState(false)
    const isOwner = !!userId && post.author.id === userId

    return(
        <article className="border-b border-[var(--color-border)] p-4">
            <div className="flex gap-3">
                <Avatar src={post.author.avatar} alt={post.author.displayName} />
                <div className="min-w-0 flex-1">
                    <header className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate font-semibold">{post.author.displayName}</p>
                            <p className="truncate text-sm text-[var(--color-muted)]">
                                @{post.author.username} · {timeAgo(post.createdAt)}
                            </p>
                        </div>
                        {isOwner && (
                            <button
                                type="button"
                                aria-label="Más opciones"
                                onClick={() => setConfirm(true)}
                                disabled={isPending}
                                className="rounded-full p-2 text-[var(--color-muted)] hover:bg-[var(--color-card)] disabled:opacity-50"
                            >
                                <MoreHorizontal size={18} aria-hidden="true" />
                            </button>
                        )}
                    </header>
                    <p className="mt-2 whitespace-pre-wrap break-words">{post.content}</p>
                    <footer className="mt-3 -ml-2">
                        <LikeButton
                            postId={post.id}
                            likedByMe={post.likedByMe}
                            likesCount={post.likesCount}
                            disabled={isPending}
                        />
                    </footer>
                </div>
            </div>
            {isPending && (
                <div className="mt-2">
                    <Spinner label="Eliminando" />
                </div>
            )}
            <ConfirmDialog
                open={confirm}
                title="Eliminar post"
                description="Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                onConfirm={() => {
                    setConfirm(false)
                    mutate(post.id)
                }}
                onCancel={() => setConfirm(false)}
            />
        </article>
    )
}