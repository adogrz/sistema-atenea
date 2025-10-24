import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DefinicionEvaluacion } from '@/types/olympics';
import { BreadcrumbItem } from '@/types';
import { toast } from 'sonner';
import { ArrowUpDown, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
    ColumnDef,
} from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';

interface DefinicionesEvaluacionIndexProps {
    definiciones: DefinicionEvaluacion[];
}

const Index: React.FC<DefinicionesEvaluacionIndexProps> = ({ definiciones }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Olimpiadas', href: route('olimpiadas.index') }, // Placeholder route
        { title: 'Definiciones de Evaluación', href: route('definiciones-evaluacion.index') },
    ];

    const { delete: inertiaDelete, processing } = useForm({});

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta definición de evaluación? Esta acción no se puede deshacer.')) {
            inertiaDelete(route('definiciones-evaluacion.destroy', id), {
                onSuccess: () => {
                    toast.success('Definición de evaluación eliminada exitosamente.');
                },
                onError: (error) => {
                    console.error('Error al eliminar la definición:', error);
                    toast.error('Error al eliminar la definición de evaluación.');
                },
            });
        }
    };

    const columns: ColumnDef<DefinicionEvaluacion>[] = [
        {
            accessorKey: 'nombre',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue('nombre')}</div>,
        },
        {
            accessorKey: 'version',
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Versión
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue('version')}</div>,
        },
        {
            accessorKey: 'descripcion',
            header: 'Descripción',
            cell: ({ row }) => <div>{row.getValue('descripcion')}</div>,
        },
        {
            accessorKey: 'estado',
            header: 'Estado',
            cell: ({ row }) => {
                const estado = row.getValue('estado');
                let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
                if (estado === 'publicada') variant = 'default';
                else if (estado === 'borrador') variant = 'secondary';
                else if (estado === 'archivada') variant = 'destructive';
                return <Badge variant={variant}>{String(estado)}</Badge>;
            },
        },
        {
            accessorKey: 'bloqueada',
            header: 'Bloqueada',
            cell: ({ row }) => {
                const bloqueada = row.getValue('bloqueada');
                return <Badge variant={bloqueada ? 'default' : 'outline'}>{bloqueada ? 'Sí' : 'No'}</Badge>;
            },
        },
        {
            accessorKey: 'items_definidos',
            header: 'Ítems',
            cell: ({ row }) => {
                const items = row.original.items_definidos; // Access directly from original row data
                return <div>{items ? items.length : 0}</div>;
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            header: 'Acciones',
            cell: ({ row }) => {
                const definicion = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={route('definiciones-evaluacion.edit', definicion.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => handleDelete(definicion.id)}
                                disabled={processing}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Definiciones de Evaluación" />
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-6 mt-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Definiciones de Evaluación</h2>
                        <p className="text-muted-foreground">
                            Gestiona las plantillas de evaluación para las fases de las olimpiadas.
                        </p>
                    </div>
                    <Link href={route('definiciones-evaluacion.create')}>
                        <Button>Crear Nueva Definición</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Definiciones</CardTitle>
                        <CardDescription>Definiciones de evaluación existentes en el sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <DataTable columns={columns} data={definiciones} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;
