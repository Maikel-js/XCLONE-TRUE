const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const

export function timeAgo(iso: string): string {
    const date = new Date(iso)
    const diff = Date.now() - date.getTime()
    const sec = Math.floor(diff / 1000)
    if (sec < 60) return `${sec}s` 
    const min = Math.floor(sec / 60)
    if(min <60) return `${min} min`
    const h = Math.floor(min / 60)
    if(h < 24) return `${h} h`
    const d = Math.floor(h / 24)
    if( d === 1) return 'ayer'
    if(d < 7) return `${d} d`
    return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}
