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
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-4">
                <h1 className="text-2xl font-bold">Crear cuenta</h1>
                <Input placeholder="Username" {...register('username')} error={errors.username?.message} />
                <Input type="email" placeholder="Email" {...register('email')} error={errors.email?.message} />
                <Input placeholder="Nombre a mostrar" {...register('displayName')} error={errors.displayName?.message} />
                <Input type="password" placeholder="Contraseña" {...register('password')} error={errors.password?.message} />
                <Button type="submit" disabled={isSubmitting} fullWidth>
                    {isSubmitting ? 'Creando…' : 'Registrarse'}
                </Button>
                <p className="text-center text-sm text-[var(--color-muted)]">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </form>
        </main>
    )
}
