import clsx from 'clsx'

type AvatarProps = {
    src?: string | null
    alt: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-24 w-24 text-3xl',
} as const

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
    const initial = alt.charAt(0).toUpperCase()
    if (!src) {
        return (
            <div
                aria-label={alt}
                className={clsx(
                    'flex items-center justify-center rounded-full bg-[var(--color-card)] font-semibold text-[var(--color-foreground)]',
                    sizes[size],
                    className
                )}
            >
                {initial}
            </div>
        )
    }
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={clsx('rounded-full object-cover', sizes[size], className)} />
    )
}
