'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { followApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { CachedUser } from '@/lib/types'

type Variables = { userId: string; following: boolean }

export function useFollowToggle() {
    const qc = useQueryClient()
    return useMutation<{ message: string }, Error, Variables>({
        mutationFn: ({ userId, following }) =>
            following ? followApi.unfollow(userId) : followApi.follow(userId),
        onMutate: async ({ userId, following }) => {
            const prev = qc.getQueryData<CachedUser>(queryKeys.user(userId))
            if (prev) {
                qc.setQueryData<CachedUser>(queryKeys.user(userId), {
                    ...prev,
                    following: !following,
                })
            }
            return { userId, prevFollowing: following }
        },
        onError: (_e, vars) => {
            const cached = qc.getQueryData<CachedUser>(queryKeys.user(vars.userId))
            if (cached) {
                qc.setQueryData<CachedUser>(queryKeys.user(vars.userId), {
                    ...cached,
                    following: vars.following,
                })
            }
        },
        onSettled: (_data, _err, vars) => {
            qc.invalidateQueries({ queryKey: queryKeys.user(vars.userId) })
            qc.invalidateQueries({ queryKey: queryKeys.suggestions() })
        },
    })
}

