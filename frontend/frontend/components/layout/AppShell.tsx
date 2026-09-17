'use client'
import { Sidebar } from './Sidebar'
import { RightRail } from './RightRail'
import { MobileNav } from './MobileNav'
import { MobileHeader } from './MobileHeader'

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto flex min-h-screen w-full max-w-[1280px] justify-center gap-0 px-0 md:px-4">
            <Sidebar />
            <div className="flex min-h-screen w-full max-w-[640px] shrink-0 grow flex-col border-r border-[var(--color-border)] pb-16 md:pb-0">
                <MobileHeader />
                {children}
            </div>
            <RightRail />
            <MobileNav />
        </div>
    )
}
