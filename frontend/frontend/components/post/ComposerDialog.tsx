'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { ComposerForm } from './ComposerForm'

type Props = {
    trigger?: React.ReactNode
    compactTrigger?: React.ReactNode
    open?: boolean
    onClose?: () => void
}

export function ComposerDialog({ trigger, compactTrigger, open: controlledOpen, onClose }: Props) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = (v: boolean) => {
        if (!isControlled) setUncontrolledOpen(v)
        if (!v) onClose?.()
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Crear post"
                className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 text-lg font-bold text-white transition hover:bg-[var(--color-accent-hover)] md:h-14"
            >
                {trigger ?? (
                    <>
                        <Plus size={20} aria-hidden="true" />
                        <span className="hidden lg:inline">Post</span>
                        {compactTrigger}
                    </>
                )}
            </button>
            <Modal open={open} onClose={() => setOpen(false)} className="max-w-xl w-full p-0">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                    <h2 className="text-base font-bold">Crear post</h2>
                </div>
                <ComposerForm autoFocus onDone={() => setOpen(false)} />
            </Modal>
        </>
    )
}
