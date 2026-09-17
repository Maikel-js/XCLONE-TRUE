'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { FeedPage } from '@/lib/types'

type Variables = { postId: string; likedByMe: boolean }

function updateFeedCache(
    qc: ReturnType<typeof useQueryClient>,
    postId: string,
    updater: (likesCount: number, likedByMe: boolean) => { likesCount: number; likedByMe: boolean }
) {
    for (const mode of ['for-you', 'following'] as const) {
        const key = queryKeys.feed(mode)
        const cached = qc.getQueryData<{
            pages: FeedPage[]
            pageParams: unknown[]
        }>(key)
        if (!cached) continue
        qc.setQueryData(key, {
            ...cached,
            pages: cached.pages.map((page) => ({
                ...page,
                items: page.items.map((p) =>
                    p.id === postId
                        ? { ...p, ...updater(p.likesCount, p.likedByMe) }
                        : p
                ),
            })),
        })
    }
}

export function useToggleLike() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ postId, likedByMe }: Variables) =>
            likedByMe ? likeApi.unlike(postId) : likeApi.like(postId),
        onMutate: async ({ postId, likedByMe }) => {
            updateFeedCache(qc, postId, (count, mine) => ({
                likesCount: count + (mine ? -1 : 1),
                likedByMe: !mine,
            }))
            return { postId, prevLikedByMe: likedByMe }
        },
        onError: (_e, vars) => {
            updateFeedCache(qc, vars.postId, (count) => ({
                likesCount: count + (vars.likedByMe ? 1 : -1),
                likedByMe: vars.likedByMe,
            }))
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.feedList() })
        },
    })
}
