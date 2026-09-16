'use client'
import { Button } from './Button'

type ConfirmDialogProps = {
    open: boolean
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!open) return null
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
            <div className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
                <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
                {description && <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>}
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
                    <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
                </div>
            </div>
        </div>
    )
}
