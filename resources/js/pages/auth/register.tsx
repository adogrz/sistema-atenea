import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

// TODO: Traerlo desde el controller
const roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'user', label: 'Usuario' },
    { value: 'editor', label: 'Editor' },
    { value: 'viewer', label: 'Lector' },
    { value: 'guest', label: 'Invitado' },
];

// TODO: Traerlo desde el controller
const sedes = [
    { value: 'central', label: 'Central' },
    { value: 'occidental', label: 'Occidental' },
    { value: 'oriental', label: 'Oriental' },
];

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Primer nombre</Label>
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
                                placeholder="Primer nombre"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="second_name">Segundo nombre</Label>
                            <Input
                                id="second_name"
                                type="text"
                                // required
                                tabIndex={1}
                                autoComplete="second-name"
                                // value={data.second_name}
                                // onChange={(e) => setData('second_name', e.target.value)}
                                disabled={processing}
                                placeholder="Segundo nombre"
                            />
                            {/* <InputError message={errors.second_name} className="mt-2" /> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first_last_name">Primer apellido</Label>
                            <Input
                                id="first_last_name"
                                type="text"
                                // required
                                tabIndex={1}
                                autoComplete="family-name"
                                // value={data.first_last_name}
                                // onChange={(e) => setData('first_last_name', e.target.value)}
                                disabled={processing}
                                placeholder="Primer apellido"
                            />
                            {/* <InputError message={errors.first_last_name} className="mt-2" /> */}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="second_last_name">Segundo apellido</Label>
                            <Input
                                id="second_last_name"
                                type="text"
                                // required
                                tabIndex={1}
                                autoComplete="family-name"
                                // value={data.second_last_name}
                                // onChange={(e) => setData('second_last_name', e.target.value)}
                                disabled={processing}
                                placeholder="Segundo apellido"
                            />
                            {/* <InputError message={errors.second_last_name} className="mt-2" /> */}
                        </div>
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
                        <Label htmlFor="rol">Rol</Label>
                        <Combobox
                            options={roles}
                            placeholder="Busca un rol..."
                            noOptionsMessage="No se encontraron roles."
                            defaultLabel="Selecciona un rol"
                        />
                        {/* <InputError message={errors.rol} /> */}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sede">Sede</Label>
                        <Select required>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Seleccionar sede" />
                            </SelectTrigger>
                            <SelectContent>
                                {sedes.map((sede) => (
                                    <SelectItem key={sede.value} value={sede.value}>
                                        {sede.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {/* <InputError message={errors.sede} /> */}
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
