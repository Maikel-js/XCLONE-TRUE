import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotificationsPage() {
    return (
        <>
            <Header title="Notificaciones" />
            <EmptyState
                title="Pronto verás tus notificaciones aquí"
                description="Likes, respuestas, reposts y nuevos seguidores aparecerán en tiempo real."
            />
        </>
    )
}
