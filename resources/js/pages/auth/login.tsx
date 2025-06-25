import { LoginForm, type LoginFormData } from '@/components/login-form';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginFormData>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    {/* Contenedor del formulario */}
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            {/* Pasamos toda la lógica y el estado al componente de presentación a través de props. */}
                            <LoginForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                canResetPassword={canResetPassword}
                            />
                        </div>
                    </div>

                    {/* Mensaje de estado */}
                    {status && <div className="text-center text-sm font-medium text-green-600">{status}</div>}
                </div>

                {/* Sección de la imagen */}
                <div className="relative hidden bg-muted lg:block">
                    <img src="/pjt-logo.webp" alt="Image" className="absolute inset-0 h-full w-full object-cover object-top" loading="lazy" />
                </div>
            </div>
        </>
    );
}
