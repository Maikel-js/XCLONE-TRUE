'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const stories = [
    {
        title: 'Memes Highlight Vibe Coding vs Traditional Engineering Divide',
        age: '16 hours ago',
        category: 'Other',
        posts: '1,290 posts',
        people: ['M', 'V', 'J'],
    },
    {
        title: 'Claude Code Adds Graceful Wrap-Up at Usage Limits',
        age: '15 hours ago',
        category: 'Other',
        posts: '3,645 posts',
        people: ['C', 'A', 'S'],
    },
    {
        title: 'Open source AI tools keep changing the way developers work',
        age: '12 hours ago',
        category: 'Technology',
        posts: '2,018 posts',
        people: ['O', 'D', 'K'],
    },
]

const avatarColors = [
    'bg-[#d3dedf] text-[#253138]',
    'bg-[#96cdb6] text-[#193b32]',
    'bg-[#d4b2a2] text-[#402b26]',
]

export function TodayNews() {
    const [visible, setVisible] = useState(true)

    if (!visible) return null

    return (
        <section className="overflow-hidden rounded-[18px] border border-[var(--color-border)]">
            <header className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[23px] font-bold leading-tight 2xl:text-[28px]">Today’s News</h2>
                <button
                    type="button"
                    aria-label="Dismiss news"
                    onClick={() => setVisible(false)}
                    className="rounded-full p-1 text-[var(--color-foreground)] hover:bg-[var(--hover-strong)]"
                >
                    <X size={23} aria-hidden="true" />
                </button>
            </header>
            <ul>
                {stories.map((story) => (
                    <li key={story.title} className="px-5 py-5 transition hover:bg-[var(--hover)]">
                        <article>
                            <h3 className="text-[18px] font-bold leading-[1.35] 2xl:text-[21px]">{story.title}</h3>
                            <div className="mt-2 flex items-center gap-2 text-[14px] text-[var(--color-muted)] 2xl:text-[17px]">
                                <span className="flex shrink-0 items-center pl-0.5" aria-hidden="true">
                                    {story.people.map((person, index) => (
                                        <span
                                            key={person}
                                            className={`-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black text-[9px] font-bold first:ml-0 ${avatarColors[index]}`}
                                        >
                                            {person}
                                        </span>
                                    ))}
                                </span>
                                <span className="truncate">
                                    {story.age} · {story.category} · {story.posts}
                                </span>
                            </div>
                        </article>
                    </li>
                ))}
            </ul>
        </section>
    )
}
