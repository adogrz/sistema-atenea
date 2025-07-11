import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BuildingIcon, MailIcon, ShieldIcon, UserIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inicio',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    const getUserRoleDescription = (user: SharedData['auth']['user']) => {
        const primaryRole = user?.roles?.find((role) => role.pivot?.is_primary);
        return primaryRole?.description || user?.roles?.[0]?.description || 'Sin rol asignado';
    };

    const getSedeDescription = (user: SharedData['auth']['user']) => {
        return (user?.sede as { description?: string })?.description || 'Sin sede asignada';
    };

    const userRoleDescription = getUserRoleDescription(auth.user);
    const sedeDescription = getSedeDescription(auth.user);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inicio" />
            <div className="container p-4">
                <div className="mx-auto max-w-3xl">
                    <Card className="bg-card/100 shadow-lg">
                        <CardHeader className="rounded-t-lg border-b">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <UserIcon className="h-6 w-6" />
                                Bienvenido, {auth.user?.name || 'Usuario'}
                            </CardTitle>
                            <CardDescription>Este es tu panel principal.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                                    <UserIcon className="h-5 w-5 text-primary" />

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                        <p className="text-lg font-semibold">{auth.user?.name || 'No disponible'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                                    <MailIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                                        <p className="text-lg font-semibold">{auth.user?.email || 'No disponible'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                                    <ShieldIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Rol</p>
                                        <p className="text-lg font-semibold">{userRoleDescription}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[24px_1fr] items-center gap-4">
                                    <BuildingIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sede</p>
                                        <p className="text-lg font-semibold">{sedeDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
