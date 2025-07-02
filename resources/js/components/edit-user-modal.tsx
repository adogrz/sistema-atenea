import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// Definición de interfaces para los datos
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

interface FormData {
    name: string;
    email: string;
    status: string;
    role_name: string[];
    sede_name: string;
}

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (updates: FormData) => void;
    user: User | null;
    roles: Role[];
    sedes: Sede[];
}

// Componente auxiliar para mostrar errores de formulario
function FormError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-sm text-destructive">{message}</p>;
}

export default function EditUserModal({ open, onClose, onSave, user, roles, sedes }: EditUserModalProps) {
    // Obtener errores de la página actual
    const { errors } = usePage().props;

    // Estados locales para manejar los campos del formulario
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        status: 'active',
        sede_name: '',
        role_name: [],
    });
    const [showConfirm, setShowConfirm] = useState(false);

    // Función para normalizar los roles del usuario
    const normalizeRoles = (userRoles: Role[] | string | undefined): string[] => {
        if (!userRoles) return [];

        if (Array.isArray(userRoles)) {
            return userRoles.map((role) => role.name);
        }

        if (typeof userRoles === 'string') {
            try {
                const parsed = JSON.parse(userRoles);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // Si falla el parsing como JSON, tratarlo como string
            }

            // Si es un string con comas, dividirlo
            if (userRoles.includes(',')) {
                return userRoles.split(',').map((r) => r.trim());
            }

            // Si es un string simple, devolver array con ese valor
            return userRoles ? [userRoles] : [];
        }

        return [];
    };

    // Efecto para inicializar los campos cuando cambia el usuario
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                status: user.status || 'active',
                sede_name: user.sede_name || '',
                role_name: user.role_name || normalizeRoles(user.roles),
            });
        }
    }, [user]);

    // Función para actualizar un campo específico del formulario
    const updateField = (field: keyof FormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Verificación de si el formulario es válido
    const isFormValid = (): boolean => {
        return Boolean(formData.name && formData.email && formData.status && formData.sede_name && formData.role_name.length > 0);
    };

    // Función para manejar la confirmación de guardar
    const handleConfirmSave = () => {
        // Nos aseguramos que role_name sea un array
        const dataToSend = {
            ...formData,
            role_name: Array.isArray(formData.role_name) ? formData.role_name : [formData.role_name],
        };

        console.log('Datos que se envían:', dataToSend);
        onSave(dataToSend);
        setShowConfirm(false);
    };

    // Si no hay usuario autenticado, no renderizar nada
    const session = (usePage().props as any).auth?.user;
    if (!session) return null;

    // Si no hay usuario seleccionado o el modal no está abierto, no renderizar nada
    if (!user || !open) {
        return null;
    }

    return (
        <>
            {/* Modal principal de edición */}
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Editar Usuario</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario seleccionado</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-1 border-b border-muted pb-4">
                        <p className="text-sm">
                            <span className="font-semibold">ID:</span> {user.id}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                        {/* Campo Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
                            {errors?.name && <FormError message={errors.name} />}
                        </div>

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo</Label>
                            <Input id="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                            {errors?.email && <FormError message={errors.email} />}
                        </div>

                        {/* Campo Estado */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                                <SelectTrigger id="status" className="w-full">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Inactivo</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors?.status && <FormError message={errors.status} />}
                        </div>

                        {/* Campo Sede */}
                        <div className="space-y-2">
                            <Label htmlFor="sede">Sede</Label>
                            <Select value={formData.sede_name} onValueChange={(value) => updateField('sede_name', value)}>
                                <SelectTrigger id="sede" className="w-full">
                                    <SelectValue placeholder="Seleccionar sede" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sedes.map((sede) => (
                                        <SelectItem key={sede.id} value={sede.name}>
                                            {sede.description}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors?.sede_name && <FormError message={errors.sede_name} />}
                        </div>
                    </div>

                    {/* Selección de Roles */}
                    <div className="mt-4 space-y-2">
                        <Label>Roles</Label>
                        <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded border p-3">
                            {roles.map((rol) => (
                                <div key={rol.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`role-${rol.id}`}
                                        checked={formData.role_name.includes(rol.name)}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                updateField('role_name', [...formData.role_name, rol.name]);
                                            } else {
                                                updateField(
                                                    'role_name',
                                                    formData.role_name.filter((r) => r !== rol.name),
                                                );
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`role-${rol.id}`} className="cursor-pointer font-medium">
                                        {rol.description}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors?.role_name && <FormError message={errors.role_name} />}
                    </div>

                    {/* Botones de acción */}
                    <DialogFooter className="pt-6">
                        <Button variant="secondary" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={() => setShowConfirm(true)} disabled={!isFormValid()}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Confirmar cambios?</DialogTitle>
                    </DialogHeader>
                    <p>¿Estás seguro que deseas guardar los cambios realizados a este usuario?</p>
                    <DialogFooter className="pt-4">
                        <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmSave}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
