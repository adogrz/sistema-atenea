import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Role {
    name: string;
    description: string;
}
interface Sede {
    name: string;
    description: string;
}
interface Area {
    id: number;
    name: string;
    description: string;
}

interface RegisterUserDialogProps {
    open: boolean;
    onClose: () => void;
    onRegister: (data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        roles: Array<{ name: string; is_primary: boolean }>;
        sede_name: string;
    }) => void;
    roles: Role[];
    sedes: Sede[];
    areas: Area[];
    processing?: boolean;
    errors?: Record<string, string>; // Añadir prop para errores
}

export default function RegisterUserDialog({
    open,
    onClose,
    onRegister,
    roles,
    sedes,
    areas,
    processing = false,
    errors = {}, // Valor por defecto
}: RegisterUserDialogProps) {
    // Obtener errores de la página actual
    const pageErrors = usePage().props.errors;
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedSede, setSelectedSede] = useState('');

    useEffect(() => {
        if (open) {
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
            setSelectedRole('');
            setSelectedSede('');
            // Limpiar errores al abrir el diálogo
            if (errors) {
                Object.keys(errors).forEach((key) => {
                    if (errors[key]) {
                        delete errors[key]; // Limpiar errores específicos
                    }
                });
            }
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegister({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            roles: [{ name: selectedRole, is_primary: true }],
            sede_name: selectedSede,
        });
    };

    // Obtener el usuario autenticado desde las props de la página
    const user = (usePage().props as any).auth?.user;
    if (!user) {
        return null; // No renderizar si no hay usuario autenticado
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center text-lg">Crear una cuenta</DialogTitle>
                </DialogHeader>
                <div className="mx-auto flex size-40 items-center justify-center">
                    <AppLogoIcon className="text-black dark:text-white" />
                </div>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={processing}
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Nombre"
                            />
                            <InputError message={errors?.name || pageErrors?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Correo electrónico</Label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={processing}
                                required
                                autoComplete="email"
                                placeholder="correo@ejemplo.com"
                            />
                            <InputError message={errors?.email || pageErrors?.email} />
                        </div>
                        <div className="space-y-2">
                            <Label>Contraseña</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={processing}
                                required
                                autoComplete="new-password"
                                placeholder="Contraseña"
                            />
                            <InputError message={errors?.password || pageErrors?.password} />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar contraseña</Label>
                            <Input
                                type="password"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                disabled={processing}
                                required
                                autoComplete="new-password"
                                placeholder="Confirmar contraseña"
                            />
                            <InputError message={errors?.password_confirmation || pageErrors?.password_confirmation} />
                        </div>
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((rol) => (
                                        <SelectItem key={rol.name} value={rol.name}>
                                            <div className="px-1 py-1">
                                                <div className="font-medium">{rol.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.roles || pageErrors?.roles} />
                        </div>
                        <div className="space-y-2">
                            <Label>Sede</Label>
                            <Select value={selectedSede} onValueChange={setSelectedSede}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Seleccionar sede" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sedes.map((sede) => (
                                        <SelectItem key={sede.name} value={sede.name}>
                                            <div className="px-1 py-1">
                                                <div className="font-medium">{sede.description}</div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors?.sede_name || pageErrors?.sede_name} />
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="cursor-pointer"
                            disabled={processing || !name || !email || !password || !passwordConfirmation || !selectedRole || !selectedSede}
                        >
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Crear cuenta
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
