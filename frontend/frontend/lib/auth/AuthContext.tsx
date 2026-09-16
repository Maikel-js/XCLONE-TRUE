'use client'
import { createContext, useCallback, useEffect, useMemo, useState } from "react"

import { getToken, setToken, clearToken } from "../api/client"

type AuthState = {
    token: string | null
    userId: string | null
    username: string | null
}

type AuthContextValue = AuthState & {
    login: (token: string, payload? : { userId?: string; username?: string}) => void
    register: (token: string, payload? : { userId?: string; username?: string}) => void
    logout: () => void
    isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

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
        const token = getToken()
        if (!token) return { token: null, userId: null, username: null}
        const payload = decodeJwt(token)
        return {
            token, 
            userId: payload?.userId ?? payload?.sub ?? null,
            username: payload?.username ?? null,
        }
    })

    useEffect(() => {
        const onLogout = () => setState({ token: null, userId: null, username: null })
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
                setState({ token: null, userId: null, username: null})
            },
        }),
        [state, applyToken]
    )

    return <AuthContext.Provider value = {value}> {children}</AuthContext.Provider>
}