'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '../endpoints'
import { queryKeys } from '../queryKeys'
import type { CachedUser, UpdateUserInput } from '@/lib/types'

export function useUpdateUser(id: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (input: UpdateUserInput) => userApi.update(id, input),
        onSuccess: (data: CachedUser) => {
            qc.setQueryData(queryKeys.user(id), data)
            qc.invalidateQueries({ queryKey: queryKeys.me() })
        },
    })
}
