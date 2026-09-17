'use client'
import { useEffect, useRef } from 'react'
import { Composer } from '@/components/post/Composer'
import { PostCard } from '@/components/post/PostCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { useFeed } from '@/lib/api/hooks/useFeed'

export default function Home() {
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useFeed()

    const sentinelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = sentinelRef.current
        if (!el || !hasNextPage) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchNextPage()
                }
            },
            { rootMargin: '200px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasNextPage, fetchNextPage])

    const posts = data?.pages.flatMap((p) => p.items) ?? []

    return (
        <>
            <Header title="Inicio" />
            <Composer />
            {isLoading ? (
                <Spinner label="Cargando feed" />
            ) : isError ? (
                <div className="space-y-3 p-4">
                    <ErrorMessage message={error?.message ?? 'Error al cargar el feed'} />
                    <Button variant="secondary" onClick={() => refetch()}>
                        Reintentar
                    </Button>
                </div>
            ) : posts.length === 0 ? (
                <EmptyState
                    title="Nada por aquí todavía"
                    description="Sé el primero en postear algo."
                />
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                    <div ref={sentinelRef} aria-hidden="true" />
                    {isFetchingNextPage && <Spinner label="Cargando más" />}
                    {!hasNextPage && posts.length > 0 && (
                        <p className="p-6 text-center text-sm text-[var(--color-muted)]">
                            Has llegado al final
                        </p>
                    )}
                </>
            )}
        </>
    )
}
