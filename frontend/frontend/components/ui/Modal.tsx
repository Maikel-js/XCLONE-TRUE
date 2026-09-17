'use client'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    hideClose?: boolean
    className?: string
    children: React.ReactNode
}

export function Modal({ open, onClose, title, hideClose, className, children }: ModalProps) {
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
            aria-labelledby={title ? 'modal-title' : undefined}
            className={clsx(
                'rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] backdrop:bg-black/70',
                className ?? 'p-6 max-w-lg w-full'
            )}
        >
            {title && !hideClose && (
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="modal-title" className="text-lg font-bold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="rounded-full p-2 hover:bg-[var(--hover-strong)]"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
            )}
            {children}
        </dialog>
    )
}
