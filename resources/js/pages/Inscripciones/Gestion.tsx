import React, { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps, BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { InscripcionOlimpiada, Estudiante, Olimpiada } from '@/types';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';

interface EstadoInscripcion {
    id: number;
    nombre: string;
}

interface InscripcionOlimpiadaWithRelations extends InscripcionOlimpiada {
    id: number;
    estudiante: Estudiante;
    olimpiada: Olimpiada;
    estado: EstadoInscripcion;
    created_at: string;
}

interface InscripcionesGestionProps extends PageProps {
    inscripciones: InscripcionOlimpiadaWithRelations[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
];

const Gestion: React.FC<InscripcionesGestionProps> = ({ inscripciones: initialInscripciones }) => {
    const { flash } = usePage().props as any;
    const { delete: destroy } = useForm();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleDelete = (inscripcion: InscripcionOlimpiadaWithRelations) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta inscripción?')) {
            destroy(route('inscripciones.destroy', inscripcion.id), {
                preserveScroll: true,
            });
        }
    };

    const columns: ColumnDef<InscripcionOlimpiadaWithRelations>[] = useMemo(() => [
        {
            accessorKey: 'estudiante.nombre_completo',
            header: 'Estudiante',
            cell: ({ row }) => row.original.estudiante.nombre_completo,
        },
        {
            accessorKey: 'olimpiada.nombre',
            header: 'Olimpiada',
            cell: ({ row }) => row.original.olimpiada.nombre,
        },
        {
            accessorKey: 'estado.nombre',
            header: 'Estado',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.estado.nombre}</Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Fecha de Inscripción',
            cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Inscripciones" />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestión de Inscripciones</h1>
                        <p className="text-muted-foreground">
                            Administra las inscripciones de estudiantes a las olimpiadas.
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <DataTable
                        columns={columns}
                        data={initialInscripciones}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        toolbarOptions={{
                            searchableColumnId: 'estudiante',
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default Gestion;
