import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface SelectItem {
    name: string;
    description: string;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
    { title: 'Registrar Usuario', href: '/dashboard/users/register' },
];

export default function RegisterUserPage() {
    const { assignableRoles, sedes } = usePage<{
        assignableRoles: SelectItem[];
        sedes: SelectItem[];
    }>().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as Array<{ name: string; is_primary: boolean }>,
        sede_name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Registrar Usuario" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card className="mx-auto max-w-3xl">
                    <CardHeader>
                        <CardTitle>Crear una cuenta nueva</CardTitle>
                        <CardDescription>Ingresa los datos para registrar un nuevo usuario en el sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Correo electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rol</Label>
                                    <Combobox
                                        items={assignableRoles}
                                        value={data.roles[0]?.name || ''}
                                        onChange={(roleName) =>
                                            setData('roles', [
                                                {
                                                    name: roleName,
                                                    is_primary: true,
                                                },
                                            ])
                                        }
                                        valueKey="name"
                                        labelKey="description"
                                        placeholder="Seleccionar rol"
                                        searchPlaceholder="Buscar rol..."
                                        disabled={processing}
                                    />
                                    <InputError message={errors.roles} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sede</Label>
                                    <Combobox
                                        items={sedes}
                                        value={data.sede_name}
                                        onChange={(sedeName) => setData('sede_name', sedeName)}
                                        valueKey="name"
                                        labelKey="description"
                                        placeholder="Seleccionar sede"
                                        searchPlaceholder="Buscar sede..."
                                        disabled={processing}
                                    />
                                    <InputError message={errors.sede_name} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('users.index')}>Regresar</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Crear cuenta
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
