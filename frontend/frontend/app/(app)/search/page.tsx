'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { UserCard } from '@/components/user/UserCard'
import { useSearchUsers } from '@/lib/api/hooks/useSearchUsers'

function SearchInner() {
    const params = useSearchParams()
    const router = useRouter()
    const [q, setQ] = useState(params.get('q') ?? '')
    const { data, isLoading } = useSearchUsers(q)
    const users = data?.users ?? []

    useEffect(() => {
        const current = params.get('q') ?? ''
        const trimmed = q.trim()
        if (trimmed === current) return
        const t = setTimeout(() => {
            const next = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search'
            router.replace(next, { scroll: false })
        }, 250)
        return () => clearTimeout(t)
    }, [q, params, router])

    return (
        <>
            <Header title="Buscar" />
            <div className="border-b border-[var(--color-border)] p-3">
                <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 focus-within:border-[var(--color-accent)]">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar personas"
                        aria-label="Buscar usuarios"
                        className="w-full bg-transparent outline-none"
                        autoFocus
                    />
                </div>
            </div>
            {q.trim().length < 2 ? (
                <EmptyState
                    title="Busca personas"
                    description="Escribe al menos 2 caracteres para buscar usuarios por nombre o @usuario."
                />
            ) : isLoading ? (
                <Spinner label="Buscando" />
            ) : users.length === 0 ? (
                <EmptyState title="Sin resultados" description={`No encontramos usuarios para “${q}”.`} />
            ) : (
                <ul>
                    {users.map((u) => (
                        <li key={u.id} className="border-b border-[var(--color-border)]">
                            <UserCard user={u} />
                        </li>
                    ))}
                </ul>
            )}
        </>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<Spinner label="Cargando búsqueda" />}>
            <SearchInner />
        </Suspense>
    )
}
