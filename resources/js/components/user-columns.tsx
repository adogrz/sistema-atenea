import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Column, ColumnDef } from '@tanstack/react-table';
import { BadgeCheckIcon, Clock, FilterIcon, GraduationCap, Mail, MapPin, Shield, User, Users, X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

export type User = {
    id: number;
    name: string;
    email: string;
    roles: {
        id: number;
        name: string;
        description: string;
        pivot?: {
            is_primary: boolean;
            expires_at: string | null;
        };
    }[];
    sede_name: string;
    sede_description?: string;
    status: string;
    areas?: {
        id: number;
        name: string;
        description: string;
        pivot?: {
            is_primary: boolean;
        };
    }[];
};

type Role = User['roles'][number];

export function getUserColumns(
    users: User[],
    selectedUserId: number | null,
    setSelectedUserId: (id: number) => void,
    selectedRoles: string[],
    setSelectedRoles: Dispatch<SetStateAction<string[]>>,
    selectedSedes: string[],
    setSelectedSedes: Dispatch<SetStateAction<string[]>>,
    selectedAreas: string[],
    setSelectedAreas: Dispatch<SetStateAction<string[]>>,
): ColumnDef<User>[] {
    // Extraer todos los roles únicos para los filtros
    const allRoles = users.flatMap((user) => user.roles.map((role) => role.description || role.name));
    const uniqueRoles = Array.from(new Set(allRoles));

    // Extraer todas las sedes únicas para los filtros
    const uniqueSedes = Array.from(new Set(users.map((user) => user.sede_description || user.sede_name).filter(Boolean)));

    // Extraer todas las áreas únicas para los filtros
    const allAreas = users.flatMap((user) => user.areas?.map((area) => area.description || area.name) || []);
    const uniqueAreas = Array.from(new Set(allAreas));

    // Roles que requieren área
    const rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];

    const RoleBadge = ({ role, isPrimary = false, hasExpiry = false }: { role: Role; isPrimary?: boolean; hasExpiry?: boolean }) => {
        if (isPrimary) {
            return (
                <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">
                    <BadgeCheckIcon />
                    {role.description || role.name}
                </Badge>
            );
        }

        // Roles secundarios
        return (
            <Badge className="bg-gray-500 text-white">
                {hasExpiry && <Clock className="mr-1 size-4" />}
                {role.description || role.name}
            </Badge>
        );
    };

    const RoleFilterComponent = ({ column, selectedRoles, setSelectedRoles }: { column: Column<User, unknown>, selectedRoles: string[], setSelectedRoles: Dispatch<SetStateAction<string[]>> }) => {
        const handleRoleChange = (values: string[]) => {
            setSelectedRoles(values);
            column.setFilterValue(values.length > 0 ? values : undefined);
        };

        return (
            <MultiSelector values={selectedRoles} onValuesChange={handleRoleChange} className="w-full">
                <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="Filtrar roles..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                    <MultiSelectorList>
                        {uniqueRoles.map((role) => (
                            <MultiSelectorItem key={role} value={role}>
                                {role}
                            </MultiSelectorItem>
                        ))}
                    </MultiSelectorList>
                </MultiSelectorContent>
            </MultiSelector>
        );
    };

    const SedeFilterComponent = ({ column, selectedSedes, setSelectedSedes }: { column: Column<User, unknown>, selectedSedes: string[], setSelectedSedes: Dispatch<SetStateAction<string[]>> }) => {

        const handleSedeChange = (values: string[]) => {
            setSelectedSedes(values);
            column.setFilterValue(values.length > 0 ? values : undefined);
        };

        return (
            <MultiSelector values={selectedSedes} onValuesChange={handleSedeChange} className="w-full">
                <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="Filtrar sedes..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                    <MultiSelectorList>
                        {uniqueSedes.map((sede) => (
                            <MultiSelectorItem key={sede} value={sede}>
                                {sede}
                            </MultiSelectorItem>
                        ))}
                    </MultiSelectorList>
                </MultiSelectorContent>
            </MultiSelector>
        );
    };

    const AreaFilterComponent = ({ column, selectedAreas, setSelectedAreas }: { column: Column<User, unknown>, selectedAreas: string[], setSelectedAreas: Dispatch<SetStateAction<string[]>> }) => {

        const handleAreaChange = (values: string[]) => {
            setSelectedAreas(values);
            column.setFilterValue(values.length > 0 ? values : undefined);
        };

        return (
            <MultiSelector values={selectedAreas} onValuesChange={handleAreaChange} className="w-full">
                <MultiSelectorTrigger>
                    <MultiSelectorInput placeholder="Filtrar áreas..." />
                </MultiSelectorTrigger>
                <MultiSelectorContent>
                    <MultiSelectorList>
                        {uniqueAreas.map((area) => (
                            <MultiSelectorItem key={area} value={area}>
                                {area}
                            </MultiSelectorItem>
                        ))}
                    </MultiSelectorList>
                </MultiSelectorContent>
            </MultiSelector>
        );
    };

    return [
        {
            id: 'radio_select',
            header: () => (
                <div className="flex items-center justify-center">
                    <Users className="h-4 w-4 text-muted-foreground" />
                </div>
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex justify-center">
                        <input
                            type="radio"
                            name="user-selection"
                            checked={selectedUserId === user.id}
                            onChange={() => setSelectedUserId(user.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 text-primary"
                        />
                    </div>
                );
            },
            enableSorting: false,
            enableHiding: false,
            size: 60,
        },
        {
            accessorKey: 'name',
            header: () => (
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Nombre</span>
                </div>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
        },
        {
            accessorKey: 'email',
            header: () => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Correo</span>
                </div>
            ),
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue('email')}</div>,
        },
        {
            id: 'roles',
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <Shield className="size-4" />
                    <span>Roles</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <FilterIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <RoleFilterComponent column={column} selectedRoles={selectedRoles} setSelectedRoles={setSelectedRoles} />
                            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => {
                                setSelectedRoles([]);
                                column.setFilterValue(undefined);
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtro
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            ),
            cell: ({ row }) => {
                const roles = row.original.roles || [];
                const primaryRole = roles.find((r) => r.pivot?.is_primary);
                const secondaryRoles = roles.filter((r) => !r.pivot?.is_primary);

                return (
                    <div className="flex flex-wrap gap-1">
                        {primaryRole && <RoleBadge role={primaryRole} isPrimary={true} hasExpiry={!!primaryRole.pivot?.expires_at} />}
                        {secondaryRoles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {secondaryRoles.slice(0, 2).map((role) => (
                                    <RoleBadge key={role.id} role={role} isPrimary={false} hasExpiry={!!role.pivot?.expires_at} />
                                ))}
                                {secondaryRoles.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{secondaryRoles.length - 2}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                );
            },
            filterFn: (row, id, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const roles = row.original.roles || [];
                return roles.some((role) => filterValue.includes(role.description || role.name));
            },
        },
        {
            id: 'sede',
            accessorFn: (row) => row.sede_description || row.sede_name,
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Sede</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <FilterIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <SedeFilterComponent column={column} selectedSedes={selectedSedes} setSelectedSedes={setSelectedSedes} />
                             <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => {
                                setSelectedSedes([]);
                                column.setFilterValue(undefined);
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtro
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            ),
            cell: ({ row }) => <div className="text-sm">{row.original.sede_description || row.original.sede_name}</div>,
            filterFn: (row, id, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const sede = row.original.sede_description || row.original.sede_name;
                return filterValue.includes(sede);
            },
        },
        {
            id: 'areas',
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <GraduationCap className="size-4" />
                    <span>Áreas</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <FilterIcon className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                            <AreaFilterComponent column={column} selectedAreas={selectedAreas} setSelectedAreas={setSelectedAreas} />
                             <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => {
                                setSelectedAreas([]);
                                column.setFilterValue(undefined);
                            }}>
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtro
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>
            ),
            cell: ({ row }) => {
                const user = row.original;
                const requiresArea = user.roles.some((role) => rolesRequiringArea.includes(role.name));

                if (!requiresArea) {
                    return <span className="text-xs text-muted-foreground">No requerido</span>;
                }

                if (!user.areas || user.areas.length === 0) {
                    return <span className="text-xs text-orange-600">Sin asignar</span>;
                }

                const primaryArea = user.areas.find((a) => a.pivot?.is_primary);

                return (
                    <div className="flex flex-wrap gap-1">
                        {primaryArea && (
                            <Badge variant="secondary" className="bg-blue-500 text-white dark:bg-blue-600">
                                {primaryArea.description || primaryArea.name}
                            </Badge>
                        )}
                    </div>
                );
            },
            filterFn: (row, id, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const areas = row.original.areas || [];
                return areas.some((area) => filterValue.includes(area.description || area.name));
            },
        },
        {
            accessorKey: 'status',
            header: () => (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-current" />
                    <span>Estado</span>
                </div>
            ),
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const isActive = status.toLowerCase() === 'active';

                return (
                    <div className="flex justify-center">
                        <Badge
                            variant={isActive ? 'default' : 'secondary'}
                            className={cn(
                                'text-xs',
                                isActive
                                    ? 'bg-green-500 text-white hover:bg-green-600 dark:bg-green-600'
                                    : 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-600',
                            )}
                        >
                            {isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                );
            },
        },
    ];
}