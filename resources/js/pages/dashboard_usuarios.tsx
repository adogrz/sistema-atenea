import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SharedData } from '@/types/SharedData';
import { hasRole } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Trash2, User, UserPlus, MailCheck } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getUserColumns } from "@/components/user-columns";
import { DataTable } from "@/components/ui/data-table";
import EditUserModal from "@/components/edit-user-modal";

interface User {
    id: number;
    name: string;
    email: string;
    role_name: string;
    sede_name: string;
    status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de Usuarios',
        href: '/dashboard/usuarios',
    },
];

/**
 * Renders the user management dashboard, providing an interface for administrators to view, add, edit, delete users, and send password reset links.
 *
 * The dashboard displays a data table of users and conditionally renders admin controls based on the authenticated user's role. It manages modal dialogs for editing user details, confirming deletions, and sending password reset links. User actions are integrated with backend routes via Inertia.js.
 *
 * @returns The dashboard component for user management.
 */
export default function Dashboard() {
    const { roles, sedes } = usePage<{
        roles: Array<{ id: number; name: string; description: string }>;
        sedes: Array<{ id: number; name: string; description: string }>;
    }>().props;

    const { users } = usePage<{ auth: any; users: any[] }>().props;
    const { auth } = usePage<SharedData>().props;

    const userRole = auth.user?.roles || 'Usuario';

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const columns = getUserColumns(users, selectedUserId, setSelectedUserId);

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

    const handleEdit = () => {
        const user = users.find((u) => u.id === selectedUserId);
        if (user) {
            setUserToEdit(user);
            setShowEditModal(true);
        }
    };

    const handleSaveEdit = (updates: {
        name: string;
        email: string;
        status: string;
        role_name: string;
        sede_name: string;
    }) => {
        if (!userToEdit) return;

        router.put(`/users/${userToEdit.id}`, updates, {
            onSuccess: () => {
                setShowEditModal(false);
                setUserToEdit(null);
            },
            onError: (err) => {
                console.error("Error al editar:", err);
            },
            onFinish: () => {
                // optional: recargar datos si es necesario
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dashboard - ${userRole}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {hasRole({ auth } as SharedData, 'admin') && (
                    <div className="admin-panel">
                        <div className="flex items-center gap-2 p-2 bg-background rounded-lg border">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                                onClick={() => setShowResetConfirm(true)}
                                disabled={!selectedUserId}
                            >
                                <MailCheck className="h-4 w-4" />
                                <span>Enviar enlace de recuperación</span>
                            </Button>
                            <Link href="/register">
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Agregar</span>
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={handleEdit} disabled={!selectedUserId}>
                                <Edit className="w-4 h-4" /> Editar
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
                            <DataTable
                                columns={columns}
                                data={users}
                                selectedRowId={selectedUserId}
                                onRowClick={(user) => setSelectedUserId(user.id)}
                                getRowId={(user) => user.id}
                            />
                        </div>
                        {/* Modal de Confirmación */}
                        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Eliminar usuario?</DialogTitle>
                                </DialogHeader>
                                <p>Esta acción no se puede deshacer. El usuario seleccionado será eliminado permanentemente del sistema.</p>
                                <DialogFooter className="flex justify-end gap-2 pt-4">
                                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Eliminar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Enviar enlace de recuperación?</DialogTitle>
                                </DialogHeader>
                                <p>¿Estás seguro de que deseas enviar el enlace de recuperación de contraseña a este usuario?</p>
                                <DialogFooter className="pt-4">
                                    <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            router.post(route('users.send-reset-link', { user: selectedUserId }));
                                            setShowResetConfirm(false);
                                        }}
                                    >
                                        Enviar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <EditUserModal
                            open={showEditModal}
                            onClose={() => setShowEditModal(false)}
                            onSave={handleSaveEdit}
                            user={userToEdit}
                            roles={roles}
                            sedes={sedes}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
