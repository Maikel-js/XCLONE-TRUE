'use client'

import { useEffect, useState } from 'react'
import { CalendarClock, CalendarDays, Clock3, X } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

type Props = {
    open: boolean
    onClose: () => void
    onConfirm: (date: Date) => void
    date: string
    time: string
    minDate: string
    onDateChange: (date: string) => void
    onTimeChange: (time: string) => void
}

function getTimeZoneName(date: Date) {
    const parts = new Intl.DateTimeFormat(undefined, {
        timeZoneName: 'long',
    }).formatToParts(date)

    return parts.find((part) => part.type === 'timeZoneName')?.value
        ?? Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function SchedulePostModal({
    open,
    onClose,
    onConfirm,
    date,
    time,
    minDate,
    onDateChange,
    onTimeChange,
}: Props) {
    const [now, setNow] = useState(0)

    useEffect(() => {
        if (!open) return

        const interval = window.setInterval(() => {
            setNow(Date.now())
        }, 30_000)

        return () => window.clearInterval(interval)
    }, [open])

    const scheduledDate = date && time ? new Date(`${date}T${time}`) : null
    const isValidDate =
        scheduledDate !== null &&
        !Number.isNaN(scheduledDate.getTime()) &&
        scheduledDate.getTime() > now

    const formattedDate = scheduledDate && isValidDate
        ? new Intl.DateTimeFormat(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          }).format(scheduledDate)
        : null

    function handleConfirm() {
        const currentTime = Date.now()
        setNow(currentTime)

        if (!scheduledDate || scheduledDate.getTime() <= currentTime) return
        onConfirm(scheduledDate)
    }

    return (
        <Modal
            ariaLabelledBy="schedule-modal-title"
            open={open}
            onClose={onClose}
            className="w-[calc(100vw-2rem)] max-w-[42rem] max-h-[calc(100dvh-2rem)] overflow-y-auto p-0"
        >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Close schedule"
                        onClick={onClose}
                        className="rounded-full p-2 transition hover:bg-[var(--hover)]"
                    >
                        <X size={20} aria-hidden="true" />
                    </button>
                    <h2 id="schedule-modal-title" className="text-xl font-bold">
                        Schedule
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!isValidDate}
                    className="rounded-full bg-[var(--color-foreground)] px-5 py-2 font-bold text-[var(--color-background)] transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Confirm
                </button>
            </div>

            <div className="space-y-6 px-5 py-5">
                <div className="flex items-center gap-3 text-sm text-[var(--color-muted)]">
                    <CalendarClock size={20} aria-hidden="true" />
                    <p>
                        {formattedDate
                            ? `Will send on ${formattedDate}`
                            : 'Choose a future date and time'}
                    </p>
                </div>

                <section>
                    <h3 className="mb-2 text-sm text-[var(--color-muted)]">Date</h3>
                    <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
                        <CalendarDays
                            size={20}
                            className="shrink-0 text-[var(--color-muted)]"
                            aria-hidden="true"
                        />
                        <input
                            aria-label="Schedule date"
                            type="date"
                            min={minDate}
                            value={date}
                            onChange={(event) => {
                                onDateChange(event.target.value)
                                setNow(Date.now())
                            }}
                            className="min-w-0 flex-1 bg-transparent text-[var(--color-foreground)] outline-none"
                        />
                    </label>
                </section>

                <section>
                    <h3 className="mb-2 text-sm text-[var(--color-muted)]">Time</h3>
                    <label className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] px-4 py-3">
                        <Clock3
                            size={20}
                            className="shrink-0 text-[var(--color-muted)]"
                            aria-hidden="true"
                        />
                        <input
                            aria-label="Schedule time"
                            type="time"
                            value={time}
                            onChange={(event) => {
                                onTimeChange(event.target.value)
                                setNow(Date.now())
                            }}
                            className="min-w-0 flex-1 bg-transparent text-[var(--color-foreground)] outline-none"
                        />
                    </label>
                </section>

                <section>
                    <h3 className="text-sm text-[var(--color-muted)]">Time zone</h3>
                    <p className="mt-1 text-lg">
                        {scheduledDate
                            ? `${getTimeZoneName(scheduledDate)} (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
                            : Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                </section>

                {date && time && !isValidDate && (
                    <p role="alert" className="text-sm text-[var(--color-danger)]">
                        Choose a date and time in the future.
                    </p>
                )}
            </div>
        </Modal>
    )
}
