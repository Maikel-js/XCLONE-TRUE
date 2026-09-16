import clsx from 'clsx'

type ErrorMessageProps = {
    message: string
    className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
    return (
        <p role="alert" className={clsx('text-sm text-[var(--color-danger)]', className)}>
            {message}
        </p>
    )
}
