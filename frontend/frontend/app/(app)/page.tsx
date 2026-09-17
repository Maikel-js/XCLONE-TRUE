'use client'
import { useEffect, useRef, useState } from 'react'
import { Composer } from '@/components/post/Composer'
import { PostCard } from '@/components/post/PostCard'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { FeedTabs, type FeedTab } from '@/components/feed/FeedTabs'
import { useFeed } from '@/lib/api/hooks/useFeed'

export default function Home() {
    const [mode, setMode] = useState<FeedTab>('for-you')
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useFeed(mode)

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
            <div className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[rgba(0,0,0,0.65)] backdrop-blur md:top-0">
                <Header title="Inicio" className="border-b-0 backdrop-blur-none bg-transparent" />
                <FeedTabs value={mode} onChange={setMode} />
            </div>
            {mode === 'for-you' && <Composer />}
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
                    title={mode === 'following' ? 'Aún no sigues a nadie' : 'Nada por aquí todavía'}
                    description={
                        mode === 'following'
                            ? 'Sigue usuarios para ver su contenido aquí.'
                            : 'Sé el primero en postear algo.'
                    }
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
