'use client'
import { useEffect, useRef, useState } from 'react'

type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'closed'

type UseWebSocketOptions = {
    url: string | null
    onMessage?: (data: { type: string; payload: unknown; ts?: string }) => void
    onStatusChange?: (status: ConnectionStatus) => void
    heartbeatIntervalMs?: number
    maxBackoffMs?: number
}

const DEFAULT_HEARTBEAT = 25_000
const DEFAULT_MAX_BACKOFF = 30_000

export function useWebSocket({
    url,
    onMessage,
    onStatusChange,
    heartbeatIntervalMs = DEFAULT_HEARTBEAT,
    maxBackoffMs = DEFAULT_MAX_BACKOFF,
}: UseWebSocketOptions) {
    const [status, setStatus] = useState<ConnectionStatus>('idle')
    const wsRef = useRef<WebSocket | null>(null)
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const attemptsRef = useRef(0)
    const onMessageRef = useRef(onMessage)
    const onStatusRef = useRef(onStatusChange)

    useEffect(() => {
        onMessageRef.current = onMessage
        onStatusRef.current = onStatusChange
    }, [onMessage, onStatusChange])

    useEffect(() => {
        if (!url) return

        let cancelled = false
        const updateStatus = (s: ConnectionStatus) => {
            if (cancelled) return
            setStatus(s)
            onStatusRef.current?.(s)
        }

        function cleanup() {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current)
                heartbeatRef.current = null
            }
            if (wsRef.current) {
                wsRef.current.onopen = null
                wsRef.current.onmessage = null
                wsRef.current.onclose = null
                wsRef.current.onerror = null
                try { wsRef.current.close() } catch {}
                wsRef.current = null
            }
        }

        function scheduleReconnect() {
            if (cancelled) return
            const backoff = Math.min(
                maxBackoffMs,
                1000 * Math.pow(2, attemptsRef.current)
            )
            attemptsRef.current += 1
            reconnectRef.current = setTimeout(connect, backoff)
        }

        function connect() {
            if (cancelled || !url) return
            cleanup()
            updateStatus('connecting')
            const ws = new WebSocket(url)
            wsRef.current = ws

            ws.onopen = () => {
                if (cancelled) return
                attemptsRef.current = 0
                updateStatus('open')
                heartbeatRef.current = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'ping' }))
                    }
                }, heartbeatIntervalMs)
            }

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    onMessageRef.current?.(data)
                } catch {
                    // ignore malformed payloads
                }
            }

            ws.onclose = () => {
                if (cancelled) return
                cleanup()
                updateStatus('closed')
                scheduleReconnect()
            }

            ws.onerror = () => {
                // close will follow
            }
        }

        connect()

        return () => {
            cancelled = true
            if (reconnectRef.current) clearTimeout(reconnectRef.current)
            cleanup()
            updateStatus('closed')
        }
    }, [url, heartbeatIntervalMs, maxBackoffMs])

    return { status }
}
