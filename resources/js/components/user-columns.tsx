import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { MultiSelectColumnFilter } from '@/components/ui/multi-select-column-filter';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeCheckIcon, Clock } from 'lucide-react';
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
    selectedStatus: string[],
    setSelectedStatus: Dispatch<SetStateAction<string[]>>,
): ColumnDef<User>[] {
    // Extraer todos los roles únicos para los filtros
    const allRoles = users.flatMap((user) => user.roles.map((role) => role.description || role.name));
    const uniqueRoles = Array.from(new Set(allRoles));

    // Extraer todas las sedes únicas para los filtros
    const uniqueSedes = Array.from(new Set(users.map((user) => user.sede_description || user.sede_name).filter(Boolean)));

    // Extraer todas las áreas únicas para los filtros
    const allAreas = users.flatMap((user) => user.areas?.map((area) => area.description || area.name) || []);
    const uniqueAreas = Array.from(new Set(allAreas));

    // Mapa de traducción para el estado
    const statusMap: Record<string, string> = {
        active: 'Activo',
        inactive: 'Inactivo',
        Activo: 'active',
        Inactivo: 'inactive',
    };

    // Extraer estados únicos y traducirlos para las opciones del filtro
    const uniqueStatusDb = Array.from(new Set(users.map((user) => user.status)));
    const uniqueStatusOptions = uniqueStatusDb.map((s) => statusMap[s] || s); // Traducir para mostrar en el filtro

    // Roles que requieren área
    const rolesRequiringArea = ['coordinador-area', 'mentor', 'instructor', 'calificador'];

    // Función para formatear fecha de expiración
    const formatExpiryDate = (expiresAt: string | null): string => {
        if (!expiresAt) return '';

        try {
            const date = new Date(expiresAt);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return expiresAt;
        }
    };

    const RoleBadge = ({ role, isPrimary = false, hasExpiry = false }: { role: Role; isPrimary?: boolean; hasExpiry?: boolean }) => {
        const badgeContent = (
            <Badge
                variant={isPrimary ? 'secondary' : 'default'}
                className={isPrimary ? 'bg-blue-500 text-white dark:bg-blue-600' : 'bg-gray-600 text-white dark:bg-gray-300 dark:text-gray-800'}
            >
                {isPrimary && <BadgeCheckIcon className="mr-1 size-4" />}
                {hasExpiry && <Clock className="mr-1 size-4" />}
                {role.description || role.name}
            </Badge>
        );

        // Si el rol tiene fecha de expiración, envolver en tooltip
        if (hasExpiry && role.pivot?.expires_at) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
                    <TooltipContent>
                        <p>Este rol expira el {formatExpiryDate(role.pivot.expires_at)}</p>
                    </TooltipContent>
                </Tooltip>
            );
        }

        // Si no tiene expiración, devolver el badge sin tooltip
        return badgeContent;
    };

    return [
        {
            id: 'radio_select',
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
            meta: { title: 'Seleccionar' },
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" enableSorting={false} />,
            cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
            meta: { title: 'Nombre' },
        },
        {
            accessorKey: 'email',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Correo" enableSorting={false} />,
            cell: ({ row }) => <div className="text-sm text-muted-foreground">{row.getValue('email')}</div>,
            meta: { title: 'Correo' },
        },
        {
            id: 'roles',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Roles"
                    filterComponent={
                        <MultiSelectColumnFilter
                            column={column}
                            selectedValues={selectedRoles}
                            setSelectedValues={setSelectedRoles}
                            options={uniqueRoles}
                            placeholder="Filtrar roles..."
                        />
                    }
                    onClearFilter={() => {
                        setSelectedRoles([]);
                        column.setFilterValue(undefined);
                    }}
                />
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
            meta: { title: 'Roles' },
        },
        {
            id: 'sede',
            accessorFn: (row) => row.sede_description || row.sede_name,
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Sede"
                    enableSorting={false}
                    filterComponent={
                        <MultiSelectColumnFilter
                            column={column}
                            selectedValues={selectedSedes}
                            setSelectedValues={setSelectedSedes}
                            options={uniqueSedes}
                            placeholder="Filtrar sedes..."
                        />
                    }
                    onClearFilter={() => {
                        setSelectedSedes([]);
                        column.setFilterValue(undefined);
                    }}
                />
            ),
            cell: ({ row }) => <div className="text-sm">{row.original.sede_description || row.original.sede_name}</div>,
            filterFn: (row, id, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const sede = row.original.sede_description || row.original.sede_name;
                return filterValue.includes(sede);
            },
            meta: { title: 'Sede' },
        },
        {
            id: 'areas',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Áreas"
                    enableSorting={false}
                    filterComponent={
                        <MultiSelectColumnFilter
                            column={column}
                            selectedValues={selectedAreas}
                            setSelectedValues={setSelectedAreas}
                            options={uniqueAreas}
                            placeholder="Filtrar áreas..."
                        />
                    }
                    onClearFilter={() => {
                        setSelectedAreas([]);
                        column.setFilterValue(undefined);
                    }}
                />
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
                            <Badge variant="secondary" className="bg-indigo-500 text-white dark:bg-indigo-600">
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
            meta: { title: 'Áreas' },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Estado"
                    enableSorting={false}
                    filterComponent={
                        <MultiSelectColumnFilter
                            column={column}
                            selectedValues={selectedStatus}
                            setSelectedValues={setSelectedStatus}
                            options={uniqueStatusOptions}
                            placeholder="Filtrar estado..."
                        />
                    }
                    onClearFilter={() => {
                        setSelectedStatus([]);
                        column.setFilterValue(undefined);
                    }}
                />
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
                                isActive ? 'bg-green-500 text-white dark:bg-green-600' : 'bg-red-500 text-white dark:bg-red-600',
                            )}
                        >
                            {isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                    </div>
                );
            },
            filterFn: (row, id, filterValue) => {
                if (!filterValue || filterValue.length === 0) return true;
                const originalStatus = row.original.status;
                const translatedFilterValues = (filterValue as string[]).map((fv) => statusMap[fv] || fv);
                return translatedFilterValues.includes(originalStatus);
            },
            meta: { title: 'Estado' },
        },
    ];
}
