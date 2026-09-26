'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/useAuth'
import { authApi } from '@/lib/api/endpoints'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

function GoogleMark() {
    return (
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-6 w-6">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
            <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
            <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
        </svg>
    )
}

function MicrosoftMark() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path fill="#f25022" d="M1 1h10v10H1z" />
            <path fill="#7fba00" d="M13 1h10v10H13z" />
            <path fill="#00a4ef" d="M1 13h10v10H1z" />
            <path fill="#ffb900" d="M13 13h10v10H13z" />
        </svg>
    )
}

function XArtwork() {
    return (
        <svg aria-hidden="true" viewBox="0 0 800 800" fill="none" className="h-full w-full">
            <path d="M82 64h197l157 223L631 64h83L474 355l239 381H516L344 486 171 736H88l216-291L82 64Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M158 113h95l391 574h-95L158 113Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
        </svg>
    )
}

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [appUrl, setAppUrl] = useState('')
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [loginStep, setLoginStep] = useState<'identifier' | 'password'>('identifier')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => setAppUrl(window.location.origin))
        return () => window.cancelAnimationFrame(frame)
    }, [])

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const oauthError = params.get('oauthError')
        if (!oauthError) return
        const messages: Record<string, string> = {
            account_exists: 'Ya existe una cuenta con ese correo. Inicia sesión con tu contraseña.',
            configuration: 'El inicio de sesión social todavía no está configurado.',
            cancelled: 'Se canceló el inicio de sesión.',
            provider_rejected: 'El proveedor rechazó la autenticación. Comprueba el secreto y la URL de callback registrados.',
            email_unverified: 'El correo de esta cuenta de Google no está verificado.',
            email_missing: 'El proveedor no compartió un correo válido para esta cuenta.',
            failed: 'No se pudo completar el inicio de sesión. Inténtalo de nuevo.',
        }
        toast.error(messages[oauthError] || messages.failed)
        window.history.replaceState({}, '', window.location.pathname)
    }, [])

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (loginStep === 'identifier') {
            const value = identifier.trim()
            if (!value) {
                toast.error('Introduce tu email o username')
                return
            }
            setIdentifier(value)
            setLoginStep('password')
            return
        }

        if (!password) {
            toast.error('Introduce tu contraseña')
            return
        }

        setIsSubmitting(true)
        try {
            const { token } = await authApi.login({ identifier: identifier.trim(), password })
            login(token)
            toast.success('Sesión iniciada')
            router.push('/')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="grid min-h-screen overflow-hidden bg-black text-white lg:grid-cols-[minmax(560px,0.92fr)_1.08fr]">
            <section className="relative z-10 flex min-h-screen items-center px-7 py-12 sm:px-14 lg:px-[7.5vw]">
                <div className="mx-auto w-full max-w-[650px]">
                    <h1 className="mb-12 text-[clamp(3.75rem,7.4vw,6.5rem)] font-extrabold leading-[0.88] tracking-[-0.065em] sm:mb-16">
                        Happening<br />now.
                    </h1>

                    <div className="max-w-[650px]">
                        <div className="space-y-4">
                            <a
                                href={`${API_BASE}/auth/oauth/google`}
                                className="flex h-[62px] w-full items-center justify-center gap-5 rounded-full border border-[#dadce0] bg-white px-6 text-lg font-medium text-[#3c4043] transition hover:bg-[#f3f6f8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <GoogleMark />
                                <span>Continue with Google</span>
                            </a>
                            <a
                                href={`${API_BASE}/auth/oauth/microsoft`}
                                className="flex h-[62px] w-full items-center justify-center gap-5 rounded-full border border-[#dadce0] bg-white px-6 text-lg font-medium text-[#202124] transition hover:bg-[#f3f6f8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <MicrosoftMark />
                                <span>Continue with Microsoft</span>
                            </a>
                        </div>

                        <div className="my-7 flex items-center gap-3 text-[#71767b]" aria-hidden="true">
                            <span className="h-px flex-1 bg-[#71767b]" />
                            <span className="text-sm">or</span>
                            <span className="h-px flex-1 bg-[#71767b]" />
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4" noValidate>
                            {loginStep === 'identifier' ? (
                                <>
                                    <label className="sr-only" htmlFor="login-identifier">Email or username</label>
                                    <input
                                        id="login-identifier"
                                        type="text"
                                        placeholder="Email or username"
                                        autoComplete="username"
                                        value={identifier}
                                        onChange={(event) => setIdentifier(event.target.value)}
                                        className="h-[68px] w-full rounded-lg border-2 border-[#33343b] bg-transparent px-4 text-lg text-white outline-none transition placeholder:text-[#71767b] focus:border-[#1d9bf0]"
                                    />
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-[#71767b]">Signing in as <span className="text-white">{identifier}</span></p>
                                    <label className="sr-only" htmlFor="login-password">Password</label>
                                    <input
                                        id="login-password"
                                        type="password"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        autoFocus
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="h-[68px] w-full rounded-lg border-2 border-[#33343b] bg-transparent px-4 text-lg text-white outline-none transition placeholder:text-[#71767b] focus:border-[#1d9bf0]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setLoginStep('identifier'); setPassword('') }}
                                        className="text-sm text-[#1d9bf0] hover:underline"
                                    >
                                        Use a different account
                                    </button>
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-[62px] w-full rounded-full bg-white px-6 text-lg font-bold text-black transition hover:bg-[#e6e9eb] disabled:cursor-not-allowed disabled:bg-[#343434] disabled:text-[#8b8b8b]"
                            >
                                {isSubmitting ? 'Signing in…' : loginStep === 'identifier' ? 'Continue' : 'Sign in'}
                            </button>
                        </form>

                        <p className="mt-8 text-[15px] text-[#71767b]">
                            ¿No tienes cuenta?{' '}
                            <Link href="/register" className="font-semibold text-[#1d9bf0] hover:underline">
                                Regístrate
                            </Link>
                        </p>
                        <p className="mt-12 text-xs leading-5 text-[#71767b]">
                            Al continuar, aceptas los términos de servicio y la política de privacidad de XClone.
                        </p>
                    </div>
                </div>
            </section>

            <aside className="relative hidden min-h-screen overflow-hidden text-[#262626] lg:block">
                <div className="absolute inset-0 p-4 xl:p-8">
                    <XArtwork />
                </div>
                <div className="absolute bottom-[7%] right-[6%] w-[250px] rounded-[20px] border border-[#373737] bg-[#191919] p-5 text-center shadow-2xl">
                    <p className="mb-5 text-[15px] text-[#aaa]">Scan to get the app</p>
                    <a
                        href={appUrl || '/'}
                        aria-label="Abrir XClone"
                        className="mx-auto flex w-fit rounded-xl bg-white p-2 transition hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        {appUrl ? (
                            <QRCodeSVG
                                value={appUrl}
                                size={150}
                                marginSize={4}
                                level="M"
                                title="Código QR para abrir XClone"
                            />
                        ) : (
                            <span className="block h-[150px] w-[150px]" aria-hidden="true" />
                        )}
                    </a>
                    <p className="mt-4 text-xs text-[#888]">XClone</p>
                </div>
            </aside>
        </main>
    )
}
