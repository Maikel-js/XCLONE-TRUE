'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/endpoints'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BrandMark } from '@/components/brand/BrandMark'

const schema = z.object({
    username: z
        .string()
        .min(3, 'Mínimo 3 caracteres')
        .max(10, 'Máximo 10 caracteres')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
    email: z.string().email('Email inválido'),
    displayName: z.string().min(1, 'Requerido'),
    password: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[a-z]/, 'Falta una minúscula')
        .regex(/[A-Z]/, 'Falta una mayúscula')
        .regex(/\d/, 'Falta un número')
        .regex(/[@$!%*?&]/, 'Falta un carácter especial (@$!%*?&)'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) })

    async function onSubmit(values: FormValues) {
        try {
            await authApi.register(values)
            toast.success('Cuenta creada, inicia sesión')
            router.push('/login')
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error al registrar')
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md">
                <div className="mb-8 flex justify-center">
                    <BrandMark size={56} />
                </div>
                <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight">
                    Crea tu cuenta
                </h1>
                <p className="mb-6 text-center text-sm text-[var(--color-muted)]">
                    Únete a XClone y comparte lo que pasa ahora mismo.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <Input placeholder="Username" autoComplete="username" {...register('username')} error={errors.username?.message} />
                    <Input type="email" placeholder="Email" autoComplete="email" {...register('email')} error={errors.email?.message} />
                    <Input placeholder="Nombre a mostrar" autoComplete="name" {...register('displayName')} error={errors.displayName?.message} />
                    <Input type="password" placeholder="Contraseña" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
                    <Button type="submit" disabled={isSubmitting} fullWidth>
                        {isSubmitting ? 'Creando…' : 'Registrarse'}
                    </Button>
                </form>
                <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </main>
    )
}
