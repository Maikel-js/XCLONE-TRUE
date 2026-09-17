'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Calendar, MapPin } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { Header } from '@/components/layout/Header'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { PostCard } from '@/components/post/PostCard'
import { FollowButton } from '@/components/user/FollowButton'
import { ProfileTabs, type ProfileTab } from '@/components/profile/ProfileTabs'
import { useUser } from '@/lib/api/hooks/useUser'
import { useUserPosts } from '@/lib/api/hooks/useUserPosts'
import { useAuth } from '@/lib/auth/useAuth'
import { formatCount } from '@/lib/utils/format'

export default function ProfilePage() {
    const params = useParams<{ id: string }>()
    const id = params?.id ?? ''
    const { userId: meId } = useAuth()
    const { data: user, isLoading, isError, error } = useUser(id)
    const posts = useUserPosts(id)
    const [editOpen, setEditOpen] = useState(false)
    const [tab, setTab] = useState<ProfileTab>('posts')

    if (isLoading) return <Spinner label="Cargando perfil" />
    if (isError)
        return (
            <div className="space-y-3 p-4">
                <ErrorMessage message={error?.message ?? 'Error al cargar'} />
            </div>
        )
    if (!user) return null

    const isMe = !!meId && meId === user.id
    const following = user.following ?? false

    return (
        <>
            <Header title={user.displayName} subtitle={`${formatCount((user as { posts?: number }).posts ?? 0)} posts`} showBack />
            <div className="relative h-32 w-full bg-[var(--color-card)] sm:h-48">
                <div
                    aria-hidden="true"
                    className="h-full w-full bg-gradient-to-br from-[var(--color-accent)]/30 via-[var(--color-card)] to-[#0b1418]"
                />
            </div>
            <section className="border-b border-[var(--color-border)] px-4 pb-4">
                <div className="-mt-16 flex items-start justify-between sm:-mt-20">
                    <div className="rounded-full border-4 border-[var(--color-background)] bg-[var(--color-background)]">
                        <Avatar src={user.avatar} alt={user.displayName} size="lg" />
                    </div>
                    <div className="mt-20 sm:mt-24">
                        {isMe ? (
                            <button
                                type="button"
                                onClick={() => setEditOpen(true)}
                                className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-bold hover:bg-[var(--hover)]"
                            >
                                Editar perfil
                            </button>
                        ) : (
                            <FollowButton userId={user.id} following={following} />
                        )}
                    </div>
                </div>
                <div className="mt-3">
                    <h1 className="text-xl font-bold">{user.displayName}</h1>
                    <p className="text-[var(--color-muted)]">@{user.username}</p>
                    {user.bio && (
                        <p className="mt-3 whitespace-pre-wrap text-[15px]">{user.bio}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted)]">
                        {(user as { location?: string }).location && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin size={14} /> {(user as { location?: string }).location}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                            <Calendar size={14} />
                            Se unió el{' '}
                            {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                        <span>
                            <span className="font-bold">{formatCount((user as { followingCount?: number }).followingCount ?? 0)}</span>{' '}
                            <span className="text-[var(--color-muted)]">Siguiendo</span>
                        </span>
                        <span>
                            <span className="font-bold">{formatCount((user as { followers?: number }).followers ?? 0)}</span>{' '}
                            <span className="text-[var(--color-muted)]">Seguidores</span>
                        </span>
                    </div>
                </div>
            </section>
            <ProfileTabs value={tab} onChange={setTab} />
            {tab === 'posts' ? (
                posts.isLoading ? (
                    <Spinner label="Cargando posts" />
                ) : posts.isError ? (
                    <div className="p-4">
                        <ErrorMessage message={posts.error?.message ?? 'Error al cargar posts'} />
                    </div>
                ) : (posts.data?.pages.flatMap((p) => p.items).length ?? 0) === 0 ? (
                    <EmptyState
                        title={isMe ? 'Aún no has posteado' : 'Sin posts todavía'}
                        description={isMe ? 'Comparte algo para que aparezca aquí.' : 'Cuando publiquen, verás sus posts aquí.'}
                    />
                ) : (
                    <>
                        {posts.data?.pages.flatMap((p) => p.items).map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        {posts.hasNextPage && (
                            <div className="p-4 text-center">
                                <button
                                    type="button"
                                    onClick={() => posts.fetchNextPage()}
                                    disabled={posts.isFetchingNextPage}
                                    className="text-sm text-[var(--color-accent)] disabled:opacity-60"
                                >
                                    {posts.isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
                                </button>
                            </div>
                        )}
                    </>
                )
            ) : (
                <EmptyState
                    title="Próximamente"
                    description="Las respuestas, multimedia y me gusta aún no están disponibles."
                />
            )}
            {isMe && (
                <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
            )}
        </>
    )
}
