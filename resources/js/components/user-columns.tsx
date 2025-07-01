import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';

export type User = {
    id: number;
    name: string;
    email: string;
    role_name: string | string[];
    sede_name: string;
    status: string;
};

export function getUserColumns(users: User[], selectedUserId: number | null, setSelectedUserId: (id: number) => void): ColumnDef<User>[] {
    // Obtener todos los roles únicos, aunque estén en arrays
    const allRoles = users.flatMap(u =>
        Array.isArray(u.role_name)
            ? u.role_name
            : typeof u.role_name === 'string'
                ? (() => {
                    try {
                        const parsed = JSON.parse(u.role_name);
                        if (Array.isArray(parsed)) return parsed;
                        if (u.role_name.includes(',')) return u.role_name.split(',').map(r => r.trim());
                        if (u.role_name) return [u.role_name];
                        return [];
                    } catch {
                        if (u.role_name.includes(',')) return u.role_name.split(',').map(r => r.trim());
                        if (u.role_name) return [u.role_name];
                        return [];
                    }
                })()
                : []
    );
    const uniqueRoles = Array.from(new Set(allRoles));
    const uniqueSedes = Array.from(new Set(users.map((u) => u.sede_name)));

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
            accessorKey: 'role_name',
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
                            <DropdownMenuItem
                                key={role}
                                onClick={() => column.setFilterValue(role)}
                            >
                                {role}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            cell: ({ row }) => {
                const value = row.getValue('role_name');
                let roles: string[] = [];
                if (Array.isArray(value)) {
                    roles = value;
                } else if (typeof value === 'string') {
                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) {
                            roles = parsed;
                        } else if (value.includes(',')) {
                            roles = value.split(',').map(r => r.trim());
                        } else if (value) {
                            roles = [value];
                        }
                    } catch {
                        if (value.includes(',')) {
                            roles = value.split(',').map(r => r.trim());
                        } else if (value) {
                            roles = [value];
                        }
                    }
                }
                return (
                    <div className="flex flex-wrap gap-1 justify-center">
                        {roles.map((role) => (
                            <span
                                key={role}
                                className={cn(
                                    'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium text-white bg-blue-500'
                                )}
                            >
                                {role}
                            </span>
                        ))}
                    </div>
                );
            },
            // Filtro personalizado para arrays de roles
            filterFn: (row, columnId, filterValue) => {
                const value = row.getValue(columnId);
                let roles: string[] = [];
                if (Array.isArray(value)) {
                    roles = value;
                } else if (typeof value === 'string') {
                    try {
                        const parsed = JSON.parse(value);
                        if (Array.isArray(parsed)) {
                            roles = parsed;
                        } else if (value.includes(',')) {
                            roles = value.split(',').map(r => r.trim());
                        } else if (value) {
                            roles = [value];
                        }
                    } catch {
                        if (value.includes(',')) {
                            roles = value.split(',').map(r => r.trim());
                        } else if (value) {
                            roles = [value];
                        }
                    }
                }
                return roles.includes(filterValue);
            },
        },
        {
            accessorKey: 'sede_name',
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
            cell: ({ row }) => row.getValue('sede_name'),
            filterFn: 'equalsString',
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
