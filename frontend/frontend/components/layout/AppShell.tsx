import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto flex min-h-screen max-w-7xl">
            <Sidebar />
            <main className="min-w-0 flex-1 border-r border-[var(--color-border)]">{children}</main>
            <aside className="hidden w-80 px-6 py-8 lg:block">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-center text-sm text-[var(--color-muted)]">
                    Quién seguir
                    <p className="mt-1">Próximamente</p>
                </div>
            </aside>
        </div>
    )
}
