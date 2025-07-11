import { Button } from '@/components/ui/button';
import { PieChart } from '@/components/ui/charts/pie';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getUserColumns } from '@/components/user-columns';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Description } from '@radix-ui/react-dialog';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Edit, MailCheck, Trash2, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Role {
    id: number;
    name: string;
    description: string;
    pivot?: {
        is_primary: boolean;
        expires_at: string | null;
    };
}

interface Area {
    id: number;
    name: string;
    description: string;
    pivot?: {
        is_primary: boolean;
    };
}

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[];
    sede_name: string;
    sede_description?: string;
    status: string;
    areas?: Area[];
}

// Constantes
const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
];

export default function DashboardUsers() {
    const { hasPermission } = usePermissions();
    const { assignableRoles, users, auth } = usePage<{
        assignableRoles: Array<Role>;
        users: Array<User>;
        auth: { user: User };
    }>().props;

    const authUser = auth.user;

    // Verificación de permisos
    const canCreateUser = hasPermission('users:create');
    const canEditUser = hasPermission('users:edit');
    const canDeleteUser = hasPermission('users:delete');
    const canResetUserPassword = hasPermission('users:reset-password');

    // Estados para manejo de UI
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedSedes, setSelectedSedes] = useState<string[]>([]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) || null : null;

    const isEditDisabled = useMemo(() => {
        if (!selectedUserId || !canEditUser) {
            return true;
        }

        if (!selectedUser || !authUser) {
            return true;
        }

        const authUserAssignableRoleNames = assignableRoles.map((r) => r.name);

        if (selectedUser.id === authUser.id) {
            return true;
        }

        const authUserRoleNames = authUser.roles.map((r) => r.name);
        const selectedUserRoleNames = selectedUser.roles.map((r) => r.name);
        if (selectedUserRoleNames.some((roleName) => authUserRoleNames.includes(roleName))) {
            return true;
        }

        if (authUserRoleNames.includes('admin-ti')) {
            const restrictedRoles = ['psicologo', 'jefe-psicologia', 'doctor', 'doctor-jefe'];
            if (selectedUserRoleNames.some((roleName) => restrictedRoles.includes(roleName))) {
                return true;
            }
        }

        if (authUserRoleNames.includes('admin-academico')) {
            const restrictedRoles = ['director', 'admin-ti', 'psicologo', 'jefe-psicologia', 'doctor', 'doctor-jefe'];
            if (selectedUserRoleNames.some((roleName) => restrictedRoles.includes(roleName))) {
                return true;
            }
        }

        if (authUserRoleNames.includes('coordinador-area')) {
            const allowedRoles = ['mentor', 'instructor', 'calificador'];
            if (!selectedUserRoleNames.some((roleName) => allowedRoles.includes(roleName))) {
                return true;
            }
        }

        if (authUserRoleNames.includes('admin-academico-sede')) {
            const higherRoles = ['director', 'admin-ti', 'admin-academico'];
            if (selectedUserRoleNames.some((roleName) => higherRoles.includes(roleName))) {
                return true;
            }
        }

        const canAuthUserAssignAnyOfSelectedUserRoles = selectedUserRoleNames.some((roleName) => authUserAssignableRoleNames.includes(roleName));

        return !canAuthUserAssignAnyOfSelectedUserRoles;
    }, [selectedUserId, canEditUser, selectedUser, authUser, assignableRoles]);

    const columns = getUserColumns(
        users,
        selectedUserId,
        setSelectedUserId,
        selectedRoles,
        setSelectedRoles,
        selectedSedes,
        setSelectedSedes,
        selectedAreas,
        setSelectedAreas,
    );
    const totalUsuarios = users.length;
    const activos = users.filter((u) => u.status === 'active').length;
    const inactivos = totalUsuarios - activos;
    const statusData = [
        { id: 'Activos', label: 'Activos', value: activos },
        { id: 'Inactivos', label: 'Inactivos', value: inactivos },
    ];

    const usuariosPorRol = Object.values(
        users.reduce(
            (acc, user) => {
                user.roles.forEach((role) => {
                    const roleName = role.description || role.name;
                    acc[roleName] = acc[roleName] || {
                        id: roleName,
                        label: roleName,
                        value: 0,
                    };
                    acc[roleName].value += 1;
                });

                return acc;
            },
            {} as Record<string, { id: string; label: string; value: number; color?: string }>,
        ),
    );

    const usuariosPorSede = Object.values(
        users.reduce(
            (acc, user) => {
                const sedeName = user.sede_description || user.sede_name;
                if (sedeName) {
                    acc[sedeName] = acc[sedeName] || {
                        id: sedeName,
                        label: sedeName,
                        value: 0,
                    };
                    acc[sedeName].value += 1;
                }
                return acc;
            },
            {} as Record<string, { id: string; label: string; value: number; color?: string }>,
        ),
    );

    const handleDelete = () => {
        if (selectedUserId) {
            router.delete(`/dashboard/users/${selectedUserId}`, {
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

    const handleClearAllFilters = () => {
        setSelectedRoles([]);
        setSelectedSedes([]);
        setSelectedAreas([]);
        setColumnFilters([]);
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Panel de Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Barra de herramientas */}
                    <div className="mb-2 flex items-center gap-2 rounded-lg border bg-background p-2">
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
                            variant="ghost"
                            className="flex items-center gap-2"
                            disabled={!canCreateUser}
                            onClick={() => canCreateUser && router.visit('/dashboard/users/create')}
                        >
                            <UserPlus className="h-4 w-4" />
                            <span>Agregar</span>
                        </Button>
                        <Button variant="ghost" onClick={() => router.visit(`/dashboard/users/${selectedUserId}/edit`)} disabled={isEditDisabled}>
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
                        <Button variant="ghost" className="flex items-center gap-2" onClick={handleClearAllFilters}>
                            <X className="h-4 w-4" />
                            <span>Limpiar Filtros</span>
                        </Button>
                    </div>

                    {/* Tabla de usuarios */}
                    <div className="relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <DataTable
                            columns={columns}
                            data={users}
                            selectedRowId={selectedUserId}
                            onRowClick={(user) => setSelectedUserId(user.id)}
                            getRowId={(user) => user.id}
                            columnFilters={columnFilters}
                            setColumnFilters={setColumnFilters}
                        />
                    </div>

                    {/* Dashboard de estadísticas */}
                    <div className="flex flex-col gap-6 p-4">
                        <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-4">
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
                            {/* Pie de usuarios por sede */}
                            <div className="flex flex-col items-center rounded-lg border bg-background p-4">
                                <span className="mb-2 font-semibold">Usuarios por sede</span>
                                <div className="h-48 w-full">
                                    <PieChart data={usuariosPorSede} />
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
                </div>
            </div>
        </AppLayout>
    );
}
