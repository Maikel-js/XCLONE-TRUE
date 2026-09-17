'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

export function SearchBox() {
    const [value, setValue] = useState('')
    const router = useRouter()

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                const q = value.trim()
                if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
                else router.push('/search')
            }}
            className="sticky top-0 z-10 -mx-2 rounded-full border border-transparent bg-[var(--color-card)] px-4 py-2 transition focus-within:border-[var(--color-accent)]"
            role="search"
        >
            <div className="flex items-center gap-3">
                <Search size={18} className="text-[var(--color-muted)]" aria-hidden="true" />
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Buscar"
                    aria-label="Buscar usuarios"
                    className="w-full bg-transparent text-[15px] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none"
                />
            </div>
        </form>
    )
}
