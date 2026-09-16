import clsx from 'clsx'

type HeaderProps = {
    title: string
    className?: string
}

export function Header({ title, className }: HeaderProps) {
    return (
        <header
            className={clsx(
                'sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--background)]/80 px-4 py-3 backdrop-blur md:hidden',
                className
            )}
        >
            <h1 className="text-lg font-bold">{title}</h1>
        </header>
    )
}
