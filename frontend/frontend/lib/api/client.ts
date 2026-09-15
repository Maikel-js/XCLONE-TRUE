const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

const TOKEN_KEY = 'xclone.token'

export class ApiError extends Error{
    status: number
    constructor(status: number, message: string){
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

export function getToken(): string | null {
    if(typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
    if(typeof window === 'undefined') return 
    window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
    if (typeof window === 'undefined') return 
    window.localStorage.removeItem(TOKEN_KEY)
}

type ApiFetchInit = Omit<RequestInit, 'body'> & {
    body?: unknown
}

export async function apiFetch<T>(path:string, init: ApiFetchInit = {}): Promise<T>{
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`
    const headers = new Headers(init.headers)

    if (!headers.has('Content-Type') && init.body !== undefined) {
        headers.set('Content-Type', 'application/json')
    }

    const token = getToken()
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    let res: Response

    try{
        res = await fetch(url, {
            ...init,
            headers,
            body: init.body === undefined ? undefined : JSON.stringify(init.body),
            cache: 'no-store'
        })
    }catch(e){
        throw new ApiError(0, e instanceof Error ? e.message : 'Error de red')
    }

    if (res.status === 401) {
        clearToken()
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'))
        }
    }

    if (!res.ok) {
        let message = `Error ${res.status}`
        try {
            const data = await res.json()
                if (typeof data?.error === 'string') message = data.error
        }catch{}
        throw new ApiError(res.status, message)
    }

    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
}