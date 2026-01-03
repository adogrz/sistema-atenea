import React, { useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Olimpiada, Area, NivelEducativo } from '@/types';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PlusCircle, PencilIcon, Trash2Icon, ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-react-table';
import { FasesList } from './FasesList';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';

interface OlimpiadasIndexProps extends PageProps {
    olimpiadas: Olimpiada[];
    areas: Area[];
    nivelesEducativos: NivelEducativo[];
    filters: {
        anio?: string;
    };
}

import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Olimpiadas' },
];

const Index: React.FC<OlimpiadasIndexProps> = ({ olimpiadas, areas, nivelesEducativos, filters }) => {
    const { flash, auth } = usePage().props as PageProps;
    const userPermissions = auth.user?.permissions || [];

    const canCreateOlimpiada = userPermissions.includes('olimpiadas:create');
    const canEditOlimpiada = userPermissions.includes('olimpiadas:edit');
    const canDeleteOlimpiada = userPermissions.includes('olimpiadas:delete');
    const { delete: destroy, processing: deleting } = useForm();
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [selectedYear, setSelectedYear] = React.useState<string>(filters.anio || new Date().getFullYear().toString());

    const availableYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = new Set<number>();
        // Añadir años de las olimpiadas existentes
        olimpiadas.forEach(o => years.add(o.anio));
        // Añadir rango de años alrededor del actual
        for (let i = currentYear - 5; i <= currentYear + 1; i++) {
            years.add(i);
        }
        return Array.from(years).sort((a, b) => b - a);
    }, [olimpiadas]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleYearChange = (year: string) => {
        setSelectedYear(year);
        router.get(route('olimpiadas.index', { anio: year === 'all' ? undefined : year }), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                    }}
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
            cell: ({ row }) => <p className="text-sm text-muted-foreground truncate max-w-md">{row.original.descripcion}</p>
        },
        {
            accessorKey: 'anio',
            header: 'Año',
            cell: ({ row }) => (
                <Badge variant="outline">
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
            cell: ({ row }) => {
                return <Badge>{row.original.nivel_educativo?.nivel || 'N/A'}</Badge>;
            },
        },
        {
            accessorKey: 'tipo',
            header: 'Tipo',
            cell: ({ row }) => {
                const tipo = row.original.tipo;
                return (
                    <Badge variant="outline"
                        className={tipo === 'nivel' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-purple-600 bg-purple-50 text-purple-700'}>
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
                    className={row.original.activa ? 'border-green-600 bg-green-50 text-green-700' : 'border-red-600 bg-red-50 text-red-700'}>
                    {row.original.activa ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const olimpiada = row.original;
                return (
                    <div className="flex items-center space-x-1">
                        {canEditOlimpiada ? (
                            <Button asChild variant="outline" size="icon">
                                <Link href={route('olimpiadas.edit', olimpiada.id)}>
                                    <PencilIcon className="h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button asChild variant="outline" size="icon">
                                <Link href={route('olimpiadas.edit', olimpiada.id)}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        {canDeleteOlimpiada && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(olimpiada);
                                }}
                                disabled={deleting}
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ], [deleting, canEditOlimpiada, canDeleteOlimpiada]);

    const renderRowSubComponent = ({ row }: { row: any }) => (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-l-4 border-primary">
            <FasesList fases={row.original.fases} olimpiadaId={row.original.id} />
        </div>
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Olimpiadas" />

            <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Olimpiadas</h1>
                        <p className="text-muted-foreground">
                            Aquí puedes ver, crear y gestionar todas las olimpiadas.
                        </p>
                    </div>
                    <div className="flex w-full sm:w-auto items-center space-x-2">
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Filtrar por año..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Años</SelectItem>
                                {availableYears.map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {canCreateOlimpiada && (
                            <Button asChild className="w-full sm:w-auto">
                                <Link href={route('olimpiadas.create')}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Crear Olimpiada
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns}
                            data={olimpiadas}
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;