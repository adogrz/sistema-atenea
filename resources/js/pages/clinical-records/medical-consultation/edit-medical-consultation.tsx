'use client';

import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function EditMedicalConsultation() {
    const pageTitle = 'Editar Consulta Médica';
    return (
        <AppLayout>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6"></div>
        </AppLayout>
    );
}
