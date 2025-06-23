import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BuildingIcon, MailIcon, ShieldIcon, UserIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Inicio',
        href: '/home',
    },
];

/**
 * Renders the user profile home page with personal details and role information.
 *
 * Displays the authenticated user's name, email, role, and location within a styled card layout. Fallback text is shown if any user information is unavailable.
 */
export default function Home() {
    const { auth } = usePage<SharedData>().props;

    type Role = { description: string };
    type Sede = { description: string };

    const userRoleDescription =
        (auth.user?.role as Role | undefined)?.description ||
        (auth.user?.roles && Array.isArray(auth.user.roles) && auth.user.roles.length > 0
            ? (auth.user.roles[0] as Role).description
            : 'Sin rol asignado');

    const sedeDescription = (auth.user?.sede as Sede | undefined)?.description || 'Sin sede asignada';

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
                            <CardDescription>Perfil de usuario</CardDescription>
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
