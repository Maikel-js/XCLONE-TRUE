import { forwardRef } from 'react'
import clsx from 'clsx'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => (
        <div className="space-y-1">
            <textarea
                ref={ref}
                className={clsx(
                    'w-full resize-none rounded border bg-transparent p-2 text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]',
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
Textarea.displayName = 'Textarea'
