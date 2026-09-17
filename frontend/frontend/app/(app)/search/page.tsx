import { Header } from '@/components/layout/Header'
import { EmptyState } from '@/components/ui/EmptyState'

export default function SearchPage() {
    return (
        <>
            <Header title="Buscar" />
            <EmptyState
                title="Buscar usuarios"
                description="Próximamente: requiere GET /users?q= en el backend"
            />
        </>
    )
}
