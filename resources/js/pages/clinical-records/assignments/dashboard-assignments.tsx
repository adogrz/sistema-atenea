'use client';

import { getManagerColumns, getProfessionalColumns } from '@/components/clinical-records/assignments/assignments-columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AssignmentFilters, type AssignmentWithRelations } from '@/types/clinical-records';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { CirclePlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expediente Clinico', href: '/dashboard/clinical-records' },
    { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
];

interface Props {
    assignments: PaginatedData<AssignmentWithRelations>;
    filters: AssignmentFilters;
    permissions: {
        canManageMedical: boolean;
        canManagePsychological: boolean;
        canCreate: boolean;
        isManager: boolean;
    };
}

export default function DashboardAssignments({ assignments, filters, permissions }: Props) {
    const pageTitle = permissions.isManager ? 'Gestión de Asignaciones' : 'Mis Estudiantes Asignados';
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [search, setSearch] = useState(filters.search || '');

    // Ref para el timeout del debounce (evita memory leaks)
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Determinar qué columnas usar según el rol
    const columns = useMemo(() => {
        return permissions.isManager ? getManagerColumns() : getProfessionalColumns();
    }, [permissions.isManager]);

    // Realizar búsqueda en el servidor
    const performSearch = useCallback(
        (searchValue: string) => {
            router.get(
                route('clinical-records.assignments.index'),
                {
                    ...filters,
                    search: searchValue,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['assignments'],
                },
            );
        },
        [filters],
    );

    // Manejar búsqueda con debounce del lado del servidor
    const handleSearch = useCallback(
        (value: string) => {
            // Actualizar el estado local inmediatamente para feedback visual
            setSearch(value);

            // Limpiar el timeout anterior
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Crear nuevo timeout para la petición al servidor
            searchTimeoutRef.current = setTimeout(() => {
                performSearch(value);
            }, 500);
        },
        [performSearch],
    );

    // Cleanup: limpiar timeout al desmontar el componente
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleCreateAssignment = () => {
        router.visit(route('clinical-records.assignments.create'));
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                    <div>
                        {permissions.canCreate && (
                            <Button className="cursor-pointer space-x-1" onClick={handleCreateAssignment}>
                                <CirclePlus />
                                <span>Nueva Asignación</span>
                            </Button>
                        )}
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={assignments.data}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    globalFilter={search}
                    onGlobalFilterChange={handleSearch}
                    searchPlaceholder="Buscar por estudiante, NIE o profesional..."
                />
            </div>
        </AppLayout>
    );
}
