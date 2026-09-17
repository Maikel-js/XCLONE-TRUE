'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { RealtimeProvider } from '@/lib/realtime/RealtimeProvider'
import { ErrorBoundary } from '@/components/system/ErrorBoundary'

export function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        retry: 1,
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    return (
        <ErrorBoundary>
            <QueryClientProvider client={client}>
                <AuthProvider>
                    <RealtimeProvider>
                        {children}
                        <Toaster richColors position="bottom-right" />
                    </RealtimeProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}
