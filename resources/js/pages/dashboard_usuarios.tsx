import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types/SharedData';
import { hasRole, hasPermission} from '@/utils/permissions';
import { Plus, Edit, Trash2, UserPlus, Users, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de Usuarios',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.roles || 'Usuario';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${userRole}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">

                {hasRole({ auth } as SharedData, 'admin') && (
                    <div className="admin-panel">
                        <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>Usuario</span>
                            </Button>
                            
                            <Button variant="ghost" className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                <span>Agregar</span>
                            </Button>
                            
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Editar</span>
                            </Button>
                            
                            <Button variant="ghost" className="flex items-center gap-2 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                                <span>Eliminar</span>
                            </Button>

                            {/* Buscador integrado */}
                            <div className="flex flex-1 justify-end">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Buscar usuarios por correo..."
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resto de tu código permanece igual */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}