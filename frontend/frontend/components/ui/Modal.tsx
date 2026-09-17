'use client'
import { useEffect, useRef } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
    const ref = useRef<HTMLDialogElement | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        if (open && !el.open) el.showModal()
        if (!open && el.open) el.close()
    }, [open])

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const handler = () => onClose()
        el.addEventListener('close', handler)
        return () => el.removeEventListener('close', handler)
    }, [onClose])

    return (
        <dialog
            ref={ref}
            aria-labelledby="modal-title"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-[var(--color-foreground)] backdrop:bg-black/70"
        >
            <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
            <div className="mt-4">{children}</div>
        </dialog>
    )
}
