'use client';

import { AssignmentForm } from '@/components/clinical-records/assignments/assignment-form';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { RecordType } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { Activity, Stethoscope } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
    { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
    { title: 'Nueva Asignación', href: '/dashboard/clinical-records/assignments/create' },
];

interface Props {
    permissions: {
        canManageMedical: boolean;
        canManagePsychological: boolean;
        canCreate: boolean;
        isManager: boolean;
    };
}

export default function CreateAssignment({ permissions }: Props) {
    // Determinar el tipo de asignación según los permisos del jefe
    const assignmentType: RecordType = useMemo(() => {
        if (permissions.canManageMedical && !permissions.canManagePsychological) {
            return 'medical';
        } else if (permissions.canManagePsychological && !permissions.canManageMedical) {
            return 'psychological';
        }
        return 'medical'; // Por defecto
    }, [permissions.canManageMedical, permissions.canManagePsychological]);

    // Mostrar toasts por mensajes flash
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    const handleCancel = () => {
        router.visit(route('clinical-records.assignments.index'));
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Nueva Asignación" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-lg',
                            assignmentType === 'medical' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30',
                        )}
                    >
                        {assignmentType === 'medical' ? (
                            <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Nueva Asignación</h2>
                        <p className="text-sm text-muted-foreground">
                            Crea una nueva asignación de estudiante a profesional {assignmentType === 'medical' ? 'médico' : 'psicólogo'}
                        </p>
                    </div>
                </div>

                <AssignmentForm assignmentType={assignmentType} onCancel={handleCancel} />
            </div>
        </AppLayout>
    );
}
