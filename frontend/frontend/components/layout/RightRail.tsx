import { SearchBox } from '@/components/search/SearchBox'
import { WhoToFollow } from '@/components/user/WhoToFollow'
import { TrendingPanel } from '@/components/search/TrendingPanel'

export function RightRail() {
    return (
        <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 overflow-y-auto px-6 py-3 lg:flex">
            <SearchBox />
            <WhoToFollow />
            <TrendingPanel />
            <p className="px-2 text-xs text-[var(--color-muted)]">
                © {new Date().getFullYear()} XClone — Clon educativo de la interfaz de X.
            </p>
        </aside>
    )
}
