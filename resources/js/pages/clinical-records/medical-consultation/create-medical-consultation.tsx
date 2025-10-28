'use client'

import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useMemo } from 'react';
import { Head } from '@inertiajs/react';

export default function CreateMedicalConsultation({source = 'assignments'}) {
    const pageTitle = "Crear Consulta Médica";
    const BREADCRUMBS: BreadcrumbItem[] = useMemo(() => {
        const base = [
            { title: 'Inicio', href: '/dashboard' },
            { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        ];

        if (source === 'medical-records') {
            return [...base, { title: 'Expedientes Médicos', href: '/dashboard/clinical-records/medical-records' }, { title: 'Detalle', href: '#' }];
        }

        // Por defecto desde assignments
        return [...base, { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' }, { title: 'Expediente Médico', href: '#' }];
    }, [source]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
        </AppLayout>
    )
}
