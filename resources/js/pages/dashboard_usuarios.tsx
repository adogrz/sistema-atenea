import { useState } from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router, Link } from '@inertiajs/react';
import { SharedData } from '@/types/SharedData';
import { hasRole } from '@/utils/permissions';
import { Edit, Trash2, UserPlus, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getUserColumns } from "@/components/user-columns";
import { DataTable } from "@/components/ui/data-table";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de Usuarios',
        href: '/dashboard',
    },
];
//Ya protegido

export default function Dashboard() {
    const { users } = usePage<{ auth: any; users: any[] }>().props;
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user?.roles || 'Usuario';

    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const columns = getUserColumns(users);
    
    const handleDelete = () => {
        if (selectedUserId) {
            router.delete(`/users/${selectedUserId}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedUserId(null);
                },
                onError: (errors) => {
                    console.error('Error al eliminar:', errors);
                },
            });
        }
    };

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
                            <Link href="/register">
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Agregar</span>
                                </Button>
                            </Link>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                <span>Editar</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                                onClick={() => setShowDeleteModal(true)}
                                disabled={!selectedUserId}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Eliminar</span>
                            </Button>
                        </div>
                        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                            <DataTable columns={columns} data={users} />
                        </div>
                        {/* Modal de Confirmación */}
                        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Eliminar usuario?</DialogTitle>
                                </DialogHeader>
                                <p>
                                    Esta acción no se puede deshacer. El usuario seleccionado será eliminado permanentemente del sistema.
                                </p>
                                <DialogFooter className="flex justify-end pt-4 gap-2">
                                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Eliminar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}