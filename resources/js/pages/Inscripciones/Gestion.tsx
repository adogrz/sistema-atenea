import React, { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { InscripcionOlimpiada, Estudiante, Olimpiada, FaseOlimpiada, EstadoInscripcion } from '@/types';
import { ColumnDef, ColumnFiltersState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { DataTableToolbar } from '@/components/ui/data-table-toolbar';

interface InscripcionOlimpiadaWithRelations extends InscripcionOlimpiada {
    estudiante: Estudiante;
    olimpiada: Olimpiada;
    fase_olimpiada: FaseOlimpiada;
    estado_inscripcion: EstadoInscripcion;
}

interface InscripcionesGestionProps extends PageProps {
    inscripciones: InscripcionOlimpiadaWithRelations[];
}

const breadcrumbs = [
    { label: 'Inicio', href: route('dashboard') },
    { label: 'Inscripciones', href: route('inscripciones.index') },
    { label: 'Gestión de Inscripciones' },
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
            accessorKey: 'fase_olimpiada.nombre',
            header: 'Fase',
            cell: ({ row }) => row.original.fase_olimpiada.nombre,
        },
        {
            accessorKey: 'estado_inscripcion.nombre',
            header: 'Estado',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.estado_inscripcion.nombre}</Badge>
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
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('inscripciones.show', row.original.id)}>
                            Ver Detalles
                        </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(row.original)}>
                        Eliminar
                    </Button>
                </div>
            ),
        },
    ], []);

    return (
        <AppLayout>
            <Head title="Gestión de Inscripciones" />
            <div className="p-4 md:p-6">
                <Breadcrumb>
                    <BreadcrumbList>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                            </React.Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="flex items-center justify-between my-4">
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
                            // You might want to add filters for olimpiada, fase, estado_inscripcion here
                            areas: [], // Placeholder, as areas are not directly part of InscripcionOlimpiada
                            niveles: [], // Placeholder
                        }}
                    />
                </div>
            </div>
        </AppLayout>
    );
};

export default Gestion;
