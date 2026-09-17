'use client'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { Header } from '@/components/layout/Header'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { useUser } from '@/lib/api/hooks/useUser'
import { useFollowToggle } from '@/lib/api/hooks/useFollowToggle'
import { useAuth } from '@/lib/auth/useAuth'

export default function ProfilePage() {
    const params = useParams<{ id: string }>()
    const id = params?.id ?? ''
    const { userId: meId } = useAuth()
    const { data: user, isLoading, isError, error } = useUser(id)
    const [editOpen, setEditOpen] = useState(false)
    const follow = useFollowToggle()

    if (isLoading) return <Spinner label="Cargando perfil" />
    if (isError) return (
        <div className="space-y-3 p-4">
            <ErrorMessage message={error?.message ?? 'Error al cargar'} />
        </div>
    )
    if (!user) return null

    const isMe = !!meId && meId === user.id
    const following = user.following ?? false

    return (
        <>
            <Header title={user.displayName} />
            <section className="border-b border-[var(--color-border)] p-6">
                <div className="flex items-start gap-4">
                    <Avatar src={user.avatar} alt={user.displayName} size="lg" />
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-xl font-bold">{user.displayName}</h1>
                        <p className="truncate text-[var(--color-muted)]">@{user.username}</p>
                        {user.bio && (
                            <p className="mt-2 whitespace-pre-wrap">{user.bio}</p>
                        )}
                        <div className="mt-3 flex gap-2">
                            {isMe ? (
                                <Button variant="secondary" onClick={() => setEditOpen(true)}>
                                    Editar perfil
                                </Button>
                            ) : (
                                <Button
                                    variant={following ? 'secondary' : 'primary'}
                                    onClick={() => {
                                        follow.mutate(
                                            { userId: user.id, following },
                                            {
                                                onSuccess: () =>
                                                    toast.success(
                                                        following ? 'Dejaste de seguir' : 'Siguiendo'
                                                    ),
                                                onError: (e) =>
                                                    toast.error(
                                                        e instanceof Error
                                                            ? e.message
                                                            : 'Error al seguir'
                                                    ),
                                            }
                                        )
                                    }}
                                    disabled={follow.isPending}
                                >
                                    {follow.isPending
                                        ? '…'
                                        : following
                                            ? 'Siguiendo'
                                            : 'Seguir'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            <EmptyState
                title="Posts del usuario"
                description="Próximamente: requiere GET /users/:id/posts en el backend"
            />
            {isMe && (
                <EditProfileModal
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    user={user}
                />
            )}
        </>
    )
}
