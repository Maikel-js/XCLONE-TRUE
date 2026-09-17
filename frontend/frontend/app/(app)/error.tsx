'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

type Props = { error: Error & { digest?: string }; reset: () => void }

export default function ErrorPage({ error, reset }: Props) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="space-y-3 p-6">
            <ErrorMessage message={error.message || 'Algo salió mal'} />
            <Button variant="secondary" onClick={() => reset()}>
                Reintentar
            </Button>
        </div>
    )
}
