import EditUserModal from '@/components/edit-user-modal';
import RegisterForm from '@/components/register-user-modal';
import { Button } from '@/components/ui/button';
import { PieChart } from '@/components/ui/charts/pie';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserColumns } from '@/components/user-columns';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SharedData } from '@/types/SharedData';
import { Head, router, usePage } from '@inertiajs/react';
import { Description } from '@radix-ui/react-dialog';
import { Edit, MailCheck, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';

// Interfaces simplificadas y mejor definidas
interface Role {
    id: number;
    name: string;
    description: string;
}

interface Sede {
    id: number;
    name: string;
    description: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[] | string;
    role_name: string[];
    sede_name: string;
    status: string;
}

// Constantes
const BREADCRUMBS: BreadcrumbItem[] = [
    {
        title: 'Panel de Usuarios',
        href: '/dashboard/usuarios',
    },
];

export default function Dashboard() {
    // Hooks y datos de la página
    const { hasPermission } = usePermissions();
    const { roles, sedes, users } = usePage<{
        roles: Array<Role>;
        sedes: Array<Sede>;
        users: Array<User>;
    }>().props;
    const { auth } = usePage<SharedData>().props;

    // Verificación de permisos
    const canCreateUser = hasPermission('user-create');
    const canEditUser = hasPermission('user-edit');
    const canDeleteUser = hasPermission('user-delete');
    const canResetUserPassword = hasPermission('user-reset-password');

    // Estados para manejo de UI
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    // Obtener el usuario seleccionado basado en selectedUserId
    const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) || null : null;

    // Columnas de la tabla
    const columns = getUserColumns(users, selectedUserId, setSelectedUserId);

    // Estadísticas para los gráficos
    const totalUsuarios = users.length;
    const activos = users.filter((u) => u.status === 'active').length;
    const inactivos = totalUsuarios - activos;

    const statusData = [
        { id: 'Activos', label: 'Activos', value: activos },
        { id: 'Inactivos', label: 'Inactivos', value: inactivos },
    ];

    const normalizeRoles = (roleData: string[] | string): string[] => {
        if (Array.isArray(roleData)) return roleData;

        if (typeof roleData === 'string') {
            try {
                const parsed = JSON.parse(roleData);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // Si falla el parsing como JSON, tratarlo como string
            }

            // Si es un string con comas, dividirlo
            if (roleData.includes(',')) {
                return roleData.split(',').map((r) => r.trim());
            }

            // Si es un string simple, devolver array con ese valor
            return roleData ? [roleData] : [];
        }

        return [];
    };

    const usuariosPorRol = Object.values(
        users.reduce(
            (acc, user) => {
                const roles = normalizeRoles(user.role_name);

                roles.forEach((role) => {
                    if (!role) return;

                    acc[role] = acc[role] || {
                        id: role,
                        label: role,
                        value: 0,
                    };
                    acc[role].value += 1;
                });

                return acc;
            },
            {} as Record<string, { id: string; label: string; value: number; color?: string }>,
        ),
    );

    // Manejadores de eventos
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

    const handleSendResetLink = () => {
        if (selectedUserId) {
            router.post(route('users.send-reset-link', { user: selectedUserId }));
            setShowResetConfirm(false);
        }
    };

    const handleEditUser = (data: any) => {
        if (selectedUser) {
            router.put(`/users/${selectedUser.id}`, data, {
                onSuccess: () => {
                    setShowEditModal(false);
                    setSelectedUserId(null);
                    setFormErrors({});
                },
                onError: (errors) => {
                    console.error('Error al editar:', errors);
                    setFormErrors(errors);
                },
            });
        }
    };

    const handleRegisterUser = (data: any) => {
        router.post(route('register'), data, {
            onSuccess: () => {
                setShowRegisterModal(false);
            },
            onError: (errors) => {
                console.error('Error al registrar:', errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Panel de Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Barra de herramientas */}
                    <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={() => setShowResetConfirm(true)}
                            disabled={!selectedUserId || !canResetUserPassword}
                        >
                            <MailCheck className="h-4 w-4" />
                            <span>Enviar enlace de recuperación</span>
                        </Button>
                        <Button
                            disabled={!canCreateUser}
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={() => setShowRegisterModal(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Agregar</span>
                        </Button>
                        <Button variant="ghost" onClick={() => setShowEditModal(true)} disabled={!selectedUserId || !canEditUser}>
                            <Edit className="h-4 w-4" /> Editar
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={!selectedUserId || !canDeleteUser}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </Button>
                    </div>

                    {/* Tabla de usuarios */}
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <DataTable
                            columns={columns}
                            data={users}
                            selectedRowId={selectedUserId}
                            onRowClick={(user) => setSelectedUserId(user.id)}
                            getRowId={(user) => user.id}
                        />
                    </div>

                    {/* Dashboard de estadísticas */}
                    <div className="flex flex-col gap-6 p-4">
                        <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Total usuarios */}
                            <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                                <span className="text-2xl font-bold">{totalUsuarios}</span>
                                <span className="text-muted-foreground">Usuarios totales</span>
                            </div>
                            {/* Pie de activos/inactivos */}
                            <div className="flex flex-col items-center rounded-lg border bg-background p-4">
                                <span className="mb-2 font-semibold">Activos vs Inactivos</span>
                                <div className="h-48 w-full">
                                    <PieChart data={statusData} />
                                </div>
                            </div>
                            {/* Pie de usuarios por rol */}
                            <div className="flex flex-col items-center rounded-lg border bg-background p-4">
                                <span className="mb-2 font-semibold">Usuarios por rol</span>
                                <div className="h-48 w-full">
                                    <PieChart data={usuariosPorRol} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modales */}
                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Eliminar usuario?</DialogTitle>
                            </DialogHeader>
                            <Description className="mb-4">
                                <p className="mb-1">Id: {selectedUserId}</p>
                                <p className="mb-1">Nombre: {selectedUser?.name}</p>
                                <p className="mb-1">Email: {selectedUser?.email}</p>
                            </Description>
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
                            <p className="mb-1">ID: {selectedUserId}</p>
                            <p className="mb-1">Nombre: {selectedUser?.name}</p>
                            <p className="mb-1">Email: {selectedUser?.email}</p>
                            <p>¿Estás seguro de que deseas enviar el enlace de recuperación de contraseña a este usuario?</p>
                            <DialogFooter className="pt-4">
                                <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleSendResetLink}>
                                    Enviar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <EditUserModal
                        open={showEditModal}
                        onClose={() => {
                            setShowEditModal(false);
                            setFormErrors({});
                        }}
                        onSave={handleEditUser}
                        user={selectedUser}
                        roles={roles}
                        sedes={sedes}
                        errors={formErrors} // Pasar los errores al modal
                    />

                    <RegisterForm
                        open={showRegisterModal}
                        onClose={() => setShowRegisterModal(false)}
                        onRegister={handleRegisterUser}
                        roles={roles}
                        sedes={sedes}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
