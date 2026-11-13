'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { placeApi } from '@/lib/api/endpoints'
import type { Place } from '@/lib/types'

type Props = {
    selected: Place | null
    onSelect: (place: Place | null) => void
}

export function LocationPicker({ selected, onSelect }: Props) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Place[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open) inputRef.current?.focus()
    }, [open])

    // Autocomplete con debounce (solo fetch; el estado vacio se maneja en el render)
    useEffect(() => {
        const q = query.trim()
        if (q.length < 2) return

        const controller = new AbortController()
        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const places = await placeApi.search(q, 8)
                if (controller.signal.aborted) return
                setResults(places)
                setError(null)
            } catch {
                if (controller.signal.aborted) return
                setError('No se pudo buscar lugares')
            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [query])

    function reset() {
        setOpen(false)
        setQuery('')
        setResults([])
        setError(null)
    }

    if (selected) {
        const subtitle = [selected.locality, selected.region, selected.country]
            .filter(Boolean)[0]
        return (
            <div className="flex items-center gap-2 rounded-full bg-[var(--color-card)] px-3 py-1.5 text-sm">
                <MapPin size={16} className="shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                <span className="min-w-0 truncate font-semibold">
                    {selected.name}
                    {subtitle ? ` · ${subtitle}` : ''}
                </span>
                <button
                    type="button"
                    aria-label="Quitar ubicación"
                    title="Quitar ubicación"
                    onClick={() => onSelect(null)}
                    className="rounded-full p-0.5 text-[var(--color-muted)] transition hover:text-[var(--color-danger)]"
                >
                    <X size={14} aria-hidden="true" />
                </button>
            </div>
        )
    }

    if (!open) return null

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3">
                <Search size={16} className="shrink-0 text-[var(--color-muted)]" aria-hidden="true" />
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Busca una ciudad o lugar…"
                    aria-label="Buscar ubicación"
                    className="h-10 w-full bg-transparent text-base focus:outline-none"
                />
                <button
                    type="button"
                    aria-label="Cerrar buscador de ubicación"
                    onClick={reset}
                    className="rounded-full p-1 text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
                >
                    <X size={16} aria-hidden="true" />
                </button>
            </div>

            <div className="mt-1 max-h-56 overflow-y-auto">
                {query.trim().length < 2 && (
                    <p className="px-3 py-2 text-sm text-[var(--color-muted)]">
                        Escribe al menos 2 caracteres para buscar
                    </p>
                )}
                {loading && (
                    <p className="px-3 py-2 text-sm text-[var(--color-muted)]">Buscando…</p>
                )}
                {error && (
                    <p className="px-3 py-2 text-sm text-[var(--color-danger)]">{error}</p>
                )}
                {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
                    <p className="px-3 py-2 text-sm text-[var(--color-muted)]">Sin resultados</p>
                )}
                {results.map((place) => {
                    const subtitle = [place.locality, place.region, place.country]
                        .filter(Boolean)[0]
                    return (
                        <button
                            key={place.id}
                            type="button"
                            onClick={() => {
                                onSelect(place)
                                reset()
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--hover)]"
                        >
                            <MapPin size={16} className="shrink-0 text-[var(--color-muted)]" aria-hidden="true" />
                            <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium">{place.name}</span>
                                {subtitle && (
                                    <span className="block truncate text-sm text-[var(--color-muted)]">{subtitle}</span>
                                )}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
