'use client'
import { Sidebar } from './Sidebar'
import { RightRail } from './RightRail'
import { MobileNav } from './MobileNav'
import { MobileHeader } from './MobileHeader'
import { FloatingControls } from './FloatingControls'

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto grid min-h-screen w-full max-w-[2048px] grid-cols-1 justify-center gap-0 md:grid-cols-[minmax(256px,27fr)_minmax(0,73fr)] xl:grid-cols-[minmax(300px,27fr)_minmax(480px,38fr)_minmax(360px,35fr)]">
            <Sidebar />
            <main className="flex min-h-screen min-w-0 flex-col border-r border-[var(--color-border)] pb-16 md:pb-0">
                <MobileHeader />
                {children}
            </main>
            <RightRail />
            <MobileNav />
            <FloatingControls />
        </div>
    )
}
