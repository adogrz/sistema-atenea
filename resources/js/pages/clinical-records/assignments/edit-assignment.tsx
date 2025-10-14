'use client';

import { AssignmentForm } from '@/components/clinical-records/assignments/assignment-form';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { AssignmentWithRelations } from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { Activity, Stethoscope } from 'lucide-react';

interface Props {
    assignment: AssignmentWithRelations;
}

export default function EditAssignment({ assignment }: Props) {
    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
        { title: 'Editar Asignación', href: `/dashboard/clinical-records/assignments/${assignment.id}/edit` },
    ];

    const handleCancel = () => {
        router.visit(route('clinical-records.assignments.index'));
    };

    // Obtener nombre completo del estudiante
    const studentFullName = assignment.student
        ? [assignment.student.primer_nombre, assignment.student.segundo_nombre, assignment.student.primer_apellido, assignment.student.segundo_apellido].filter(Boolean).join(' ')
        : 'Estudiante';

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Editar Asignación" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-lg',
                            assignment.type === 'medical' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                        )}
                    >
                        {assignment.type === 'medical' ? (
                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Editar Asignación</h2>
                        <p className="text-sm text-muted-foreground">
                            Modifica la asignación de <span className="font-medium text-foreground">{studentFullName}</span>
                        </p>
                    </div>
                </div>

                <AssignmentForm currentAssignment={assignment} assignmentType={assignment.type} onCancel={handleCancel} />
            </div>
        </AppLayout>
    );
}
