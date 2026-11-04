'use client'
import { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    ariaLabelledBy?: string
    hideClose?: boolean
    className?: string
    children: React.ReactNode
}

export function Modal({ open, onClose, title, ariaLabelledBy, hideClose, className, children }: ModalProps) {
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
            aria-labelledby={ariaLabelledBy ?? (title ? 'modal-title' : undefined)}
            className={clsx(
                'fixed left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] backdrop:bg-black/70',
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
