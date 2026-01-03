import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BreadcrumbItem, PageProps } from '@/types';

const Management: React.FC<PageProps> = () => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Resultados', href: route('resultados.index') },
        { title: 'Gestión de Resultados' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Resultados de Olimpiadas" />
            <div className="p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Gestión de Resultados de Olimpiadas</h1>
                {/* Placeholder for the new student approval interface */}
                <div className="text-center p-8 border-dashed border-2 rounded-md">
                    <p className="text-muted-foreground">Próximamente: Interfaz de aprobación de estudiantes.</p>
                </div>
            </div>
        </AppLayout>
    );
};

export default Management;
