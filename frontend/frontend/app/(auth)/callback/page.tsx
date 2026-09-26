'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/useAuth'

export default function OAuthCallbackPage() {
    const router = useRouter()
    const { login } = useAuth()
    const callbackHandled = useRef(false)

    useEffect(() => {
        if (callbackHandled.current) return
        callbackHandled.current = true

        const token = new URLSearchParams(window.location.hash.slice(1)).get('token')
        if (!token) {
            toast.error('No se pudo completar el inicio de sesión.')
            router.replace('/login')
            return
        }

        login(token)
        window.history.replaceState({}, '', window.location.pathname)
        router.replace('/')
    }, [login, router])

    return (
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
            <p className="text-sm text-[#71767b]">Completando inicio de sesión…</p>
        </main>
    )
}
