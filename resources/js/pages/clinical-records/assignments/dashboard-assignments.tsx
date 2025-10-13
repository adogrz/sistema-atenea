'use client';

import { getManagerColumns, getProfessionalColumns } from '@/components/clinical-records/assignments/assignments-columns';
import { AssignmentsDialogs } from '@/components/clinical-records/assignments/assignments-dialogs';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { AssignmentsProvider, useAssignments } from '@/contexts/clinical-records/assignments/assignmets-context';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AssignmentFilters, type AssignmentWithRelations } from '@/types/clinical-records';
import { type PaginatedData } from '@/types/pagination';
import { Head, router } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { CirclePlus } from 'lucide-react';
import { useMemo, useState } from 'react';

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

function DashboardAssignmentsContent({ assignments, permissions }: Props) {
    const pageTitle = permissions.isManager ? 'Gestión de Asignaciones' : 'Mis Estudiantes Asignados';
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const { setOpen } = useAssignments();

    // Determinar qué columnas usar según el rol
    const columns = useMemo(() => {
        return permissions.isManager ? getManagerColumns() : getProfessionalColumns();
    }, [permissions.isManager]);

    // Determinar el tipo de asignación según los permisos del jefe
    const assignmentType = useMemo(() => {
        if (permissions.canManageMedical && !permissions.canManagePsychological) {
            return 'medical' as const;
        } else if (permissions.canManagePsychological && !permissions.canManageMedical) {
            return 'psychological' as const;
        }
        return 'medical' as const; // Por defecto
    }, [permissions.canManageMedical, permissions.canManagePsychological]);

    // Función para recargar los datos desde Inertia
    const handleRefresh = () => {
        router.reload({ only: ['assignments'] });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                    <div>
                        {permissions.canCreate && (
                            <Button className="cursor-pointer space-x-1" onClick={() => setOpen('add')}>
                                <CirclePlus />
                                <span>Nueva Asignación</span>
                            </Button>
                        )}
                    </div>
                </div>
                <DataTable columns={columns} data={assignments.data} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                <AssignmentsDialogs onRefresh={handleRefresh} assignmentType={assignmentType} />
            </div>
        </AppLayout>
    );
}

export default function DashboardAssignments(props: Props) {
    return (
        <AssignmentsProvider>
            <DashboardAssignmentsContent {...props} />
        </AssignmentsProvider>
    );
}
