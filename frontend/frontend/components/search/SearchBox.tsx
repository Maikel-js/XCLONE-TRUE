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
            className="sticky top-0 z-10 flex h-[48px] items-center rounded-full border border-[var(--color-border)] bg-black px-4 transition focus-within:border-[var(--color-accent)]"
            role="search"
        >
            <div className="flex items-center gap-3">
                <Search size={21} className="shrink-0 text-[var(--color-muted)]" aria-hidden="true" />
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search"
                    aria-label="Search"
                    className="w-full bg-transparent text-base text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none"
                />
            </div>
        </form>
    )
}
