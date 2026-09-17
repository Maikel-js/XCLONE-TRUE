'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth/useAuth'
import { authApi } from '@/lib/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BrandMark } from '@/components/brand/BrandMark'

const schema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    async function onSubmit(values: FormValues) {
        try {
            const { token } = await authApi.login(values)
            login(token)
            toast.success('Sesión iniciada')
            router.push('/')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al iniciar sesión')
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <BrandMark size={56} />
                </div>
                <h1 className="mb-6 text-center text-3xl font-extrabold tracking-tight">
                    Inicia sesión en XClone
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        {...register('password')}
                        error={errors.password?.message}
                    />
                    <Button type="submit" disabled={isSubmitting} fullWidth>
                        {isSubmitting ? 'Entrando…' : 'Entrar'}
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="text-[var(--color-accent)] hover:underline">
                        Regístrate
                    </Link>
                </p>
            </div>
        </main>
    )
}
