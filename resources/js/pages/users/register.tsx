import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import UserForm from '@/components/users/user-form';
import { usePasswordGenerator } from '@/hooks/use-password-generator';
import useRolesManagement from '@/hooks/use-roles-management';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SelectItem } from '@/types';
import { doesRoleRequireArea } from '@/utils/user-form-helpers';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle, Wand2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Usuarios', href: '/dashboard/users' },
    { title: 'Registrar Usuario', href: '/dashboard/users/register' },
];

export default function RegisterUserPage() {
    const { assignableRoles, sedes, areas } = usePage<{
        assignableRoles: SelectItem[];
        sedes: SelectItem[];
        areas: SelectItem[];
    }>().props;

    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as Array<{ name: string; is_primary: boolean; expires_at?: string }>,
        sede_name: '',
        area_name: '',
    });
    const { data, setData, post, processing, errors, reset } = form;

    const { generateSecurePassword, isGenerating } = usePasswordGenerator();
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [previousRequiresArea, setPreviousRequiresArea] = useState(false);

    const requiresArea = () => doesRoleRequireArea(data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>);

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        const email = data.email as string;
        const password = data.password as string;
        const passwordConfirmation = data.password_confirmation as string;

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Por favor ingresa un email válido';
        }
        if (password && password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }
        if (passwordConfirmation && password !== passwordConfirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }
        setValidationErrors(newErrors);
    }, [data.email, data.password, data.password_confirmation]);

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

    const handleGeneratePassword = () => {
        const password = generateSecurePassword();
        setData('password', password);
        setData('password_confirmation', password);
    };

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

        post(route('users.store'), {
            data: { ...data, roles: rolesToSubmit },
            onSuccess: () => reset(),
        });
    };

    const isFormValid = () => {
        const roles = data.roles as Array<{ name: string; is_primary: boolean; expires_at?: string }>;
        return (
            data.name &&
            data.email &&
            data.password &&
            data.password_confirmation &&
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
                    isValid: roles.length > 0,
                    value: roles.length > 0 ? `${roles.length} asignado(s)` : 'Sin asignar',
                    isEmpty: roles.length === 0,
                };
            case 'password':
                return {
                    isValid: !!data.password && !!data.password_confirmation && !validationErrors.password && !validationErrors.password_confirmation,
                    value: data.password ? 'Configurada' : 'Sin configurar',
                    isEmpty: !data.password || !data.password_confirmation,
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
            <Head title="Registrar Usuario" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Crear una cuenta nueva</CardTitle>
                            <CardDescription>Ingresa los datos para registrar un nuevo usuario en el sistema.</CardDescription>
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
                                    isEditMode={false}
                                />

                                {/* Sección: Seguridad */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b pb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">Seguridad</h3>
                                            <p className="text-sm text-muted-foreground">Configuración de contraseña</p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGeneratePassword}
                                            disabled={processing || isGenerating}
                                            className="text-xs"
                                        >
                                            <Wand2 className="mr-1 h-3 w-3" />
                                            {isGenerating ? 'Generando...' : 'Generar contraseña'}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Contraseña</Label>
                                            <PasswordInput
                                                id="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                disabled={processing}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                required
                                                aria-invalid={!!(errors.password || validationErrors.password)}
                                                aria-describedby={errors.password || validationErrors.password ? 'password-error' : undefined}
                                            />
                                            <InputError message={errors.password || validationErrors.password} id="password-error" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                disabled={processing}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                required
                                                aria-invalid={!!(errors.password_confirmation || validationErrors.password_confirmation)}
                                                aria-describedby={
                                                    errors.password_confirmation || validationErrors.password_confirmation
                                                        ? 'password-confirm-error'
                                                        : undefined
                                                }
                                            />
                                            <InputError
                                                message={errors.password_confirmation || validationErrors.password_confirmation}
                                                id="password-confirm-error"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen del formulario */}
                                <div className="rounded-lg border bg-card p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        Resumen del usuario
                                    </h4>
                                    <div className="space-y-2">
                                        <SummaryItem label="Nombre" field="name" />
                                        <SummaryItem label="Email" field="email" />
                                        <SummaryItem label="Contraseña" field="password" />
                                        <SummaryItem label="Sede" field="sede" />
                                        <SummaryItem label="Área" field="area" />
                                        <SummaryItem label="Roles" field="roles" />
                                    </div>
                                    {!isFormValid() && (
                                        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                                            <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                                <AlertTriangle className="h-4 w-4" />
                                                Completa todos los campos requeridos para habilitar el registro
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Botones de acción */}
                                <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('users.index')}>Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing || !isFormValid()} className="min-w-[140px]">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Crear cuenta
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
