type GrokMarkProps = {
    size?: number
    strokeWidth?: number
    className?: string
}

export function GrokMark({ size, className }: GrokMarkProps){
    return (
        <svg
            viewBox="0 0 64 64"
            width={size}
            height={size}
            fill="none"
            className={className}
            aria-hidden="true"
        >
            <path
            d="M48.1 14.9A22 22 0 1 0 51 32"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            />

            <path
            d="M56 7 8 57"
            stroke="currentColor"
            strokeWidth="5.5"
            strokeLinecap="round"
            />
        </svg>
    )
}