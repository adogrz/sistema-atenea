import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

// Exportamos el tipo de datos del formulario para que el componente padre lo pueda usar.
export type LoginFormData = {
    email: string;
    password: string;
    remember: boolean;
};

// Definimos la interfaz para todas las props que este componente espera recibir.
interface LoginFormProps {
    data: LoginFormData;
    setData: (key: keyof LoginFormData, value: string | boolean) => void;
    errors: Partial<Record<keyof LoginFormData, string>>;
    processing: boolean;
    canResetPassword: boolean;
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export function LoginForm({ data, setData, errors, processing, canResetPassword, onSubmit }: LoginFormProps) {
    return (
        <form className={cn('flex flex-col gap-6')} onSubmit={onSubmit}>
            <div className="mb-1 flex items-center justify-center rounded-md lg:hidden">
                <AppLogoIcon className="h-auto w-48 fill-current text-[var(--foreground)] dark:text-white" />
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Inicia sesión</h1>
                <p className="text-sm text-pretty text-muted-foreground">Ingresa tu correo y contraseña para acceder a tu cuenta</p>
            </div>

            <div className="grid gap-6">
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
                        disabled={processing}
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
                        disabled={processing}
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-3">
                    <Checkbox
                        id="remember"
                        name="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) => setData('remember', !!checked)}
                        tabIndex={3}
                        disabled={processing}
                    />
                    <Label htmlFor="remember">Recordarme</Label>
                </div>

                <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Iniciar sesión
                </Button>
            </div>
        </form>
    );
}
