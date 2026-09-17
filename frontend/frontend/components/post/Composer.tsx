'use client'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useCreatePost } from '@/lib/api/hooks/useCreatePost'

const MAX = 500

export function Composer() {
    const { register, handleSubmit, reset, control } = useForm<{ content: string }>({
        defaultValues: { content: '' },
    })
    const { mutate, isPending } = useCreatePost()
    const [lastError, setLastError] = useState<string | null>(null)
    const value = useWatch({ control, name: 'content', defaultValue: '' }) ?? ''

    async function onSubmit({ content }: { content: string }) {
        setLastError(null)
        mutate({ content }, {
            onSuccess: () => {
                reset({ content: '' })
                toast.success('Publicado')
            },
            onError: (e) => {
                const msg = e instanceof Error ? e.message : 'Error al publicar'
                setLastError(msg)
                toast.error(msg)
            },
        })
    }

    const overLimit = value.length > MAX

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-b border-[var(--color-border)] p-4"
        >
            <Textarea
                placeholder="¿Qué estás pensando?"
                rows={3}
                maxLength={MAX + 50}
                {...register('content', { required: 'Escribe algo' })}
            />
            <div className="mt-2 flex items-center justify-between">
                <span
                    className={`text-sm tabular-nums ${overLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}`}
                >
                    {value.length} / {MAX}
                </span>
                <Button type="submit" disabled={isPending || !value.trim() || overLimit}>
                    {isPending ? 'Publicando…' : 'Postear'}
                </Button>
            </div>
            {lastError && (
                <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                    {lastError}
                </p>
            )}
        </form>
    )
}