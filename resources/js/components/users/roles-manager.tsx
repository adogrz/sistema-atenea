import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BadgeCheckIcon, Trash } from 'lucide-react';

interface SelectItem {
    name: string;
    description: string;
}

interface Role {
    name: string;
    is_primary: boolean;
    expires_at?: string;
}

interface RolesManagerProps {
    roles: Role[];
    availableRoles: SelectItem[];
    selectedRole: string;
    primaryRoleIndex: number;
    errorMessage?: string;
    disabled?: boolean;
    onSelectedRoleChange: (role: string) => void;
    onAddRole: (role: string) => void;
    onRemoveRole: (index: number) => void;
    onSetPrimaryRole: (index: number) => void;
    onSetExpiryDate: (index: number, date: Date | undefined) => void;
    parseLocalDate: (dateString: string) => Date;
}

export default function RolesManager({
    roles,
    availableRoles,
    selectedRole,
    primaryRoleIndex,
    errorMessage,
    disabled = false,
    onSelectedRoleChange,
    onAddRole,
    onRemoveRole,
    onSetPrimaryRole,
    onSetExpiryDate,
    parseLocalDate,
}: RolesManagerProps) {
    const getRoleDescription = (roleName: string): string => {
        const role = availableRoles.find((r) => r.name === roleName);
        return role ? role.description : roleName;
    };

    return (
        <div className="flex flex-col gap-4">
            <Label>Roles</Label>
            <div className="flex gap-2">
                <div className="flex-1">
                    <Combobox<SelectItem>
                        items={availableRoles}
                        placeholder="Seleccionar rol"
                        searchPlaceholder="Buscar rol..."
                        emptyText="Rol no encontrado"
                        value={selectedRole}
                        onValueChange={onSelectedRoleChange}
                        valueKey="name"
                        labelKey="description"
                        className="w-full"
                    />
                </div>
                <Button type="button" onClick={() => onAddRole(selectedRole)} disabled={!selectedRole || disabled}>
                    Agregar
                </Button>
            </div>

            {roles.length > 0 && (
                <div className="mt-2 rounded-md border p-4">
                    <h4 className="mb-3 text-sm font-medium">Roles seleccionados</h4>
                    <RadioGroup
                        value={primaryRoleIndex.toString()}
                        onValueChange={(value) => onSetPrimaryRole(parseInt(value))}
                        className="space-y-3"
                    >
                        {roles.map((role, index) => (
                            <div key={index} className="flex items-center justify-between gap-2 border-b pb-3 last:border-0">
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value={index.toString()} id={`role-${index}`} />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`role-${index}`} className="font-medium">
                                                {getRoleDescription(role.name)}
                                            </Label>
                                            {index === primaryRoleIndex && (
                                                <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">
                                                    <BadgeCheckIcon />
                                                    Principal
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!(index === primaryRoleIndex) && (
                                        <DatePicker
                                            value={role.expires_at ? parseLocalDate(role.expires_at) : undefined}
                                            onChange={(date) => onSetExpiryDate(index, date)}
                                            placeholder="Expiración"
                                            className="truncate"
                                            disableDates={(date) => date < new Date()}
                                            captionLayout="label"
                                        />
                                    )}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onRemoveRole(index)}
                                        className="text-destructive hover:text-destructive"
                                        disabled={disabled}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            )}

            <InputError message={errorMessage} />
        </div>
    );
}
