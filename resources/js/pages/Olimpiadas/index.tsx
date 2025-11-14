import React, { useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Olimpiada, Area, NivelEducativo } from '@/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusCircle, PencilIcon, Trash2Icon, ChevronDown, ChevronRight } from 'lucide-react';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { FasesList } from './FasesList';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface OlimpiadasIndexProps extends PageProps {
    olimpiadas: Olimpiada[];
    areas: Area[];
    nivelesEducativos: NivelEducativo[];
}

import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Olimpiadas' },
];

import { DataTableToolbar } from '@/components/ui/data-table-toolbar';

const Index: React.FC<OlimpiadasIndexProps> = ({ olimpiadas: initialOlimpiadas, areas, nivelesEducativos }) => {
    const { flash } = usePage().props as any;
    const { delete: destroy, processing: deleting } = useForm();
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [selectedYear, setSelectedYear] = React.useState<string>('all');

    const availableYears = useMemo(() => {
        const years = initialOlimpiadas.map(olimpiada => olimpiada.anio);
        return Array.from(new Set(years)).sort((a, b) => b - a);
    }, [initialOlimpiadas]);

    const filteredOlimpiadas = useMemo(() => {
        if (selectedYear === 'all') {
            return initialOlimpiadas;
        }
        return initialOlimpiadas.filter(olimpiada => olimpiada.anio === parseInt(selectedYear));
    }, [selectedYear, initialOlimpiadas]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleDelete = (olimpiada: Olimpiada) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta olimpiada?')) {
            destroy(route('olimpiadas.destroy', olimpiada.id), {
                preserveScroll: true,
            });
        }
    };

    const columns: ColumnDef<Olimpiada>[] = useMemo(() => [
        {
            id: 'expander',
            header: () => null,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => row.toggleExpanded()}
                    disabled={!row.original.fases || row.original.fases.length === 0}
                >
                    {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
            ),
        },
        {
            accessorKey: 'nombre',
            header: 'Nombre',
            cell: ({ row }) => (
                <Link href={route('olimpiadas.edit', row.original.id)} className="font-medium text-primary hover:underline">
                    {row.original.nombre}
                </Link>
            ),
        },
        {
            accessorKey: 'descripcion',
            header: 'Descripción',
            cell: ({ row }) => <p className="text-sm text-muted-foreground truncate max-w-xs">{row.original.descripcion}</p>
        },
        {
            id: 'year',
            header: 'Año',
            cell: ({ row }) => (
                <Badge variant="outline" className="w-fit">
                    {row.original.anio}
                </Badge>
            ),
        },
        {
            accessorKey: 'area.name',
            id: 'area',
            header: 'Área',
            cell: ({ row }) => <Badge variant="secondary">{row.original.area?.name}</Badge>,
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: 'nivel_educativo.nivel',
            id: 'nivel',
            header: 'Nivel',
            cell: ({ row }) => row.original.nivel_educativo?.nivel || 'N/A',
            meta: {
                title: 'Nivel',
            },
        },
        {
            accessorKey: 'tipo',
            header: 'Tipo',
            cell: ({ row }) => {
                const tipo = row.original.tipo;
                return (
                    <Badge
                        className={tipo === 'nivel' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                        {tipo === 'nivel' ? 'Por Nivel' : 'Olímpico'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'activa',
            header: 'Estado',
            cell: ({ row }) => (
                <Badge
                    className={row.original.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {row.original.activa ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const olimpiada = row.original;
                return (
                    <div className="flex items-center space-x-2">
                        <Button asChild variant="outline" size="icon">
                            <Link href={route('olimpiadas.edit', olimpiada.id)}>
                                <PencilIcon className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(olimpiada)}
                            disabled={deleting}
                        >
                            <Trash2Icon className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ], [deleting]);

    const renderRowSubComponent = ({ row }: { row: any }) => (
        <div className="p-4 bg-muted/50">
            <FasesList fases={row.original.fases} />
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Olimpiadas" />

            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Olimpiadas</h1>
                        <p className="text-muted-foreground">
                            Aquí puedes ver, crear y gestionar todas las olimpiadas.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filtrar por año..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Años</SelectItem>
                                {availableYears.map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button asChild>
                            <Link href={route('olimpiadas.create')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Olimpiada
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-4">
                    <DataTable
                        columns={columns}
                        data={filteredOlimpiadas}
                        renderRowSubComponent={renderRowSubComponent}
                        getRowCanExpand={(row) => row.original.fases && row.original.fases.length > 0}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        toolbarOptions={{
                            searchableColumnId: 'nombre',
                            filters: [
                                {
                                    columnId: 'area',
                                    title: 'Área',
                                    options: areas.map(area => ({ label: area.name, value: area.name })),
                                },
                                {
                                    columnId: 'nivel',
                                    title: 'Nivel',
                                    options: nivelesEducativos.map(nivel => ({ label: nivel.nivel, value: nivel.nivel })),
                                },
                            ],
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;