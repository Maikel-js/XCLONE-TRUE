export function formatCount(n: number): string {
    if (!Number.isFinite(n) || n <= 0) return '0'
    if (n < 1000) return String(n)
    if (n < 1_000_000) {
        const v = n / 1000
        return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`
    }
    const v = n / 1_000_000
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`
}
