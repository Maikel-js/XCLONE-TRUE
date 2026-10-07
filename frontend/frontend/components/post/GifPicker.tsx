'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

export type GiphyGif = {
    id: string
    title: string
    previewUrl: string
    originalUrl: string
}

type GiphyResult = {
    id: string
    title?: string
    images?: {
        original?: { url?: string }
        fixed_width_small?: { url?: string }
        fixed_width?: { url?: string }
    }
}

type Props = {
    open: boolean
    onClose: () => void
    onSelect: (gif: GiphyGif) => void
}

const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY

export function GifPicker({ open, onClose, onSelect }: Props) {
    const [query, setQuery] = useState('')
    const [gifs, setGifs] = useState<GiphyGif[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!open) return
        if (!API_KEY) return

        const controller = new AbortController()
        const timeoutId = window.setTimeout(async () => {
            setIsLoading(true)
            setError(null)

            const params = new URLSearchParams({
                api_key: API_KEY,
                limit: '24',
                rating: 'pg-13',
                lang: 'es',
            })
            const normalizedQuery = query.trim()
            const endpoint = normalizedQuery
                ? 'https://api.giphy.com/v1/gifs/search'
                : 'https://api.giphy.com/v1/gifs/trending'
            if (normalizedQuery) params.set('q', normalizedQuery)

            try {
                const response = await fetch(`${endpoint}?${params}`, { signal: controller.signal })
                if (!response.ok) throw new Error('No se pudieron cargar los GIFs.')

                const result = await response.json() as { data?: GiphyResult[] }
                const items = (result.data ?? []).flatMap((gif): GiphyGif[] => {
                    const originalUrl = gif.images?.original?.url
                    if (!originalUrl) return []

                    return [{
                        id: gif.id,
                        title: gif.title || 'GIF',
                        originalUrl,
                        previewUrl: gif.images?.fixed_width_small?.url
                            ?? gif.images?.fixed_width?.url
                            ?? originalUrl,
                    }]
                })
                setGifs(items)
            } catch (fetchError) {
                if (!controller.signal.aborted) {
                    setError(fetchError instanceof Error ? fetchError.message : 'Error al cargar los GIFs.')
                    setGifs([])
                }
            } finally {
                if (!controller.signal.aborted) setIsLoading(false)
            }
        }, query.trim() ? 300 : 0)

        return () => {
            window.clearTimeout(timeoutId)
            controller.abort()
        }
    }, [open, query])

    const visibleError = error ?? (!API_KEY ? 'Para buscar GIFs, configura NEXT_PUBLIC_GIPHY_API_KEY.' : null)

    return (
        <Modal open={open} onClose={onClose} title="Elige un GIF" className="w-full max-w-xl p-0">
            <div className="px-4 pb-4">
                <label className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2">
                    <Search size={18} className="shrink-0 text-[var(--color-muted)]" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Buscar GIFs"
                        aria-label="Buscar GIFs"
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-muted)]"
                    />
                </label>

                <div className="mt-4 grid max-h-[min(55vh,420px)] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                    {gifs.map((gif) => (
                        <button
                            key={gif.id}
                            type="button"
                            onClick={() => onSelect(gif)}
                            title={gif.title}
                            aria-label={`Agregar GIF: ${gif.title}`}
                            className="overflow-hidden rounded-xl bg-[var(--hover)] transition hover:ring-2 hover:ring-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={gif.previewUrl} alt={gif.title} loading="lazy" className="h-32 w-full object-cover" />
                        </button>
                    ))}
                </div>

                {isLoading && <p className="py-8 text-center text-sm text-[var(--color-muted)]">Cargando GIFs…</p>}
                {!isLoading && !visibleError && gifs.length === 0 && (
                    <p className="py-8 text-center text-sm text-[var(--color-muted)]">No se encontraron GIFs.</p>
                )}
                {visibleError && <p role="alert" className="py-6 text-center text-sm text-[var(--color-danger)]">{visibleError}</p>}
                <p className="mt-3 text-right text-xs font-semibold text-[var(--color-muted)]">Powered by GIPHY</p>
            </div>
        </Modal>
    )
}
