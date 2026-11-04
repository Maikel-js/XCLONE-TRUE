import { SearchBox } from '@/components/search/SearchBox'
import { PremiumCard } from '@/components/sidebar/PremiumCard'
import { TodayNews } from '@/components/sidebar/TodayNews'
import { TrendingPanel } from '@/components/search/TrendingPanel'

export function RightRail() {
    return (
        <aside className="sticky top-0 hidden h-screen min-w-0 flex-col gap-4 overflow-y-auto py-3 pl-8 pr-4 xl:flex">
            <div className="flex w-full max-w-[380px] flex-col gap-4">
                <SearchBox />
                <PremiumCard />
                <TodayNews />
                <TrendingPanel />
            </div>
        </aside>
    )
}
