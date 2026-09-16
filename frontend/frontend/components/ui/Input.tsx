import { forwardRef } from 'react'
import clsx from 'clsx'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, ...props }, ref) => (
        <div className="space-y-1">
            <input
                ref={ref}
                className={clsx(
                    'w-full rounded border bg-transparent p-2 text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]',
                    error
                        ? 'border-[var(--color-danger)]'
                        : 'border-[var(--color-border)]',
                    className
                )}
                {...props}
            />
            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        </div>
    )
)
Input.displayName = 'Input'
