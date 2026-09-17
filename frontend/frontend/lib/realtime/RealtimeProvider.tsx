'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useWebSocket } from './useWebSocket'
import { useAuth } from '@/lib/auth/useAuth'
import { queryKeys } from '@/lib/api/queryKeys'
import type { CachedUser, FeedPage, NotificationEvent, WsServerEnvelope } from '@/lib/types'

type RealtimeStatus = 'idle' | 'connecting' | 'open' | 'closed'

type RealtimeContextValue = {
    status: RealtimeStatus
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null)

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? ''

function isNotificationEnvelope(data: unknown): data is WsServerEnvelope<NotificationEvent['payload']> {
    if (!data || typeof data !== 'object') return false
    const d = data as { type?: unknown; payload?: unknown }
    return typeof d.type === 'string'
}

function applyLikeToFeed(
    qc: ReturnType<typeof useQueryClient>,
    postId: string,
    delta: 1 | -1
) {
    for (const mode of ['for-you', 'following'] as const) {
        const key = queryKeys.feed(mode)
        const cached = qc.getQueryData<{ pages: FeedPage[]; pageParams: unknown[] }>(key)
        if (!cached) continue
        qc.setQueryData(key, {
            ...cached,
            pages: cached.pages.map((page) => ({
                ...page,
                items: page.items.map((p) =>
                    p.id === postId ? { ...p, likesCount: Math.max(0, p.likesCount + delta) } : p
                ),
            })),
        })
    }
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
    const { token } = useAuth()
    const qc = useQueryClient()
    const [status, setStatus] = useState<RealtimeStatus>('idle')

    const url = token ? `${WS_BASE}?token=${encodeURIComponent(token)}` : null

    const handleMessage = useCallback(
        (data: unknown) => {
            if (!isNotificationEnvelope(data)) return
            const { type, payload } = data

            switch (type) {
                case 'connection.ready':
                    return
                case 'post.liked': {
                    const p = payload as { postId: string; likerId: string }
                    applyLikeToFeed(qc, p.postId, 1)
                    return
                }
                case 'post.unliked': {
                    const p = payload as { postId: string; likerId: string }
                    applyLikeToFeed(qc, p.postId, -1)
                    return
                }
                case 'post.created':
                case 'post.updated':
                case 'post.deleted':
                    qc.invalidateQueries({ queryKey: queryKeys.feedList() })
                    return
                case 'user.updated': {
                    const p = payload as { id?: string; userId?: string } & Partial<CachedUser>
                    const uid = p.id ?? p.userId
                    if (!uid) return
                    const { id: _omit, userId: _omit2, ...rest } = p
                    qc.setQueryData<CachedUser>(queryKeys.user(uid), (prev) =>
                        prev ? ({ ...prev, ...rest, id: uid } as CachedUser) : ({ ...rest, id: uid } as CachedUser)
                    )
                    return
                }
                case 'user.deleted':
                    qc.invalidateQueries({ queryKey: queryKeys.feedList() })
                    return
                default:
                    return
            }
        },
        [qc]
    )

    useWebSocket({
        url,
        onMessage: handleMessage,
        onStatusChange: setStatus,
    })

    const value = useMemo(() => ({ status }), [status])

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
}

export function useRealtimeStatus(): RealtimeStatus {
    const ctx = useContext(RealtimeContext)
    return ctx?.status ?? 'idle'
}
