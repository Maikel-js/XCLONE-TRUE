'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import clsx from 'clsx'
import { MoreHorizontal, MessageCircle, Repeat2, Bookmark, Share, Trash2, Pencil } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Modal } from '../ui/Modal'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { Spinner } from '../ui/Spinner'
import { LikeButton } from './LikeButton'
import { useDeletePost } from '@/lib/api/hooks/useDeletePost'
import { useAuth } from '@/lib/auth/useAuth'
import { timeAgo } from '@/lib/utils/time'
import { formatCount } from '@/lib/utils/format'
import type { Post } from '@/lib/types'

type PostCardProps = { post: Post }

function ActionPlaceholder({
    icon: Icon,
    count,
    label,
    tone = 'default',
}: {
    icon: typeof MessageCircle
    count?: number
    label: string
    tone?: 'default' | 'retweet' | 'like' | 'accent'
}) {
    const color =
        tone === 'retweet'
            ? 'hover:text-[var(--color-retweet)]'
            : tone === 'like'
                ? 'hover:text-[var(--color-like)]'
                : tone === 'accent'
                    ? 'hover:text-[var(--color-accent)]'
                    : 'hover:text-[var(--color-accent)]'
    const hoverClass =
        tone === 'retweet'
            ? 'text-hover-retweet'
            : tone === 'like'
                ? 'text-hover-like'
                : 'text-hover-accent'
    return (
        <button
            type="button"
            aria-label={label}
            disabled
            onClick={() => toast.info(`${label}: próximamente`)}
            className={clsx(
                'text-hover-accent group relative flex items-center gap-1 rounded-full px-2 py-1 text-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60',
                color,
                hoverClass
            )}
        >
            <Icon size={18} aria-hidden="true" />
            {count !== undefined && count > 0 && (
                <span className="text-sm tabular-nums">{formatCount(count)}</span>
            )}
        </button>
    )
}

export function PostCard({ post }: PostCardProps) {
    const { userId } = useAuth()
    const { mutate, isPending } = useDeletePost()
    const [confirm, setConfirm] = useState(false)
    const [menu, setMenu] = useState(false)
    const isOwner = !!userId && post.author.id === userId

    async function share() {
        const url = `${window.location.origin}/profile/${post.author.id}`
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                toast.success('Enlace copiado')
            } else {
                toast.message(url)
            }
        } catch {
            toast.error('No se pudo copiar')
        }
    }

    return (
        <article className="border-b border-[var(--color-border)] px-4 py-3 transition hover:bg-[var(--hover)]">
            <div className="flex gap-3">
                <Link href={`/profile/${post.author.id}`} aria-label={`Perfil de ${post.author.displayName}`}>
                    <Avatar src={post.author.avatar} alt={post.author.displayName} />
                </Link>
                <div className="min-w-0 flex-1">
                    <header className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1">
                            <Link
                                href={`/profile/${post.author.id}`}
                                className="truncate font-bold hover:underline"
                            >
                                {post.author.displayName}
                            </Link>
                            <span className="truncate text-sm text-[var(--color-muted)]">
                                @{post.author.username}
                            </span>
                            <span className="text-sm text-[var(--color-muted)]">·</span>
                            <time className="text-sm text-[var(--color-muted)]" dateTime={post.createdAt}>
                                {timeAgo(post.createdAt)}
                            </time>
                        </div>
                        {isOwner && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Más opciones"
                                    aria-haspopup="menu"
                                    aria-expanded={menu}
                                    onClick={() => setMenu(true)}
                                    disabled={isPending}
                                    className="-mr-2 rounded-full p-2 text-[var(--color-muted)] hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)] disabled:opacity-50"
                                >
                                    <MoreHorizontal size={18} aria-hidden="true" />
                                </button>
                                <Modal open={menu} onClose={() => setMenu(false)} title="Opciones del post" className="max-w-xs w-full p-0">
                                    <ul className="text-sm">
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenu(false)
                                                    toast.info('Editar post: próximamente')
                                                }}
                                                className="flex w-full items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 hover:bg-[var(--hover)]"
                                            >
                                                <Pencil size={16} />
                                                Editar
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMenu(false)
                                                    setConfirm(true)
                                                }}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-[var(--color-danger)] hover:bg-[var(--hover)]"
                                            >
                                                <Trash2 size={16} />
                                                Eliminar
                                            </button>
                                        </li>
                                    </ul>
                                </Modal>
                            </>
                        )}
                    </header>
                    <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-normal">{post.content}</p>
                    <footer className="mt-2 -ml-2 flex items-center justify-between max-w-md">
                        <ActionPlaceholder
                            icon={MessageCircle}
                            count={post.repliesCount ?? 0}
                            label="Responder"
                        />
                        <ActionPlaceholder
                            icon={Repeat2}
                            count={post.repostsCount ?? 0}
                            label="Repostear"
                            tone="retweet"
                        />
                        <LikeButton
                            postId={post.id}
                            likedByMe={post.likedByMe}
                            likesCount={post.likesCount}
                            disabled={isPending}
                        />
                        <ActionPlaceholder icon={Bookmark} label="Guardar" tone="accent" />
                        <button
                            type="button"
                            aria-label="Compartir"
                            onClick={share}
                            className="text-hover-accent relative flex items-center gap-1 rounded-full p-2 text-[var(--color-muted)] hover:text-[var(--color-accent)]"
                        >
                            <Share size={18} aria-hidden="true" />
                        </button>
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
