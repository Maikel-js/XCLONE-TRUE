import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
            <EmptyState title="404" description="Esta página no existe" />
            <Link href="/">
                <Button variant="secondary">Volver al inicio</Button>
            </Link>
        </div>
    )
}
