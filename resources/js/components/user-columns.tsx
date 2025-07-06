import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

// Actualizar la interfaz User para reflejar la nueva estructura de datos
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
};

export function getUserColumns(users: User[], selectedUserId: number | null, setSelectedUserId: (id: number) => void): ColumnDef<User>[] {
    // Extraer todos los roles únicos para los filtros
    const allRoles = users.flatMap((user) => user.roles.map((role) => role.description || role.name));
    const uniqueRoles = Array.from(new Set(allRoles));

    // Extraer todas las sedes únicas para los filtros
    const uniqueSedes = Array.from(new Set(users.map((user) => user.sede_description || user.sede_name).filter(Boolean)));

    return [
        {
            id: 'radio_select',
            header: 'Selección',
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
        },
        {
            accessorKey: 'name',
            header: 'Nombre',
        },
        {
            accessorKey: 'email',
            header: 'Correo',
        },
        {
            // Columna de roles actualizada para usar la nueva estructura
            id: 'roles',
            header: ({ column }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                            {column.getFilterValue() ? `Rol: ${column.getFilterValue()}` : 'Filtrar por rol'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>Todos</DropdownMenuItem>
                        {uniqueRoles.map((role) => (
                            <DropdownMenuItem key={role} onClick={() => column.setFilterValue(role)}>
                                {role}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            cell: ({ row }) => {
                const roles = row.original.roles || [];
                return (
                    <div className="flex flex-wrap justify-center gap-1">
                        {roles.map((role) => (
                            <span
                                key={role.id}
                                className={cn('inline-flex items-center rounded-full bg-blue-500 px-3 py-0.5 text-xs font-medium text-white')}
                            >
                                {role.description || role.name}
                            </span>
                        ))}
                    </div>
                );
            },
            // Filtro personalizado para buscar por nombre o descripción del rol
            filterFn: (row, id, filterValue) => {
                const roles = row.original.roles || [];
                return roles.some((role) => (role.description?.toLowerCase() || role.name.toLowerCase()).includes(filterValue.toLowerCase()));
            },
        },
        {
            // Columna de sede actualizada para usar sede_description cuando está disponible
            id: 'sede',
            accessorFn: (row) => row.sede_description || row.sede_name,
            header: ({ column }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                            {column.getFilterValue() ? `Sede: ${column.getFilterValue()}` : 'Filtrar por sede'}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>Todas</DropdownMenuItem>
                        {uniqueSedes.map((sede) => (
                            <DropdownMenuItem key={sede} onClick={() => column.setFilterValue(sede)}>
                                {sede}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            cell: ({ row }) => row.original.sede_description || row.original.sede_name,
            filterFn: (row, id, filterValue) => {
                const sede = row.original.sede_description || row.original.sede_name;
                return sede?.toLowerCase().includes(filterValue.toLowerCase());
            },
        },
        {
            accessorKey: 'status',
            header: 'Estado',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const isActive = status.toLowerCase() === 'active';

                return (
                    <div className="flex justify-center">
                        <span
                            className={cn(
                                'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium text-white',
                                isActive ? 'bg-green-500' : 'bg-red-500',
                            )}
                        >
                            {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                );
            },
        },
    ];
}
