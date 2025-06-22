import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLogoIcon from '@/components/app-logo-icon';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
                <div className="w-full max-w-3xl">
                    <div className="flex flex-col gap-0">
                        <Card className="h-[90vh] p-0">
                        
                            <CardContent className="grid p-0 md:grid-cols-2 h-full">
                                <form className="flex flex-col justify-center h-full p-6" onSubmit={submit}>
                                    <div className="flex flex-col gap-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="my=5 flex items-center justify-center rounded-md md:hidden">
                                                <AppLogoIcon className='h-auto w-32' />
                                            </div>
                                            <h1 className="text-2xl font-bold text-pretty">Inicia sesión</h1>
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="flex items-center">
                                                <Label htmlFor="password">Contraseña</Label>
                                                {canResetPassword && (
                                                    <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                                        ¿Olvidaste tu contraseña?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Contraseña"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                checked={data.remember}
                                                onClick={() => setData('remember', !data.remember)}
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">Recordarme</Label>
                                        </div>

                                        <Button type="submit" className="w-full cursor-pointer" tabIndex={4} disabled={processing}>
                                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                            Iniciar sesión
                                        </Button>

                                        <div className="text-center text-sm">
                                            ¿No tenés una cuenta?{' '}
                                            <TextLink href={route('register')} tabIndex={5}>
                                                Registrate
                                            </TextLink>
                                        </div>
                                    </div>
                                </form>

                                  <div className="relative hidden h-full bg-muted md:block">
                                        <img
                                            src="/logo-pjt-large.avif"
                                            alt="Image"
                                            className="absolute inset-0 h-full w-full object-cover object-top"
                                            loading="lazy"
                                        /> 
                                    </div>             
                            </CardContent>
                        </Card>

                        {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
                    </div>
                </div>
            </div>
        </>
    );
}
