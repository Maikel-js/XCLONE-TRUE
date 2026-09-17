'use client'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import { useAuth } from '@/lib/auth/useAuth'
import type { CachedUser } from '@/lib/types'

export function useMe() {
    const { isAuthenticated, isBootstrapping } = useAuth()
    return useQuery<CachedUser, Error>({
        queryKey: queryKeys.me(),
        queryFn: () => userApi.me(),
        enabled: isAuthenticated && !isBootstrapping,
        staleTime: 5 * 60_000,
    })
}
