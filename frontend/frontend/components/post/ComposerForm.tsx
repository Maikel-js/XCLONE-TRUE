'use client'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { CalendarClock, Flag, Image as ImageIcon, List, MapPin, Smile, Sparkles, X } from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { useCreatePost } from '@/lib/api/hooks/useCreatePost'
import { useMe } from '@/lib/api/hooks/useMe'
import { useAuth } from '@/lib/auth/useAuth'
import { GifPicker, type GiphyGif } from './GifPicker'

const MAX = 500
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
type SelectedImage = {
    file: File
    previewUrl: string
}

type Props = {
    autoFocus?: boolean
    onDone?: () => void
}

export function ComposerForm({ autoFocus, onDone }: Props) {
    const inputId = useId()
    const imageInputRef = useRef<HTMLInputElement>(null)
    const { register, handleSubmit, reset, control } = useForm<{ content: string }>({
        defaultValues: { content: '' },
    })
    const { mutate, isPending } = useCreatePost()
    const { username } = useAuth()
    const { data: me } = useMe()
    const [lastError, setLastError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
    const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null)
    const [gifPickerOpen, setGifPickerOpen] = useState(false)
    const value = useWatch({ control, name: 'content', defaultValue: '' }) ?? ''
    const remaining = MAX - value.length
    const overLimit = remaining < 0
    const progressPct = Math.min(100, (value.length / MAX) * 100)
    const ringStroke = overLimit
        ? 'var(--color-danger)'
        : progressPct > 80
            ? 'var(--color-accent)'
            : 'var(--color-border)'

    useEffect(() => {
        return () => {
            if (selectedImage) URL.revokeObjectURL(selectedImage.previewUrl)
        }
    }, [selectedImage])

    function handleMediaSelection(
        event: ChangeEvent<HTMLInputElement>,
        allowedTypes: Set<string>,
        errorMessage: string
    ) {
        const input = event.currentTarget
        const file = input.files?.[0]
        // Permite volver a seleccionar el mismo archivo después de quitarlo.
        input.value = ''

        if (!file) return

        if (!allowedTypes.has(file.type)) {
            toast.error(errorMessage)
            return
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error('La imagen no puede superar los 5 MB')
            return
        }

        setSelectedImage({ file, previewUrl: URL.createObjectURL(file) })
        setSelectedGif(null)
        setLastError(null)
    }

    function handleImageSelection(event: ChangeEvent<HTMLInputElement>) {
        handleMediaSelection(event, ALLOWED_IMAGE_TYPES, 'Elige una imagen JPEG, PNG o WebP')
    }

    async function onSubmit({ content }: { content: string }) {
        setLastError(null)
        mutate({ content, image: selectedImage?.file, gifUrl: selectedGif?.originalUrl }, {
            onSuccess: () => {
                reset({ content: '' })
                setSelectedImage(null)
                setSelectedGif(null)
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
            className="flex gap-3 border-b border-[var(--color-border)] px-5 pb-3 pt-4"
        >
            <div className="hidden shrink-0 sm:block">
                <Avatar src={me?.avatar ?? null} alt={username ?? 'Yo'} />
            </div>
            <div className="min-w-0 flex-1">
                <Textarea
                    placeholder="What’s happening?"
                    rows={2}
                    maxLength={MAX + 50}
                    autoFocus={autoFocus}
                    id={inputId}
                    className="min-h-[54px] resize-none border-0 bg-transparent p-0 text-[22px] leading-[1.35] placeholder:text-[var(--color-muted)] focus:outline-none"
                    {...register('content', { required: !selectedImage && !selectedGif && 'Escribe algo o adjunta un medio' })}
                />
                {(selectedImage || selectedGif) && (
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--color-border)] p-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={selectedImage?.previewUrl ?? selectedGif?.previewUrl}
                            alt={selectedImage ? `Vista previa de ${selectedImage.file.name}` : 'Vista previa del GIF'}
                            className="h-20 w-20 shrink-0 rounded-xl object-cover"
                        />
                        <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-muted)]">
                            {selectedImage?.file.name ?? selectedGif?.title ?? 'GIF seleccionado'}
                        </span>
                        <button
                            type="button"
                            aria-label="Quitar imagen"
                            title="Quitar imagen"
                            disabled={isPending}
                            onClick={() => {
                                setSelectedImage(null)
                                setSelectedGif(null)
                            }}
                            className="rounded-full p-2 transition hover:bg-[var(--hover)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                )}
                <div className="mt-2 flex items-center justify-between gap-2 pt-2">
                    <div className="flex min-w-0 items-center gap-0.5 text-[var(--color-muted)] sm:gap-1">
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            aria-label="Seleccionar imagen"
                            onChange={handleImageSelection}
                        />
                        <button
                            type="button"
                            aria-label="Subir imagen"
                            className="rounded-full p-2 transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                            title={selectedImage || selectedGif ? 'Cambiar imagen' : 'Subir imagen'}
                            disabled={isPending}
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <ImageIcon size={21} />
                        </button>
                        <button
                            type="button"
                            aria-label="GIF"
                            disabled={isPending}
                            className="flex h-9 min-w-9 items-center justify-center rounded-lg border-2 border-current px-1 text-[10px] font-extrabold leading-none transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)]"
                            title="Buscar GIF"
                            onClick={() => setGifPickerOpen(true)}
                        >
                            GIF
                        </button>
                        <ComposerTool label="Grok" icon={Sparkles} />
                        <ComposerTool label="Poll" icon={List} />
                        <ComposerTool label="Emoji" icon={Smile} />
                        <ComposerTool label="Schedule" icon={CalendarClock} />
                        <ComposerTool label="Location" icon={MapPin} />
                        <ComposerTool label="Content warning" icon={Flag} className="hidden sm:flex" />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
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
                        <button
                            type="submit"
                            disabled={isPending || (!value.trim() && !selectedImage && !selectedGif) || overLimit}
                            className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-[16px] font-bold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-[#333639] disabled:text-black"
                        >
                            {isPending ? 'Posting…' : 'Post'}
                        </button>
                    </div>
                </div>
                {lastError && (
                    <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
                        {lastError}
                    </p>
                )}
                <GifPicker
                    open={gifPickerOpen}
                    onClose={() => setGifPickerOpen(false)}
                    onSelect={(gif) => {
                        setSelectedGif(gif)
                        setSelectedImage(null)
                        setGifPickerOpen(false)
                        setLastError(null)
                    }}
                />
            </div>
        </form>
    )
}

function ComposerTool({
    label,
    icon: Icon,
    className,
}: {
    label: string
    icon: typeof ImageIcon
    className?: string
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => toast.info(`${label}: no está disponible`)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)] ${className ?? ''}`}
        >
            <Icon size={21} aria-hidden="true" />
        </button>
    )
}
