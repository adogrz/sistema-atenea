import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useEffect, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración de contraseña',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
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
        return data.current_password && data.password && data.password_confirmation && Object.keys(validationErrors).length === 0;
    };

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Contraseña actualizada correctamente');
                reset();
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración de contraseña" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Actualizar contraseña"
                        description="Asegúrate de que tu cuenta utilice una contraseña larga y aleatoria para mantenerla segura"
                    />

                    <form onSubmit={updatePassword} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Contraseña actual</Label>

                            <PasswordInput
                                id="current_password"
                                ref={currentPasswordInput}
                                autoComplete="current-password"
                                required
                                autoFocus
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                placeholder="••••••••"
                            />

                            <InputError id="current-password-error" message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Nueva contraseña</Label>

                            <PasswordInput
                                id="password"
                                ref={passwordInput}
                                autoComplete="new-password"
                                required
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
                                ref={passwordInput}
                                autoComplete="new-password"
                                required
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
                            />
                        </div>

                        <Button disabled={processing || !isFormValid()}>Guardar contraseña</Button>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
