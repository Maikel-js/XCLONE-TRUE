'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postApi } from '../endpoints'
import { queryKeys } from '../queryKeys'

export function useCreatePost() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: postApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.feed() })
        },
    })
}
