export function formatError(e: unknown) {
    if (e instanceof Error) return e.message 
    if (typeof e === 'string') return e
    return 'Error inesperado'
}

