import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserForm from '@/components/users/user-form';
import useRolesManagement from '@/hooks/use-roles-management';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SelectItem, type User } from '@/types';
import { doesRoleRequireArea } from '@/utils/user-form-helpers';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle, Mail, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
    { title: 'Editar Usuario', href: '#' },
];

export default function EditUserPage() {
    const { user, assignableRoles, sedes, areas } = usePage<{
        user: User & {
            roles: Array<{
                name: string;
                pivot?: { is_primary: boolean | number; expires_at?: string | null };
            }>;
            areas?: Array<{ name: string; description: string }>;
        };
        assignableRoles: SelectItem[];
        sedes: SelectItem[];
        areas: SelectItem[];
    }>().props;

    const transformedRoles =
        user.roles?.map((role) => ({
            name: role.name,
            is_primary: !!role.pivot?.is_primary,
            expires_at: role.pivot?.expires_at || undefined,
        })) || [];

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const form = useForm({
        name: user.name,
        email: user.email,
        roles: transformedRoles,
        sede_name: user.sede_name,
        area_name: user.areas && user.areas.length > 0 ? user.areas[0].name : '',
        password: '',
        password_confirmation: '',
        status: user.status,
    });
    const { data, setData, put, processing } = form;

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [previousRequiresArea, setPreviousRequiresArea] = useState(false);

    const requiresArea = () =>
        doesRoleRequireArea(
            data.roles as Array<{
                name: string;
                is_primary: boolean;
                expires_at?: string;
            }>,
        );

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const email = data.email as string;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Por favor ingresa un email válido';
        }
        setValidationErrors(newErrors);
    }, [data.email]);

    useEffect(() => {
        const currentRoles = data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>;
        const currentRequiresArea = doesRoleRequireArea(currentRoles);
        if (currentRequiresArea !== previousRequiresArea) {
            setPreviousRequiresArea(currentRequiresArea);
            if (!currentRequiresArea) {
                setData('area_name', '');
            }
        }
    }, [data.roles, previousRequiresArea, setData]);

    const {
        selectedRole,
        setSelectedRole,
        primaryRoleIndex,
        parseLocalDate,
        handleAddRole,
        handleRemoveRole,
        handleSetPrimaryRole,
        handleSetExpiryDate,
    } = useRolesManagement(
        data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (roles) => setData('roles', roles as any),
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const rolesToSubmit = data.roles.map((role) => ({
            ...role,
            expires_at: role.is_primary ? null : role.expires_at,
        }));

        put(route('users.update', user.id), {
            data: { ...data, roles: rolesToSubmit },
            onError: () => {
                toast.error('Hubo un error al editar el usuario', {
                    description: 'Por favor, revisa los campos del formulario e inténtalo de nuevo.',
                });
            },
        });
    };

    const handleSendResetLink = () => {
        router.post(
            route('users.send-reset-link', user.id),
            {},
            {
                onSuccess: () => {
                    toast.success('Enlace de restablecimiento de contraseña enviado correctamente.');
                },
                onError: () => {
                    toast.error('Error al enviar el enlace de restablecimiento de contraseña.');
                },
            },
        );
    };

    const handleDeleteUser = () => {
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                toast.success('Usuario eliminado correctamente.');
            },
            onError: () => {
                toast.error('Error al eliminar el usuario.');
            },
        });
    };

    const isFormValid = () => {
        const roles = data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>;
        return (
            data.name &&
            data.email &&
            roles &&
            roles.length > 0 &&
            data.sede_name &&
            (!requiresArea() || data.area_name) &&
            Object.keys(validationErrors).length === 0
        );
    };

    const getFieldValidation = (field: string) => {
        const roles = data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>;
        switch (field) {
            case 'name':
                return { isValid: !!data.name, value: (data.name as string) || 'Sin especificar', isEmpty: !data.name };
            case 'email':
                return {
                    isValid: !!data.email && !validationErrors.email,
                    value: (data.email as string) || 'Sin especificar',
                    isEmpty: !data.email,
                };
            case 'sede':
                return {
                    isValid: !!data.sede_name,
                    value: data.sede_name ? sedes.find((s) => s.name === data.sede_name)?.description || 'Sin especificar' : 'Sin especificar',
                    isEmpty: !data.sede_name,
                };
            case 'area': {
                const areaRequired = requiresArea();
                return {
                    isValid: !areaRequired || !!data.area_name,
                    value: data.area_name
                        ? areas.find((a) => a.name === data.area_name)?.description || 'Sin especificar'
                        : areaRequired
                          ? 'Sin especificar'
                          : 'No requerido',
                    isEmpty: areaRequired && !data.area_name,
                };
            }
            case 'roles':
                return {
                    isValid: roles && roles.length > 0,
                    value: roles && roles.length > 0 ? `${roles.length} asignado(s)` : 'Sin asignar',
                    isEmpty: !roles || roles.length === 0,
                };
            default:
                return { isValid: false, value: '', isEmpty: true };
        }
    };

    const SummaryItem = ({ label, field }: { label: string; field: string }) => {
        const validation = getFieldValidation(field);
        return (
            <div className="flex items-center gap-2">
                {validation.isValid ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                )}
                <p className="text-sm text-foreground">
                    <span className="font-medium">{label}:</span>{' '}
                    <span className={validation.isEmpty ? 'text-muted-foreground' : 'text-foreground'}>{validation.value}</span>
                </p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Editar Usuario" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Editar usuario</CardTitle>
                            <CardDescription>Actualiza los datos del usuario en el sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-8">
                                <UserForm
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    form={form as any}
                                    processing={processing}
                                    sedes={sedes}
                                    areas={areas}
                                    assignableRoles={assignableRoles}
                                    selectedRole={selectedRole}
                                    setSelectedRole={setSelectedRole}
                                    primaryRoleIndex={primaryRoleIndex}
                                    handleAddRole={handleAddRole}
                                    handleRemoveRole={handleRemoveRole}
                                    handleSetPrimaryRole={handleSetPrimaryRole}
                                    handleSetExpiryDate={handleSetExpiryDate}
                                    parseLocalDate={parseLocalDate}
                                    requiresArea={requiresArea}
                                    userStatus={user.status}
                                    isEditMode={true}
                                />

                                {/* Resumen del formulario */}
                                <div className="rounded-lg border bg-card p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        Resumen del usuario
                                    </h4>
                                    <div className="space-y-2">
                                        <SummaryItem label="Nombre" field="name" />
                                        <SummaryItem label="Email" field="email" />
                                        <SummaryItem label="Sede" field="sede" />
                                        <SummaryItem label="Área" field="area" />
                                        <SummaryItem label="Roles" field="roles" />
                                    </div>
                                    {!isFormValid() && (
                                        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                                            <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                                <AlertTriangle className="h-4 w-4" />
                                                Completa todos los campos requeridos para habilitar la actualización
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Acciones adicionales */}
                                <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
                                    <h4 className="text-base font-semibold text-foreground">Acciones adicionales</h4>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Enviar enlace de restablecimiento</p>
                                            <p className="text-xs text-muted-foreground">
                                                Se enviará un correo al usuario con un enlace para que pueda cambiar su contraseña.
                                            </p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={handleSendResetLink} disabled={processing}>
                                            <Mail className="size-4" />
                                            Enviar enlace
                                        </Button>
                                    </div>
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Eliminar usuario</p>
                                            <p className="text-xs text-muted-foreground">
                                                Esta acción no se puede deshacer. El usuario y sus datos asociados se eliminarán permanentemente.
                                            </p>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button type="button" variant="destructive" size="sm" disabled={processing}>
                                                    <Trash2 className="size-4" />
                                                    Eliminar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar a este usuario?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción es permanente y no se puede deshacer. Se eliminarán todos los datos asociados a
                                                        este usuario.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleDeleteUser}
                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                    >
                                                        Sí, eliminar usuario
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('users.index')}>Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing || !isFormValid()} className="min-w-[140px]">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Actualizar cuenta
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
