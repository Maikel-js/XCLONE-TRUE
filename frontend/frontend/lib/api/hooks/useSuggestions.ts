'use client'
import { useQuery } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { User } from '@/lib/types'

export function useSuggestions(enabled = true) {
    return useQuery<{ users: User[] }, Error>({
        queryKey: queryKeys.suggestions(),
        queryFn: () => userApi.suggestions(10),
        enabled,
        staleTime: 60_000,
    })
}
