'use client'

import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { toast } from 'sonner'
import { ChevronDown, Ghost, History, Maximize, Paperclip, Zap } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { GrokMark } from '@/components/brand/GrokMark'

const stars = [
    [8, 21, 3], [18, 17, 5], [34, 45, 2], [52, 12, 4], [72, 9, 3], [91, 12, 4],
    [10, 47, 5], [21, 58, 6], [37, 69, 3], [64, 67, 5], [74, 43, 2], [92, 36, 5],
    [15, 92, 5], [32, 84, 3], [48, 91, 4], [59, 78, 2], [81, 87, 4], [97, 66, 3],
    [4, 75, 2], [28, 33, 3], [55, 29, 2], [84, 57, 3], [43, 24, 2], [68, 31, 2],
]

const modes = ['Fast', 'Expert'] as const

export default function GrokPage() {
    const [draft, setDraft] = useState('')
    const [historyItems, setHistoryItems] = useState<string[]>([])
    const [historyOpen, setHistoryOpen] = useState(false)
    const [isPrivate, setIsPrivate] = useState(false)
    const [mode, setMode] = useState<(typeof modes)[number]>('Fast')
    const [modeOpen, setModeOpen] = useState(false)
    const [voiceActive, setVoiceActive] = useState(false)
    const [attachment, setAttachment] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function submitPrompt(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const prompt = draft.trim()
        if (!prompt && !attachment) return

        if (prompt && !isPrivate) {
            setHistoryItems((current) => [prompt, ...current].slice(0, 8))
        }

        toast.info('La interfaz está lista. La respuesta estará disponible al conectar la API.')
    }

    function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
        }
    }

    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen()
            else await document.documentElement.requestFullscreen()
        } catch {
            toast.error('El navegador no permite pantalla completa.')
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-black text-[#e7e9ea]">
            <Sidebar />

            <main className="grok-space relative min-h-screen min-w-0 flex-1 overflow-hidden pb-16 md:pb-0">
                <main className="grok-space relative min-h-screen overflow-hidden bg-black text-[#e7e9ea]">
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                        {stars.map(([left, top, size], index) => (
                            <span
                                key={`${left}-${top}`}
                                className="grok-star absolute rounded-full bg-white"
                                style={{
                                    left: `${left}%`,
                                    top: `${top}%`,
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    animationDelay: `${(index % 7) * 0.45}s`,
                                }}
                            />
                        ))}
                    </div>

                    <header className="relative z-10 flex h-[84px] items-center justify-between px-5 md:px-8">
                        <button
                            type="button"
                            aria-label="Toggle fullscreen"
                            title="Toggle fullscreen"
                            onClick={toggleFullscreen}
                            className="rounded-lg p-2 text-[#e7e9ea] transition hover:bg-white/10"
                        >
                            <Maximize size={23} strokeWidth={2.5} aria-hidden="true" />
                        </button>

                        <div className="flex items-center gap-3 md:gap-8">
                            <div className="relative">
                                <button
                                    type="button"
                                    aria-expanded={historyOpen}
                                    onClick={() => setHistoryOpen((open) => !open)}
                                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-[15px] font-semibold transition hover:bg-white/10 md:text-[18px]"
                                >
                                    <History size={23} strokeWidth={2.5} aria-hidden="true" />
                                    <span>History</span>
                                </button>
                                {historyOpen && (
                                    <div className="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-[#303236] bg-[#111214] shadow-2xl">
                                        <div className="flex items-center justify-between border-b border-[#303236] px-4 py-3">
                                            <h2 className="font-semibold">Recent prompts</h2>
                                            {historyItems.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setHistoryItems([])}
                                                    className="text-sm text-[#a7a9ad] hover:text-white"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        {historyItems.length ? (
                                            <ul className="max-h-72 overflow-y-auto">
                                                {historyItems.map((item, index) => (
                                                    <li key={`${index}-${item}`}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setDraft(item)
                                                                setHistoryOpen(false)
                                                            }}
                                                            className="w-full truncate px-4 py-3 text-left text-sm text-[#c4c5c8] hover:bg-white/5"
                                                        >
                                                            {item}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="px-4 py-5 text-sm text-[#777a80]">Your chats will appear here.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                aria-pressed={isPrivate}
                                onClick={() => setIsPrivate((privateMode) => !privateMode)}
                                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-[15px] font-semibold transition hover:bg-white/10 md:text-[18px] ${isPrivate ? 'text-white' : 'text-[#e7e9ea]'}`}
                            >
                                <Ghost size={23} strokeWidth={2.5} aria-hidden="true" />
                                <span>{isPrivate ? 'Private on' : 'Private'}</span>
                            </button>
                        </div>
                    </header>

                    <section className="relative z-10 flex min-h-[calc(100svh-84px)] items-center justify-center px-4 pb-8 pt-4 sm:px-6">
                        <div className="w-full max-w-[1000px] translate-y-8 sm:translate-y-14">
                            <div className="mb-7 flex items-center justify-center gap-3">
                                <GrokMark className="h-12 w-12 sm:h-[54px] sm:w-[54px]" />
                                <span className="text-[40px] font-medium leading-none tracking-[-0.055em] sm:text-[44px]">Grok</span>
                            </div>

                            <form
                                onSubmit={submitPrompt}
                                className="flex min-h-[78px] items-center gap-3 rounded-full bg-[#1c1d20] px-4 py-3 sm:h-[88px] sm:px-7"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="sr-only"
                                    onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
                                    aria-label="Attach a file"
                                />
                                <button
                                    type="button"
                                    aria-label="Attach file"
                                    title="Attach file"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="shrink-0 rounded-full p-1 text-[#b7b9bd] transition hover:text-white"
                                >
                                    <Paperclip size={24} aria-hidden="true" />
                                </button>

                                <textarea
                                    value={draft}
                                    onChange={(event) => setDraft(event.target.value)}
                                    onKeyDown={handlePromptKeyDown}
                                    rows={1}
                                    placeholder="Ask anything"
                                    aria-label="Ask Grok anything"
                                    className="max-h-24 min-h-8 min-w-0 flex-1 resize-none bg-transparent text-[18px] leading-8 text-[#e7e9ea] outline-none placeholder:text-[#77797e] sm:text-[20px]"
                                />

                                <div className="relative shrink-0">
                                    <button
                                        type="button"
                                        aria-expanded={modeOpen}
                                        onClick={() => setModeOpen((open) => !open)}
                                        className="flex items-center gap-2 rounded-full px-1 py-2 text-[16px] font-semibold transition hover:bg-white/5 sm:px-2 sm:text-[18px]"
                                    >
                                        <Zap size={22} fill="currentColor" aria-hidden="true" />
                                        <span>{mode}</span>
                                        <ChevronDown size={19} aria-hidden="true" />
                                    </button>
                                    {modeOpen && (
                                        <div className="absolute bottom-14 right-0 z-30 min-w-32 overflow-hidden rounded-xl border border-[#35363a] bg-[#1c1d20] p-1 shadow-xl">
                                            {modes.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        setMode(option)
                                                        setModeOpen(false)
                                                    }}
                                                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/10 ${option === mode ? 'text-white' : 'text-[#a7a9ad]'}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    aria-label={voiceActive ? 'Stop voice input' : 'Start voice input'}
                                    aria-pressed={voiceActive}
                                    title="Voice input"
                                    onClick={() => {
                                        setVoiceActive((active) => !active)
                                        toast.info('Voice input will be available when connected.')
                                    }}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center gap-[3px] rounded-full bg-[#eef0f2] text-[#111214] transition hover:bg-white sm:h-[46px] sm:w-[46px]"
                                >
                                    {[10, 19, 25, 16, 22, 12].map((height, index) => (
                                        <span
                                            key={index}
                                            className={`w-[3px] rounded-full ${voiceActive ? 'animate-pulse' : ''}`}
                                            style={{ height: `${height}px`, animationDelay: `${index * 80}ms`, background: 'currentColor' }}
                                        />
                                    ))}
                                </button>
                                <button type="submit" className="sr-only">Send prompt</button>
                            </form>

                            {attachment && (
                                <div className="mx-6 mt-2 flex items-center justify-between text-sm text-[#a7a9ad]">
                                    <span className="truncate">Attached: {attachment.name}</span>
                                    <button type="button" onClick={() => setAttachment(null)} className="ml-3 hover:text-white">
                                        Remove
                                    </button>
                                </div>
                            )}

                            <section className="mt-5 flex min-h-[116px] items-center gap-5 rounded-[24px] border border-[#303236] px-5 py-4 sm:gap-12 sm:px-12">
                                <BotMark />
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-[19px] font-bold leading-tight sm:text-[22px]">Meet Grok Bot</h2>
                                    <p className="mt-1 text-[15px] leading-[1.35] text-[#777a80] sm:text-[18px]">
                                        AI teammates you can give real work to. Bots sign in to your tools, use them just like you do, and come back with finished work.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toast.info('Grok Bot details will be available soon.')}
                                    className="hidden shrink-0 rounded-full bg-[#f4f5f6] px-6 py-3 text-[17px] font-bold text-black transition hover:bg-white sm:block sm:px-7 sm:text-[18px]"
                                >
                                    Learn more
                                </button>
                            </section>
                        </div>
                    </section>
                </main>
            </main>

            <MobileNav />
        </div>

    )
}

function BotMark() {
    return (
        <span className="flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full bg-[#f4f5f6] text-black sm:h-[54px] sm:w-[54px]">
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
                <path d="M7 15 12 9M18 8l5 17" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
        </span>
    )
}
