import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { Estudiante } from '@/pages/fdtc/selection-student';

export const getInternadoColumns = (
    estudiantes: Estudiante[],
    selectedSedes: string[],
    setSelectedSedes: (sedes: string[]) => void,
    selectedStatus: string[],
    setSelectedStatus: (status: string[]) => void,
    materiasUnicas: string[],
    notaFilters: Record<string, number[]>,
    setNotaFilters: (filters: Record<string, number[]>) => void,
): ColumnDef<Estudiante>[] => {
    // Obtener sedes únicas
    const sedesUnicas = Array.from(
        new Set(estudiantes.map((e) => e.sede_description || e.sede_name)),
    ).sort();

    // Notas disponibles del 0 al 10
    const notasDisponibles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Componente de filtro de notas con checkboxes
    const NotaFilterDropdown = ({ materia }: { materia: string }) => {
        const selectedNotas = notaFilters[materia] || [];

        const handleToggleNota = (nota: number, checked: boolean) => {
            const newSelectedNotas = checked
                ? [...selectedNotas, nota]
                : selectedNotas.filter((n) => n !== nota);

            if (newSelectedNotas.length === 0) {
                const newFilters = { ...notaFilters };
                delete newFilters[materia];
                setNotaFilters(newFilters);
            } else {
                setNotaFilters({
                    ...notaFilters,
                    [materia]: newSelectedNotas,
                });
            }
        };

        const hasActiveFilter = selectedNotas.length > 0;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" data-no-select>
                        <Filter className={`h-4 w-4 ${hasActiveFilter ? 'text-primary' : ''}`} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {notasDisponibles.map((nota) => (
                        <DropdownMenuCheckboxItem
                            key={nota}
                            checked={selectedNotas.includes(nota)}
                            onCheckedChange={(checked) => handleToggleNota(nota, checked)}
                        >
                            {nota}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const baseColumns: ColumnDef<Estudiante>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Seleccionar todos"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Seleccionar fila"
                    onClick={(e) => e.stopPropagation()}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'codigo',
            header: 'Código',
            cell: ({ row }) => (
                <span className="font-mono font-medium text-sm">
                    {row.getValue('codigo')}
                </span>
            ),
            enableSorting: false,
        },
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => <span className="font-medium">{row.getValue('nombre')}</span>,
            enableSorting: false,
        },
        {
            accessorKey: 'email',
            header: 'Correo',
            enableSorting: false,
        },
        {
            id: 'sede',
            accessorFn: (row) => row.sede_description || row.sede_name,
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <span>Sede</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-no-select>
                                <Filter className={`h-4 w-4 ${selectedSedes.length > 0 ? 'text-primary' : ''}`} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {sedesUnicas.map((sede) => (
                                <DropdownMenuCheckboxItem
                                    key={sede}
                                    checked={selectedSedes.includes(sede)}
                                    onCheckedChange={(checked) => {
                                        setSelectedSedes(
                                            checked
                                                ? [...selectedSedes, sede]
                                                : selectedSedes.filter((s) => s !== sede),
                                        );
                                    }}
                                >
                                    {sede}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
            cell: ({ row }) => row.original.sede_description || row.original.sede_name,
            filterFn: (row, id, filterValue: string[]) => {
                if (filterValue.length === 0) return true;
                const sede = row.original.sede_description || row.original.sede_name;
                return filterValue.includes(sede);
            },
            enableSorting: false,
        },
        {
            id:'en_internado',
            accessorKey: 'en_internado',
            header: 'Estado Internado',
            cell: ({ row }) => {
                const enInternado = row.getValue('en_internado') as boolean;

                if (enInternado) {
                    return (
                        <div className="flex flex-col gap-1">
                            <Badge variant="default" className='w-fit bg-green-600 hover:bg-green-700'>
                                En Internado
                            </Badge>
                        </div>
                    );
                }
                return(
                    <Badge variant="outline" className='w-fit'>
                        No Registrado
                    </Badge>
                );
            },
            enableSorting: false,
        },
    ];

    // Solo agregar columnas de materias si hay materias disponibles
    const materiasColumns: ColumnDef<Estudiante>[] = materiasUnicas.length > 0 ? [
        {
            id: 'promedio_general',
            accessorKey: 'promedio_general',
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <span>Promedio General</span>
                    <NotaFilterDropdown materia="promedio_general" />
                </div>
            ),
            cell: ({ row }) => {
                const promedio = row.getValue('promedio_general') as number;
                if (promedio === 0) return <span className="text-muted-foreground">N/A</span>;
                return (
                    <span
                        className={`font-semibold ${
                            promedio >= 7 ? 'text-green-600' : promedio >= 6 ? 'text-yellow-600' : 'text-red-600'
                        }`}
                    >
                        {promedio.toFixed(2)}
                    </span>
                );
            },
            filterFn: (row, id, filterValue: number[]) => {
                if (!filterValue || filterValue.length === 0) return true;
                const nota = row.getValue(id) as number;
                const notaRedondeada = Math.floor(nota);
                return filterValue.includes(notaRedondeada);
            },
            enableSorting: false,
        },
        ...materiasUnicas.map(
            (materia): ColumnDef<Estudiante> => ({
                id: `materia_${materia}`,
                accessorFn: (row) => {
                    const mat = row.materias.find((m) => m.nombre === materia);
                    return mat ? mat.nota : null;
                },
                header: () => (
                    <div className="flex items-center gap-2">
                        <span>{materia}</span>
                        <NotaFilterDropdown materia={materia} />
                    </div>
                ),
                cell: ({ row }) => {
                    const mat = row.original.materias.find((m) => m.nombre === materia);
                    if (!mat) return <span className="text-muted-foreground">N/A</span>;
                    return (
                        <span
                            className={`font-medium ${
                                mat.nota >= 7 ? 'text-green-600' : mat.nota >= 6 ? 'text-yellow-600' : 'text-red-600'
                            }`}
                        >
                            {mat.nota.toFixed(2)}
                        </span>
                    );
                },
                filterFn: (row, id, filterValue: number[]) => {
                    if (!filterValue || filterValue.length === 0) return true;
                    const mat = row.original.materias.find((m) => m.nombre === materia);
                    if (!mat) return false;
                    const notaRedondeada = Math.floor(mat.nota);
                    return filterValue.includes(notaRedondeada);
                },
                enableSorting: false,
            }),
        ),
    ] : [];

    return [...baseColumns, ...materiasColumns];
};