import clsx from 'clsx'

type CardProps = React.HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...props }: CardProps) {
    return (
        <div
            className={clsx('rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4', className)}
            {...props}
        >
            {children}
        </div>
    )
}
