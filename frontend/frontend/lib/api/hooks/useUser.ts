'use client'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { CachedUser } from '@/lib/types'

export function useUser(id: string | null | undefined) {
    return useQuery<CachedUser, Error>({
        queryKey: id ? queryKeys.user(id) : ['noop'],
        queryFn: () => userApi.getById(id as string),
        enabled: !!id,
    })
}
