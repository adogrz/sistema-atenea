import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role_name: string;
    sede_name: string;
};

/**
 * Renders a user registration form with fields for name, email, password, role, and sede selection.
 *
 * The form uses Inertia.js for submission and displays validation errors for each field. Role selection is provided via a searchable combobox, and sede selection via a dropdown. Password fields are reset after successful submission.
 *
 * @returns The registration form component for user account creation.
 */
export default function Register() {
    const { roles, sedes } = usePage<{
        roles: Array<{ value: string; label: string }>;
        sedes: Array<{ value: string; label: string }>;
    }>().props;

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_name: '',
        sede_name: '',
    });

    console.log(roles);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear una cuenta" description="Ingresa los datos a continuación">
            <Head title="Registro de usuario" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nombre"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="correo@ejemplo.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Contraseña"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar contraseña"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rol_name">Rol</Label>
                        <Combobox
                            options={roles}
                            value={data.role_name}
                            onValueChange={(val) => setData('role_name', val)}
                            defaultLabel="Selecciona un rol"
                            placeholder="Busca un rol..."
                        />
                        <InputError message={errors.role_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sede_name">Sede</Label>
                        <Select value={data.sede_name} onValueChange={(value) => setData('sede_name', value)} disabled={processing}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccione una sede" />
                            </SelectTrigger>
                            <SelectContent>
                                {sedes.map((sede) => (
                                    <SelectItem key={sede.value} value={sede.value}>
                                        {sede.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.sede_name} />
                    </div>

                    <Button type="submit" className="mt-2 w-full cursor-pointer" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Crear cuenta
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
