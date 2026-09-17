'use client'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { User } from '@/lib/types'

export function useSearchUsers(q: string) {
    const trimmed = q.trim()
    return useQuery<{ users: User[] }, Error>({
        queryKey: queryKeys.search(trimmed),
        queryFn: () => userApi.search(trimmed),
        enabled: trimmed.length >= 2,
        staleTime: 15_000,
    })
}
