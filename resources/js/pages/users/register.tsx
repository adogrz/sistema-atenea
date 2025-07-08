import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RolesManager from '@/components/users/roles-manager';
import { usePasswordGenerator } from '@/hooks/use-password-generator';
import useRolesManagement from '@/hooks/use-roles-management';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle, Wand2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface SelectItem {
    name: string;
    description: string;
}

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

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as Array<{ name: string; is_primary: boolean; expires_at?: string }>,
        sede_name: '',
        area_name: '',
    });

    // Hook para generar contraseñas
    const { generateSecurePassword, isGenerating } = usePasswordGenerator();

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [previousRequiresArea, setPreviousRequiresArea] = useState(false);

    const requiresArea = () => {
        const rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];
        return data.roles.some((role) => rolesRequiringArea.includes(role.name));
    };

    // Validación en tiempo real
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Por favor ingresa un email válido';
        }

        if (data.password && data.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        if (data.password_confirmation && data.password !== data.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }

        setValidationErrors(newErrors);
    }, [data.email, data.password, data.password_confirmation]);

    // Animación para campo área
    useEffect(() => {
        const currentRequiresArea = requiresArea();
        if (currentRequiresArea !== previousRequiresArea) {
            setPreviousRequiresArea(currentRequiresArea);
            if (!currentRequiresArea) {
                setData('area_name', '');
            }
        }
    }, [data.roles, previousRequiresArea, requiresArea, setData]);

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
    } = useRolesManagement(data.roles, (roles) => setData('roles', roles));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => reset(),
        });
    };

    const isFormValid = () => {
        return (
            data.name &&
            data.email &&
            data.password &&
            data.password_confirmation &&
            data.roles.length > 0 &&
            data.sede_name &&
            (!requiresArea() || data.area_name) &&
            Object.keys(validationErrors).length === 0
        );
    };

    // Validación individual de campos para el resumen
    const getFieldValidation = (field: string) => {
        switch (field) {
            case 'name':
                return {
                    isValid: !!data.name,
                    value: data.name || 'Sin especificar',
                    isEmpty: !data.name,
                };
            case 'email':
                return {
                    isValid: !!data.email && !validationErrors.email,
                    value: data.email || 'Sin especificar',
                    isEmpty: !data.email,
                };
            case 'sede':
                return {
                    isValid: !!data.sede_name,
                    value: data.sede_name ? sedes.find((s) => s.name === data.sede_name)?.description : 'Sin especificar',
                    isEmpty: !data.sede_name,
                };
            case 'area': {
                const areaRequired = requiresArea();
                return {
                    isValid: !areaRequired || !!data.area_name,
                    value: data.area_name
                        ? areas.find((a) => a.name === data.area_name)?.description
                        : areaRequired
                          ? 'Sin especificar'
                          : 'No requerido',
                    isEmpty: areaRequired && !data.area_name,
                };
            }
            case 'roles':
                return {
                    isValid: data.roles.length > 0,
                    value: data.roles.length > 0 ? `${data.roles.length} asignado(s)` : 'Sin asignar',
                    isEmpty: data.roles.length === 0,
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
                                {/* Sección: Información Personal */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
                                        <p className="text-sm text-muted-foreground">Datos básicos del usuario</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre completo</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                disabled={processing}
                                                placeholder="Ingresa el nombre completo"
                                                autoComplete="name"
                                                required
                                                aria-invalid={!!errors.name}
                                                aria-describedby={errors.name ? 'name-error' : undefined}
                                            />
                                            <InputError message={errors.name} id="name-error" />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Correo electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                disabled={processing}
                                                placeholder="correo@ejemplo.com"
                                                autoComplete="email"
                                                required
                                                aria-invalid={!!(errors.email || validationErrors.email)}
                                                aria-describedby={errors.email || validationErrors.email ? 'email-error' : undefined}
                                            />
                                            <InputError message={errors.email || validationErrors.email} id="email-error" />
                                        </div>
                                    </div>
                                </div>

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

                                {/* Sección: Ubicación */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold text-foreground">Ubicación</h3>
                                        <p className="text-sm text-muted-foreground">Sede y área de trabajo</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label>Sede</Label>
                                            <Select
                                                value={data.sede_name}
                                                onValueChange={(value) => setData('sede_name', value)}
                                                disabled={processing}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar sede" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {sedes.map((sede) => (
                                                            <SelectItem key={sede.name} value={sede.name}>
                                                                {sede.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.sede_name} />
                                        </div>

                                        <div
                                            className={`space-y-2 transition-all duration-300 ${
                                                requiresArea() ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-60'
                                            }`}
                                        >
                                            <Label className="flex items-center gap-2">
                                                Área académica
                                                {requiresArea() && (
                                                    <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">
                                                        Requerido
                                                    </Badge>
                                                )}
                                            </Label>
                                            <Combobox<SelectItem>
                                                items={areas}
                                                placeholder="Seleccionar área"
                                                searchPlaceholder="Buscar área..."
                                                emptyText="Área no encontrada"
                                                value={data.area_name}
                                                onValueChange={(value) => setData('area_name', value)}
                                                valueKey="name"
                                                labelKey="description"
                                                disabled={!requiresArea() || processing}
                                            />
                                            <InputError message={errors.area_name} />
                                            {!requiresArea() && (
                                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <AlertCircle className="h-3 w-3" />
                                                    Se habilitará según los roles seleccionados
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Sección: Roles */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold text-foreground">Roles y Permisos</h3>
                                        <p className="text-sm text-muted-foreground">Asigna roles</p>
                                    </div>

                                    <RolesManager
                                        roles={data.roles}
                                        availableRoles={assignableRoles}
                                        selectedRole={selectedRole}
                                        primaryRoleIndex={primaryRoleIndex}
                                        errorMessage={errors.roles}
                                        disabled={processing}
                                        onSelectedRoleChange={setSelectedRole}
                                        onAddRole={handleAddRole}
                                        onRemoveRole={handleRemoveRole}
                                        onSetPrimaryRole={handleSetPrimaryRole}
                                        onSetExpiryDate={handleSetExpiryDate}
                                        parseLocalDate={parseLocalDate}
                                    />
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
