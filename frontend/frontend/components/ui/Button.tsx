import { forwardRef } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    fullWidth?: boolean
}

const styles: Record<Variant, string> = {
    primary: 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]',
    secondary: 'bg-white text-black hover:bg-gray-200',
    ghost: 'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-card)]',
    danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', fullWidth, children, ...props }, ref) => (
        <button
            ref={ref}
            className={clsx(
                'rounded-full px-4 py-2 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed',
                styles[variant],
                fullWidth && 'w-full',
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
)
Button.displayName = 'Button'
