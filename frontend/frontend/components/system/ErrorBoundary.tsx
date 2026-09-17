'use client'
import { Component, type ReactNode } from 'react'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Button } from '@/components/ui/Button'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
    state: State = { error: null }

    static getDerivedStateFromError(error: Error): State {
        return { error }
    }

    componentDidCatch(error: Error) {
        console.error('[ErrorBoundary]', error)
    }

    reset = () => this.setState({ error: null })

    render() {
        if (!this.state.error) return this.props.children
        return (
            <div
                role="alert"
                className="flex min-h-screen flex-col items-center justify-center gap-4 p-6"
            >
                <ErrorMessage message={this.state.error.message || 'Algo salió mal'} />
                <Button variant="secondary" onClick={this.reset}>
                    Reintentar
                </Button>
            </div>
        )
    }
}
