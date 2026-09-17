'use client'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { Globe, Image as ImageIcon, Smile } from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useCreatePost } from '@/lib/api/hooks/useCreatePost'
import { useMe } from '@/lib/api/hooks/useMe'
import { useAuth } from '@/lib/auth/useAuth'

const MAX = 500

type Props = {
    autoFocus?: boolean
    onDone?: () => void
    compact?: boolean
}

export function ComposerForm({ autoFocus, onDone, compact }: Props) {
    const { register, handleSubmit, reset, control } = useForm<{ content: string }>({
        defaultValues: { content: '' },
    })
    const { mutate, isPending } = useCreatePost()
    const { username } = useAuth()
    const { data: me } = useMe()
    const [lastError, setLastError] = useState<string | null>(null)
    const value = useWatch({ control, name: 'content', defaultValue: '' }) ?? ''
    const remaining = MAX - value.length
    const overLimit = remaining < 0
    const progressPct = Math.min(100, (value.length / MAX) * 100)
    const ringStroke = overLimit
        ? 'var(--color-danger)'
        : progressPct > 80
            ? 'var(--color-accent)'
            : 'var(--color-border)'

    async function onSubmit({ content }: { content: string }) {
        setLastError(null)
        mutate({ content }, {
            onSuccess: () => {
                reset({ content: '' })
                toast.success('Publicado')
                onDone?.()
            },
            onError: (e) => {
                const msg = e instanceof Error ? e.message : 'Error al publicar'
                setLastError(msg)
                toast.error(msg)
            },
        })
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex gap-3 p-4"
        >
            <div className="hidden shrink-0 sm:block">
                <Avatar src={me?.avatar ?? null} alt={username ?? 'Yo'} />
            </div>
            <div className="min-w-0 flex-1">
                <Textarea
                    placeholder="¿Qué está pasando?"
                    rows={compact ? 3 : 4}
                    maxLength={MAX + 50}
                    autoFocus={autoFocus}
                    className="min-h-[80px] border-0 bg-transparent p-0 text-xl focus:outline-none"
                    {...register('content', { required: 'Escribe algo' })}
                />
                <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border)] pt-3">
                    <div className="flex items-center gap-1 text-[var(--color-accent)]">
                        <button
                            type="button"
                            aria-label="Subir imagen"
                            className="rounded-full p-2 hover:bg-[rgba(29,155,240,0.1)]"
                            title="Próximamente"
                            disabled
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button
                            type="button"
                            aria-label="Emoji"
                            className="rounded-full p-2 hover:bg-[rgba(29,155,240,0.1)]"
                            title="Próximamente"
                            disabled
                        >
                            <Smile size={18} />
                        </button>
                        <span className="ml-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs text-[var(--color-accent)]">
                            <Globe size={14} />
                            Público
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {value.length > 0 && (
                            <div className="flex items-center gap-2">
                                <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2" fill="transparent" />
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke={ringStroke}
                                        strokeWidth="2"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={`${Math.max(0, Math.min(100, progressPct)) * 0.628} 62.8`}
                                        transform="rotate(-90 12 12)"
                                    />
                                </svg>
                                {remaining <= 20 && (
                                    <span
                                        className={`text-sm tabular-nums ${overLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-muted)]'}`}
                                    >
                                        {remaining}
                                    </span>
                                )}
                            </div>
                        )}
                        <Button type="submit" disabled={isPending || !value.trim() || overLimit}>
                            {isPending ? 'Publicando…' : 'Postear'}
                        </Button>
                    </div>
                </div>
                {lastError && (
                    <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                        {lastError}
                    </p>
                )}
            </div>
        </form>
    )
}
