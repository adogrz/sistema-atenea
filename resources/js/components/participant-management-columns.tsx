import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from '@inertiajs/react';
import { Eye, AlertTriangle } from 'lucide-react';

interface Participante {
    id: number;
    codigo: string;
    nombre: string;
    email: string;
    telefono: string;
    centro_educativo: string;
    nivel_educativo: string;
    sede_name: string;
    sede_description?: string;
    estado: 'activo' | 'inactivo' | 'completado' | 'suspendido';
    usuario_activo: boolean;
    fecha_ingreso: string;
}

const getEstadoBadge = (estado: string) => {
    const variants: Record<
        string,
        { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }
    > = {
        activo: { variant: 'default', label: 'Activo', className: 'bg-green-600 hover:bg-green-700' },
        inactivo: { variant: 'secondary', label: 'Inactivo', className: 'bg-gray-600 hover:bg-gray-700' },
        completado: { variant: 'secondary', label: 'Completado', className: 'bg-blue-600 hover:bg-blue-700' },
        suspendido: { variant: 'outline', label: 'Suspendido' },
    };

    const config = variants[estado] || variants.activo;
    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
};

export const getParticipantColumns = (): ColumnDef<Participante>[] => [
        {
                id: 'select',
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && 'indeterminate')
                        }
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label="Seleccionar todos"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Seleccionar fila"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'codigo',
                header: 'Código',
                cell: ({ row }) => <span className="font-mono font-medium text-sm">{row.getValue('codigo')}</span>,
            },
            {
                accessorKey: 'nombre',
                header: 'Nombre',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{row.getValue('nombre')}</span>
                    {!row.original.usuario_activo && (
                        <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Usuario Inactivo
                        </Badge>
                    )}
                </div>
                <span className="text-sm text-muted-foreground">{row.original.email}</span>
            </div>
                ),
            },
            {
                accessorKey: 'telefono',
                header: 'Teléfono',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm">{row.getValue('telefono')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'centro_educativo',
                header: 'Centro Educativo',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm">{row.getValue('centro_educativo')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'nivel_educativo',
                header: 'Nivel Educativo',
                cell: ({ row }) => (
                    <span>{row.getValue('nivel_educativo')}</span>
                ),
                filterFn: (row, id, value) => {
                    if (!value || value.length === 0) return true;
                    return value.includes(row.getValue(id));
                },
            },
            {
                accessorKey: 'sede_description',
                header: 'Sede',
                cell: ({ row }) => row.original.sede_description || row.original.sede_name,
            },
            {
                accessorKey: 'fecha_ingreso',
                header: 'Fecha Ingreso',
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="text-sm">{row.getValue('fecha_ingreso')}</span>
                    </div>
                ),
            },
            {
                accessorKey: 'estado',
                header: 'Estado',
                cell: ({ row }) => getEstadoBadge(row.getValue('estado')),
                filterFn: (row, id, value) => {
                    if (!value || value.length === 0) return true;
                    return value.includes(row.getValue(id));
                },
            },
            {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
            <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/internado-fdtc/participantes/${row.original.codigo}/progreso`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Progreso
                </Link>
            </Button>
        ),
        enableSorting: false,
        enableHiding: false,
    },
]

export type { Participante };

