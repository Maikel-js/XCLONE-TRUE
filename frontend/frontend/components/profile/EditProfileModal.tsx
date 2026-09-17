'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpdateUser } from '@/lib/api/hooks/useUpdateUser'
import type { CachedUser } from '@/lib/types'

const schema = z.object({
    username: z
        .string()
        .min(3, 'Mínimo 3')
        .max(10, 'Máximo 10')
        .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
    email: z.string().email('Email inválido'),
    displayName: z.string().min(1, 'Requerido'),
    bio: z.string().max(160, 'Máximo 160 caracteres').optional(),
    avatar: z.union([z.literal(''), z.string().url('Debe ser una URL válida')]).optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
    open: boolean
    onClose: () => void
    user: CachedUser
}

export function EditProfileModal({ open, onClose, user }: Props) {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
        useForm<FormValues>({ resolver: zodResolver(schema) })

    const { mutate } = useUpdateUser(user.id)

    useEffect(() => {
        if (open) {
            reset({
                username: user.username,
                email: user.email ?? '',
                displayName: user.displayName,
                bio: user.bio ?? '',
                avatar: user.avatar ?? '',
            })
        }
    }, [open, user, reset])

    function onSubmit(values: FormValues) {
        mutate(values, {
            onSuccess: () => {
                toast.success('Perfil actualizado')
                onClose()
            },
            onError: (e) => {
                toast.error(e instanceof Error ? e.message : 'Error al actualizar')
            },
        })
    }

    return (
        <Modal open={open} onClose={onClose} title="Editar perfil">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input placeholder="Username" {...register('username')} error={errors.username?.message} />
                <Input type="email" placeholder="Email" {...register('email')} error={errors.email?.message} />
                <Input placeholder="Nombre a mostrar" {...register('displayName')} error={errors.displayName?.message} />
                <Input placeholder="Bio" {...register('bio')} error={errors.bio?.message} />
                <Input placeholder="URL del avatar (https://…)" {...register('avatar')} error={errors.avatar?.message} />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando…' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
