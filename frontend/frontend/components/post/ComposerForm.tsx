'use client'
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { CalendarClock, Flag, Globe, Image as ImageIcon, List, MapPin, Plus, Smile, Sparkles, X } from 'lucide-react'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { useCreatePost } from '@/lib/api/hooks/useCreatePost'
import { useMe } from '@/lib/api/hooks/useMe'
import { useAuth } from '@/lib/auth/useAuth'
import { GifPicker, type GiphyGif } from './GifPicker'
import { type CreatePollInput } from '@/lib/types'
import { EmojiPickerPanel } from './EmojiPicker'
import { SchedulePostModal } from './SchedulePostModal'

const MAX = 500
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
type SelectedImage = {
    file: File
    previewUrl: string
}

function formatDateInput(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatTimeInput(date: Date) {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
}

type Props = {
    autoFocus?: boolean
    onDone?: () => void
}

export function ComposerForm({ autoFocus, onDone }: Props) {
    const inputId = useId()
    const imageInputRef = useRef<HTMLInputElement>(null)
    const { register, handleSubmit, reset, control, setValue } = useForm<{ content: string }>({
        defaultValues: { content: '' },
    })
    const { mutate, isPending } = useCreatePost()
    const { username } = useAuth()
    const { data: me } = useMe()
    const [lastError, setLastError] = useState<string | null>(null)
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null)
    const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null)
    const [gifPickerOpen, setGifPickerOpen] = useState(false)
    const [pollDraft, setPollDraft] = useState<CreatePollInput | null>(null)
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
    const [scheduleOpen, setScheduleOpen] = useState(false)
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduleTime, setScheduleTime] = useState('')
    const [scheduleMinDate, setScheduleMinDate] = useState('')
    const value = useWatch({ control, name: 'content', defaultValue: '' }) ?? ''
    const remaining = MAX - value.length
    const overLimit = remaining < 0
    const progressPct = Math.min(100, (value.length / MAX) * 100)
    const ringStroke = overLimit
        ? 'var(--color-danger)'
        : progressPct > 80
            ? 'var(--color-accent)'
            : 'var(--color-border)'

    function openScheduleModal() {
        const currentDate = new Date()
        const initialDate = new Date(currentDate.getTime() + 60 * 60 * 1000)
        setScheduleMinDate(formatDateInput(currentDate))
        setScheduleDate(formatDateInput(initialDate))
        setScheduleTime(formatTimeInput(initialDate))
        setScheduleOpen(true)
    }

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
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex gap-3 border-b border-[var(--color-border)] px-5 pb-3 pt-4"
            >
                <div className="hidden shrink-0 sm:block">
                    <Avatar src={me?.avatar ?? null} alt={username ?? 'Yo'} className="2xl:h-14 2xl:w-14" />
                </div>
                <div className="min-w-0 flex-1">
                    <Textarea
                        placeholder={pollDraft ? 'Ask a question' : 'What’s happening?'}
                        rows={2}
                        maxLength={MAX + 50}
                        autoFocus={autoFocus}
                        id={inputId}
                        className="min-h-[54px] resize-none border-0 bg-transparent p-0 text-[22px] leading-[1.35] placeholder:text-[var(--color-muted)] focus:outline-none 2xl:min-h-[72px] 2xl:text-[28px]"
                        {...register('content', { required: !selectedImage && !selectedGif && 'Escribe algo o adjunta un medio' })}
                    />
                    {pollDraft && (
                        <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--color-border)]">
                            <div className="space-y-2 p-2.5">
                                {pollDraft.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-[3rem_minmax(0,1fr)_2rem] items-center gap-2"
                                    >
                                        <div
                                            aria-hidden="true"
                                            className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)]"
                                        >
                                            <ImageIcon size={18} />
                                        </div>

                                        <div className="relative min-w-0">
                                            <input
                                                value={option}
                                                maxLength={25}
                                                placeholder={index < 2 ? `Choice ${index + 1}` : `Choice ${index + 1} (optional)`}
                                                aria-label={`Opción ${index + 1}`}
                                                onChange={(event) =>
                                                    setPollDraft((current) =>
                                                        current
                                                            ? {
                                                                ...current,
                                                                options: current.options.map((text, i) =>
                                                                    i === index ? event.target.value : text
                                                                ),
                                                            }
                                                            : null
                                                    )
                                                }
                                                className="h-12 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-transparent px-3 pr-14 text-base"
                                            />
                                            {index >= 2 && (
                                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">
                                                    {option.length}/25
                                                </span>
                                            )}
                                        </div>

                                        {index === pollDraft.options.length - 1 &&
                                            pollDraft.options.length < 4 ? (
                                            <button
                                                type="button"
                                                aria-label="Añadir opción"
                                                title="Añadir opción"
                                                onClick={() =>
                                                    setPollDraft((current) =>
                                                        current && current.options.length < 4
                                                            ? { ...current, options: [...current.options, ''] }
                                                            : current
                                                    )
                                                }
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-accent)] hover:bg-[rgba(29,155,240,0.1)]"
                                            >
                                                <Plus size={20} aria-hidden="true" />
                                            </button>
                                        ) : (
                                            <span aria-hidden="true" />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-[var(--color-border)] px-2.5 py-2">
                                <h3 className="mb-1 text-base">Poll length</h3>

                                <div className="grid grid-cols-3 gap-3">
                                    {([
                                        { field: 'days', label: 'Days', max: 7 },
                                        { field: 'hours', label: 'Hours', max: 23 },
                                        { field: 'minutes', label: 'Minutes', max: 59 },
                                    ] as const).map(({ field, label, max }) => (
                                        <label
                                            key={field}
                                            className="flex min-w-0 flex-col rounded-lg border border-[var(--color-border)] p-1.5"
                                        >
                                            <span className="text-xs text-[var(--color-muted)]">{label}</span>
                                            <select
                                                value={pollDraft.duration[field]}
                                                onChange={(event) =>
                                                    setPollDraft((current) =>
                                                        current
                                                            ? {
                                                                ...current,
                                                                duration: {
                                                                    ...current.duration,
                                                                    [field]: Number(event.target.value),
                                                                },
                                                            }
                                                            : null
                                                    )
                                                }
                                                className="w-full bg-transparent text-sm text-[var(--color-foreground)] focus:outline-none"
                                            >
                                                {Array.from({ length: max + 1 }, (_, value) => (
                                                    <option key={value} value={value}>
                                                        {value}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPollDraft(null)}
                                className="w-full border-t border-[var(--color-border)] py-2 text-center text-lg text-[var(--color-danger)] transition hover:bg-[var(--hover)]"
                            >
                                Remove poll
                            </button>
                        </div>
                    )}
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
                    <div className="mt-3 border-b border-[var(--color-border)] pb-3">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 font-semibold text-[var(--color-accent)]"
                        >
                            <Globe size={18} aria-hidden="true" />
                            Everyone can reply
                        </button>
                    </div>
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-3 pt-2">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 text-[var(--color-muted)] sm:gap-1">
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
                                className="rounded-full p-1.5 transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                                title={selectedImage || selectedGif ? 'Cambiar imagen' : 'Subir imagen'}
                                disabled={isPending}
                                onClick={() => imageInputRef.current?.click()}
                            >
                                <ImageIcon size={18} />
                            </button>
                            <button
                                type="button"
                                aria-label="GIF"
                                disabled={isPending}
                                className="flex h-8 min-w-8 items-center justify-center rounded-lg border-2 border-current px-1 text-[9px] font-extrabold leading-none transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)]"
                                title="Buscar GIF"
                                onClick={() => setGifPickerOpen(true)}
                            >
                                GIF
                            </button>
                            <ComposerTool label="Grok" icon={Sparkles} />
                            <ComposerTool
                                label="Poll"
                                icon={List}
                                onClick={() =>
                                    setPollDraft({ duration: { days: 1, hours: 0, minutes: 0 }, options: ['', ''] })}
                            />
                            <div className="relative">
                                <ComposerTool
                                    label="Emoji"
                                    icon={Smile}
                                    onClick={() => setEmojiPickerOpen((open) => !open)}
                                />
                                {emojiPickerOpen && (
                                    <div className="absolute left-1/2 top-full z-50 mt-2 w-[350px] max-w-[calc(100vw-2rem)] -translate-x-1/2">
                                        <EmojiPickerPanel
                                            onSelect={(emoji) => {
                                                setValue('content', `${value}${emoji}`, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                })
                                                setEmojiPickerOpen(false)
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <ComposerTool
                                label="Schedule"
                                icon={CalendarClock}
                                onClick={openScheduleModal}
                            />
                            <ComposerTool label="Location" icon={MapPin} />
                            <ComposerTool label="Content warning" icon={Flag} />
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-2">
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
                                className="rounded-full bg-[var(--color-accent)] px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-[#333639] disabled:text-black"
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
            </form >
            <SchedulePostModal
                open={scheduleOpen}
                onClose={() => setScheduleOpen(false)}
                date={scheduleDate}
                time={scheduleTime}
                minDate={scheduleMinDate}
                onDateChange={setScheduleDate}
                onTimeChange={setScheduleTime}
                onConfirm={(date) => {
                    setScheduleOpen(false)
                    toast.info(
                        `Fecha elegida: ${date.toLocaleString()}. La programación aún no está conectada.`
                    )
                }}
            />
        </>
    )
}

function ComposerTool({
    label,
    icon: Icon,
    className,
    onClick,
}: {
    label: string
    icon: typeof ImageIcon
    className?: string
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            onClick={() => {
                if (onClick) onClick()
                else toast.info(`${label}: no está disponible`)
            }}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition hover:bg-[rgba(29,155,240,0.1)] hover:text-[var(--color-accent)] ${className ?? ''}`}
        >
            <Icon size={18} aria-hidden="true" />
        </button>
    )
}
