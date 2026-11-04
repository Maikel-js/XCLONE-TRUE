'use client'

import clsx from 'clsx'
import { Modal } from '@/components/ui/Modal'

export type ContentDisclosureState = {
    paidPartnership: boolean
    madeWithAI: boolean
}

type Props = {
    open: boolean
    value: ContentDisclosureState
    onToggle: (field: keyof ContentDisclosureState)
        => void
    onDone: () => void
}

export function ContentDisclosureModal({ open,
    value, onToggle, onDone }: Props) {
    return (
        <Modal
            open={open}
            onClose={onDone}
            hideClose
            className="w-full max-w-xl overflow-hidden rounded-2xl p-0"
        >
            <div className="relative border-b
 border-[var(--color-border)] px-4 py-4">
                <h2 className="text-center text-2xl
 font-bold">Content disclosure</h2>
                <button
                    type="button"
                    onClick={onDone}
                    className="absolute right-4
 top-4 text-sm font-semibold
 text-[var(--color-accent)]"
                >
                    Done
                </button>
            </div>

            <div>
                <DisclosureToggle
                    title="Paid partnership"
                    description="Let others know
 this post promotes a brand or business."
                    checked={value.paidPartnership}
                    onToggle={() =>
                        onToggle('paidPartnership')}
                />
                <DisclosureToggle
                    title="Made with AI"
                    description="Mark this post as
 containing synthetically generated content."
                    checked={value.madeWithAI}
                    onToggle={() =>
                        onToggle('madeWithAI')}
                />
            </div>
        </Modal>
    )
}

function DisclosureToggle({
    title,
    description,
    checked,
    onToggle,
}: {
    title: string
    description: string
    checked: boolean
    onToggle: () => void
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onToggle}
            className="flex w-full items-start
 justify-between gap-6 border-b
 border-[var(--color-border)] px-6 py-4 text-left
 last:border-b-0 hover:bg-[var(--hover)]"
        >
            <span>
                <span className="block text-lg
 font-semibold">{title}</span>
                <span className="mt-1 block text-sm
 leading-snug text-[var(--color-muted)]">
                    {description}
                </span>
            </span>

            <span
                aria-hidden="true"
                className={clsx(
                    'relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors',
                    checked ?
                        'bg-[var(--color-accent)]' :
                        'bg-[var(--color-muted)]/40'
                )}
            >
                <span
                    className={clsx(
                        'absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform',
                        checked ? 'left-0.5 translate-x-5' : 'left-0.5'
                    )}
                />
            </span>
        </button>
    )
}