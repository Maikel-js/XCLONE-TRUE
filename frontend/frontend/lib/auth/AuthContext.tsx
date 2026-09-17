'use client'
import { createContext, useCallback, useEffect, useMemo, useState } from "react"

import { getToken, setToken, clearToken } from "../api/client"
import { authApi } from "../api/endpoints"

type AuthState = {
    token: string | null
    userId: string | null
    username: string | null
    isBootstrapping: boolean
}

type AuthContextValue = AuthState & {
    login: (token: string, payload? : { userId?: string; username?: string}) => void
    register: (token: string, payload? : { userId?: string; username?: string}) => void
    logout: () => void
    isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const UNAUTHENTICATED: AuthState = {
    token: null,
    userId: null,
    username: null,
    isBootstrapping: false,
}

const INITIAL_STATE: AuthState = {
    token: null,
    userId: null,
    username: null,
    isBootstrapping: true,
}

function decodeJwt(token: string): { sub?: string; userId?: string; username?: string } | null {
    try {
        const part = token.split('.')[1]
        if (!part) return null
        const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(json)
    }catch{
        return null
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        if (typeof window === 'undefined') return INITIAL_STATE
        const token = getToken()
        if (!token) return UNAUTHENTICATED
        const payload = decodeJwt(token)
        return {
            token,
            userId: payload?.userId ?? payload?.sub ?? null,
            username: payload?.username ?? null,
            isBootstrapping: true,
        }
    })

    useEffect(() => {
        const token = getToken()
        if (!token) {
            return
        }

        let cancelled = false
        authApi
            .validate()
            .then((user) => {
                if (cancelled) return
                const payload = decodeJwt(token)
                setState({
                    token,
                    userId: user?.id ?? payload?.userId ?? payload?.sub ?? null,
                    username: user?.username ?? payload?.username ?? null,
                    isBootstrapping: false,
                })
            })
            .catch(() => {
                if (cancelled) return
                clearToken()
                setState(UNAUTHENTICATED)
            })
        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        const onLogout = () => setState(UNAUTHENTICATED)
        window.addEventListener('auth:logout', onLogout)
        return () => window.removeEventListener('auth:logout', onLogout)
    }, [])

    const applyToken = useCallback(
        (token: string, payload?: { userId?: string; username?: string}) => {
            setToken(token)
            const decoded = decodeJwt(token)
            setState({
                token,
                userId: payload?.userId ?? decoded?.userId ?? decoded?.sub ?? null,
                username: payload?.username ?? decoded?.username ?? null,
                isBootstrapping: false,
            })
        },
        []
    )

    const value = useMemo<AuthContextValue>(
        () => ({
            ...state,
            isAuthenticated: !!state.token,
            login: applyToken,
            register: applyToken,
            logout: () => {
                clearToken()
                setState(UNAUTHENTICATED)
            },
        }),
        [state, applyToken]
    )

    return <AuthContext.Provider value = {value}> {children}</AuthContext.Provider>
}
