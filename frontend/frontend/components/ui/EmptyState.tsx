import clsx from 'clsx'

type EmptyStateProps = {
    title: string
    description?: string
    className?: string
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
    return (
        <div className={clsx('flex flex-col items-center justify-center gap-1 p-8 text-center', className)}>
            <p className="text-lg font-semibold">{title}</p>
            {description && <p className="text-sm text-[var(--color-muted)]">{description}</p>}
        </div>
    )
}
