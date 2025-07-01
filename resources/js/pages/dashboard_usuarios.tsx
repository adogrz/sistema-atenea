import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { SharedData } from '@/types/SharedData';
import { hasRole } from '@/utils/permissions';
import { Button } from '@/components/ui/button';
import { Head, router, usePage } from '@inertiajs/react';
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
import { PieChart } from "@/components/ui/charts/pie";
import { Description } from '@radix-ui/react-dialog';
import RegisterForm from "@/components/register-user-modal";

// Definición de interfaces para los datos del usuario, roles y sedes
interface Role { id: number; name: string; description: string; }
interface Sede { id: number; name: string; description: string; }

interface User {
    id: number;
    name: string;
    email: string;
    roles: Role[] | string;
    role_name: string[];
    sede_name: string;
    status: string;
}


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel de Usuarios',
        href: '/dashboard/usuarios',
    },
];

export default function Dashboard() {
    const { roles, sedes } = usePage<{
        roles: Array<{ id: number; name: string; description: string }>;
        sedes: Array<{ id: number; name: string; description: string }>;
    }>().props;

    // Obtenemos los usuarios y la información de autenticación desde la página
    const { users } = usePage<{ auth: any; users: any[] }>().props;
    const { auth } = usePage<SharedData>().props;

    // Estados para manejar la selección de usuario y modales
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

    // Obtenemos las columnas de la tabla de usuarios
    const userRole = auth.user?.roles || 'Usuario';
    const columns = getUserColumns(users, selectedUserId, setSelectedUserId);

    // Datos para los gráficos
    const totalUsuarios = users.length;
    const activos = users.filter(u => u.status === 'active').length;
    const inactivos = users.filter(u => u.status === 'inactive').length;

    const statusData = [
        { id: "Activos", label: "Activos", value: activos },
        { id: "Inactivos", label: "Inactivos", value: inactivos },
    ];

    // Agrupamos los usuarios por rol
    const usuariosPorRol = Object.values(
        users.reduce((acc, user) => {
            // Normaliza a array de roles
            let roles: string[] = [];
            if (Array.isArray(user.role_name)) {
                roles = user.role_name;
            } else if (typeof user.role_name === "string") {
                try {
                    const parsed = JSON.parse(user.role_name);
                    if (Array.isArray(parsed)) {
                        roles = parsed;
                    } else if (user.role_name.includes(",")) {
                        roles = user.role_name.split(",").map((r: string) => r.trim());
                    } else if (user.role_name) {
                        roles = [user.role_name];
                    }
                } catch {
                    if (user.role_name.includes(",")) {
                        roles = user.role_name.split(",").map((r: string) => r.trim());
                    } else if (user.role_name) {
                        roles = [user.role_name];
                    }
                }
            }

            // Suma uno por cada rol
            roles.forEach(role => {
                acc[role] = acc[role] || { id: role, label: role, value: 0 };
                acc[role].value += 1;
            });
            return acc;
        }, {} as Record<string, { id: string; label: string; value: number; color?: string }>)
    ) as Array<{ id: string; label: string; value: number; color?: string }>;

    // Funciones para manejar las acciones de eliminar, editar y enviar enlace de recuperación
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
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                                onClick={() => setShowRegisterModal(true)}
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>Agregar</span>
                            </Button>
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
                        <div className="flex flex-col gap-6 p-4">
                            {/* Gráficos de usuarios */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                {/* Total usuarios */}
                                <div className="flex flex-col items-center justify-center bg-background rounded-lg border p-4">
                                    <span className="text-2xl font-bold">{totalUsuarios}</span>
                                    <span className="text-muted-foreground">Usuarios totales</span>
                                </div>
                                {/* Pie de activos/inactivos */}
                                <div className="bg-background rounded-lg border p-4 flex flex-col items-center">
                                    <span className="font-semibold mb-2">Activos vs Inactivos</span>
                                    <div className="w-full h-48">
                                        <PieChart
                                            data={statusData}
                                        />
                                    </div>
                                </div>
                                {/* Pie de usuarios por rol */}
                                <div className="bg-background rounded-lg border p-4 flex flex-col items-center">
                                    <span className="font-semibold mb-2">Usuarios por rol</span>
                                    <div className="w-full h-48">
                                        <PieChart data={usuariosPorRol} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Modal de Confirmación */}
                        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>¿Eliminar usuario?</DialogTitle>
                                </DialogHeader>
                                <Description className="mb-4">
                                    <p className="mb-1">Id: {selectedUserId}</p>
                                    <p className="mb-1">Nombre: {userToEdit?.name}</p>
                                    <p className="mb-1">Email: {userToEdit?.email}</p>
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
                                <p className="mb-1">Nombre: {userToEdit?.name}</p>
                                <p className="mb-1">Email: {userToEdit?.email}</p>
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
                            onSave={(data) => {
                                if (userToEdit) {
                                    router.put(`/users/${userToEdit.id}`, data, {
                                        onSuccess: () => {
                                            setShowEditModal(false);
                                            setSelectedUserId(null);
                                        },
                                        onError: (errors) => {
                                            console.error('Error al editar:', errors);
                                        },
                                    });
                                }
                            }}
                            user={userToEdit}
                            roles={roles}
                            sedes={sedes}
                        />
                        <RegisterForm
                            open={showRegisterModal}
                            onClose={() => setShowRegisterModal(false)}
                            onRegister={(data) => {
                                router.post(route('register'), data, {
                                    onSuccess: () => {
                                        setShowRegisterModal(false);
                                        setSelectedUserId(null);
                                    },
                                    onError: (errors) => {
                                        console.error('Error al registrar:', errors);
                                    },
                                });
                            }}
                            roles={roles}
                            sedes={sedes}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
