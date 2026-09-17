'use client'
import { useState } from 'react'
import { UserCard } from './UserCard'
import { useSuggestions } from '@/lib/api/hooks/useSuggestions'
import { useAuth } from '@/lib/auth/useAuth'
import type { User } from '@/lib/types'

export function WhoToFollow() {
    const { isAuthenticated } = useAuth()
    const { data, isLoading } = useSuggestions(isAuthenticated)
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())

    const users: User[] = (data?.users ?? []).filter((u) => !hiddenIds.has(u.id))
    if (!isAuthenticated) return null
    if (isLoading) {
        return (
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm text-[var(--color-muted)]">
                Cargando sugerencias…
            </section>
        )
    }
    if (users.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]">
            <h2 className="px-4 py-3 text-xl font-bold">¿A quién seguir?</h2>
            <ul>
                {users.slice(0, 5).map((u) => (
                    <li key={u.id} className="border-t border-[var(--color-border)]">
                        <UserCard user={u} compact onUnfollow={() => setHiddenIds((prev) => new Set(prev).add(u.id))} />
                    </li>
                ))}
            </ul>
        </section>
    )
}
