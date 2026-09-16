'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { feedApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { FeedPage } from '@/lib/types'

export function useFeed() {
    return useInfiniteQuery<FeedPage, Error>({
        queryKey: queryKeys.feed(),
        queryFn: ({ pageParam }) =>
            feedApi.getPage({ cursor: pageParam as string | undefined }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
    })
}
