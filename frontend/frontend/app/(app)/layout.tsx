'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { Spinner } from '@/components/ui/Spinner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isBootstrapping } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isBootstrapping && !isAuthenticated) router.replace('/login')
    }, [isAuthenticated, isBootstrapping, router])

    if (isBootstrapping) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner label="Verificando sesión" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    return <AppShell>{children}</AppShell>
}
