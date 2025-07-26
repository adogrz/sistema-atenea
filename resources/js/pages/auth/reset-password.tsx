import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { PasswordInput } from '@/components/ui/password-input';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const password = data.password as string;
        const passwordConfirmation = data.password_confirmation as string;

        if (password && password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }
        if (passwordConfirmation && password !== passwordConfirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }
        setValidationErrors(newErrors);
    }, [data.password, data.password_confirmation]);

    const isFormValid = () => {
        return data.email && data.password && data.password_confirmation && Object.keys(validationErrors).length === 0;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Restablecer contraseña" description="Por favor, introduce tu nueva contraseña a continuación">
            <Head title="Restablecer contraseña" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <PasswordInput
                            id="password"
                            autoComplete="new-password"
                            required
                            autoFocus
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={!!(errors.password || validationErrors.password)}
                            aria-describedby={errors.password || validationErrors.password ? 'password-error' : undefined}
                        />
                        <InputError id="password-error" message={errors.password || validationErrors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                        <PasswordInput
                            id="password_confirmation"
                            autoComplete="new-password"
                            required
                            autoFocus
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            aria-invalid={!!(errors.password_confirmation || validationErrors.password_confirmation)}
                            aria-describedby={
                                errors.password_confirmation || validationErrors.password_confirmation ? 'password-confirm-error' : undefined
                            }
                        />
                        <InputError
                            id="password-confirm-error"
                            message={errors.password_confirmation || validationErrors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <Button type="submit" className="mt-4 w-full" disabled={processing || !isFormValid()}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Restablecer contraseña
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
