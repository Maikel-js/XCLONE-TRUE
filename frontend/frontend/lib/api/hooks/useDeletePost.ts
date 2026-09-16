'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postApi } from '../endpoints'
import { queryKeys } from '../queryKeys'

export function useDeletePost() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: postApi.delete,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.feed() })
        },
    })
}
