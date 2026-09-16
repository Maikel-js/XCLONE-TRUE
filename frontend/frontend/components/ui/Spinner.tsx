import clsx from 'clsx'

type SpinnerProps = { className?: string; label?: string }

export function Spinner({ className, label = 'Cargando' }: SpinnerProps) {
    return (
        <div role="status" aria-live="polite" className={clsx('flex items-center justify-center p-4', className)}>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-muted)] border-t-[var(--color-accent)]" />
            <span className="sr-only">{label}</span>
        </div>
    )
}
