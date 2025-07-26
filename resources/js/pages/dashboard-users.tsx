import { Button } from '@/components/ui/button';
import { BarChartLabel } from '@/components/ui/charts/chart-bar-label';
import { BarChartCustomLabel } from '@/components/ui/charts/chart-bar-label-custom';
import { DonutChart } from '@/components/ui/charts/chart-pie-donut-text';
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
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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

interface FlashMessages {
    success?: string;
    error?: string;
}

// Constantes
const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
];

export default function DashboardUsers() {
    const { hasPermission } = usePermissions();
    const { assignableRoles, users, auth, flash } = usePage<{
        assignableRoles: Array<Role>;
        users: Array<User>;
        auth: { user: User };
        flash: FlashMessages;
    }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const authUser = auth.user;

    // Verificación de permisos
    const canViewAllUsers = hasPermission('users:view-all');
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
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]); // Nuevo estado para el filtro de estado
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

    const columns = useMemo(
        () =>
            getUserColumns(
                users,
                selectedUserId,
                setSelectedUserId,
                selectedRoles,
                setSelectedRoles,
                selectedSedes,
                setSelectedSedes,
                selectedAreas,
                setSelectedAreas,
                selectedStatus,
                setSelectedStatus,
            ),
        [users, selectedUserId, selectedRoles, selectedSedes, selectedAreas, selectedStatus],
    );
    const totalUsuarios = users.length;
    const activos = users.filter((u) => u.status === 'active').length;
    const inactivos = totalUsuarios - activos;
    const statusData = [
        { name: 'Activos', value: activos },
        { name: 'Inactivos', value: inactivos },
    ];

    const usuariosPorRol = Object.values(
        users.reduce(
            (acc, user) => {
                user.roles.forEach((role) => {
                    const roleName = role.description || role.name;
                    acc[roleName] = acc[roleName] || {
                        category: roleName,
                        value: 0,
                    };
                    acc[roleName].value += 1;
                });

                return acc;
            },
            {} as Record<string, { category: string; value: number }>,
        ),
    );

    const usuariosPorSede = Object.values(
        users.reduce(
            (acc, user) => {
                const sedeName = user.sede_description || user.sede_name;
                if (sedeName) {
                    acc[sedeName] = acc[sedeName] || {
                        category: sedeName,
                        value: 0,
                    };
                    acc[sedeName].value += 1;
                }
                return acc;
            },
            {} as Record<string, { category: string; value: number }>,
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
        setSelectedStatus([]);
        setColumnFilters([]);
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Panel de Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Barra de herramientas */}
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setShowResetConfirm(true)}
                            disabled={!selectedUserId || !canResetUserPassword}
                        >
                            <MailCheck className="size-4" />
                            <span>Enviar enlace de recuperación</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                            disabled={!canCreateUser}
                            onClick={() => canCreateUser && router.visit('/dashboard/users/create')}
                        >
                            <UserPlus className="size-4" />
                            <span>Agregar</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.visit(`/dashboard/users/${selectedUserId}/edit`)}
                            disabled={isEditDisabled}
                            className="flex items-center gap-2"
                        >
                            <Edit className="size-4" /> Editar
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={!selectedUserId || !canDeleteUser}
                        >
                            <Trash2 className="size-4" />
                            <span>Eliminar</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={handleClearAllFilters}>
                            <X className="size-4" />
                            <span>Limpiar Filtros</span>
                        </Button>
                    </div>

                    {/* Tabla de usuarios */}
                    <div>
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

                    {/* Gráficos */}
                    <div className="mt-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="col-span-1 flex h-full flex-col">
                                <DonutChart
                                    data={statusData}
                                    title="Estado de Usuarios"
                                    description="Usuarios activos e inactivos"
                                    centerLabel="Total"
                                    colors={['hsl(144.07 100% 39%)', 'hsl(356.95 96% 57.99%)']}
                                    footerText="Distribución de usuarios"
                                    innerRadius={55}
                                    strokeWidth={5}
                                    className="h-full flex-1"
                                />
                            </div>
                            <div
                                className={`col-span-1 flex h-full flex-col ${
                                    canViewAllUsers && usuariosPorSede.length > 0 ? 'md:col-span-1' : 'md:col-span-2'
                                }`}
                            >
                                <BarChartCustomLabel
                                    data={usuariosPorRol}
                                    title="Usuarios por Rol"
                                    description="Distribución por roles"
                                    dataLabel="Cantidad"
                                    barColor="hsl(240.98 100% 69%)"
                                    categoryLabelColor="white"
                                    footerText="Total de usuarios en cada rol"
                                    className="h-full flex-1"
                                />
                            </div>
                            {canViewAllUsers && usuariosPorSede.length > 0 && (
                                <div className="col-span-1 flex h-full flex-col">
                                    <BarChartLabel
                                        data={usuariosPorSede}
                                        title="Usuarios por Sede"
                                        description="Distribución por sedes"
                                        dataLabel="Usuarios"
                                        footerText="Total de usuarios en cada sede"
                                        barColor="hsl(216.26 100% 57.99%)"
                                        labelPosition="inside"
                                        labelColor="white"
                                        categoryLabelTruncate={0}
                                        className="h-full flex-1"
                                    />
                                </div>
                            )}
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
