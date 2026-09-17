'use client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { FeedPage } from '@/lib/types'

export function useUserPosts(userId: string | null | undefined) {
    return useInfiniteQuery<FeedPage, Error>({
        queryKey: userId ? queryKeys.userPosts(userId) : ['noop', 'userPosts'],
        queryFn: ({ pageParam }) =>
            userApi.posts(userId as string, { cursor: pageParam as string | undefined }),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: !!userId,
    })
}
