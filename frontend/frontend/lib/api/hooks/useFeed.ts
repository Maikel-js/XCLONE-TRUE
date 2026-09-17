'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth/useAuth'
import { feedApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { FeedPage } from '@/lib/types'

export type FeedMode = 'for-you' | 'following'

export function useFeed(mode: FeedMode = 'for-you') {
    const { isAuthenticated, isBootstrapping } = useAuth()
    return useInfiniteQuery<FeedPage, Error>({
        queryKey: queryKeys.feed(mode),
        queryFn: ({ pageParam }) =>
            feedApi.getPage({ cursor: pageParam as string | undefined, mode }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: isAuthenticated && !isBootstrapping,
    })
}
