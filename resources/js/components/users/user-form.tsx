import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch'; // Importar Switch
import RolesManager from '@/components/users/roles-manager';
import { type SelectItem as SelectItemType } from '@/types';
import { doesRoleRequireArea } from '@/utils/user-form-helpers';
import { useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

type UserFormData = {
    name: string;
    email: string;
    roles: Array<{ name: string; is_primary: boolean; expires_at?: string }>;
    sede_name: string;
    area_name: string;
    password: string;
    password_confirmation: string;
    status: string;
};

interface UserFormProps {
    form: ReturnType<typeof useForm<UserFormData>>;
    processing: boolean;
    sedes: SelectItemType[];
    areas: SelectItemType[];
    assignableRoles: SelectItemType[];
    selectedRole: string;
    setSelectedRole: (role: string) => void;
    primaryRoleIndex: number;
    handleAddRole: (roleName: string) => void;
    handleRemoveRole: (index: number) => void;
    handleSetPrimaryRole: (index: number) => void;
    handleSetExpiryDate: (index: number, date: Date | null) => void;
    parseLocalDate: (dateString: string) => Date;
    requiresArea?: () => boolean;
    userStatus: string;
    isEditMode?: boolean;
}

export default function UserForm({
    form,
    processing,
    sedes,
    areas,
    assignableRoles,
    selectedRole,
    setSelectedRole,
    primaryRoleIndex,
    handleAddRole,
    handleRemoveRole,
    handleSetPrimaryRole,
    handleSetExpiryDate,
    parseLocalDate,
    requiresArea,
    isEditMode,
}: UserFormProps) {
    const { data, setData, errors } = form;

    const shouldRequireArea = requiresArea ? requiresArea() : doesRoleRequireArea(data.roles || []);

    return (
        <>
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
                            value={data.name || ''}
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
                            value={data.email || ''}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="correo@ejemplo.com"
                            autoComplete="email"
                            required
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        <InputError message={errors.email} id="email-error" />
                    </div>

                    {isEditMode && (
                        <div className="space-y-6">
                            <div className="border-b pb-4">
                                <h3 className="text-lg font-semibold text-foreground">Estado de la cuenta</h3>
                                <div className="mt-2 flex items-center space-x-2">
                                    <Switch
                                        id="user-status"
                                        checked={data.status === 'active'}
                                        onCheckedChange={(checked) => setData('status', checked ? 'active' : 'inactive')}
                                        disabled={processing}
                                    />
                                    <Label htmlFor="user-status">Cuenta {data.status === 'active' ? 'activa' : 'inactiva'}</Label>
                                </div>
                                <InputError message={errors.status} id="status-error" />
                                <div
                                    className={`transition-all duration-300 overflow-hidden ${data.status === 'inactive' ? 'max-h-[24px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-1'}`}
                                >
                                    <p className="mt-1 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    Esta cuenta está deshabilitada. El usuario no podrá iniciar sesión.
                                </p>
                                </div>
                            </div>
                        </div>
                    )}
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
                        <Select value={data.sede_name || ''} onValueChange={(value) => setData('sede_name', value)} disabled={processing}>
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
                            shouldRequireArea ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-60'
                        }`}
                    >
                        <Label className="flex items-center gap-2">
                            Área académica
                            {shouldRequireArea && (
                                <Badge variant="secondary" className="bg-yellow-500 text-white dark:bg-yellow-600">
                                    Requerido
                                </Badge>
                            )}
                        </Label>
                        <Combobox<SelectItemType>
                            items={areas}
                            placeholder="Seleccionar área"
                            searchPlaceholder="Buscar área..."
                            emptyText="Área no encontrada"
                            value={data.area_name || ''}
                            onValueChange={(value) => setData('area_name', value)}
                            valueKey="name"
                            labelKey="description"
                            disabled={!shouldRequireArea || processing}
                        />
                        <InputError message={errors.area_name} />
                        {!shouldRequireArea && (
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
                    roles={data.roles || []}
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
        </>
    );
}
