'use client'
import { Sidebar } from './Sidebar'
import { RightRail } from './RightRail'
import { MobileNav } from './MobileNav'
import { MobileHeader } from './MobileHeader'
import { FloatingControls } from './FloatingControls'

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] justify-center gap-0 px-0 md:px-2 xl:px-0">
            <Sidebar />
            <main className="flex min-h-screen w-full min-w-0 max-w-[640px] shrink grow flex-col border-r border-[var(--color-border)] pb-16 md:pb-0">
                <MobileHeader />
                {children}
            </main>
            <RightRail />
            <MobileNav />
            <FloatingControls />
        </div>
    )
}
