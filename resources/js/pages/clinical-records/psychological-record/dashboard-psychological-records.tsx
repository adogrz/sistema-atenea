'use client';

import { getPsychologicalRecordColumns } from '@/components/clinical-records/psychological-record/psychological-record-columns';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type PsychologicalRecordWithRelations } from '@/types/clinical-records';
import { Head, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Brain } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
    { title: 'Expedientes Psicológicos', href: '/dashboard/clinical-records/psychological-records' },
];

interface Props {
    psychologicalRecords: PsychologicalRecordWithRelations[];
}

export default function IndexPsychologicalRecords({ psychologicalRecords }: Props) {
    const pageTitle = 'Expedientes Psicológicos';
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns = useMemo(() => getPsychologicalRecordColumns(), []);

    // Mostrar toasts de mensajes flash (éxito/error)
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 border-b border-muted/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                            <p className="text-sm text-muted-foreground">Gestión y visualización de todos los expedientes psicológicos del sistema</p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="mb-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Total Expedientes</div>
                        <div className="text-2xl font-bold">{psychologicalRecords.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Con Evaluación Inicial</div>
                        <div className="text-2xl font-bold">{psychologicalRecords.filter((r) => r.initial_assessment).length}</div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Total Sesiones</div>
                        <div className="text-2xl font-bold">
                            {psychologicalRecords.reduce((acc, r) => acc + (r.psychological_sessions?.length || 0), 0)}
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Creados Este Mes</div>
                        <div className="text-2xl font-bold">
                            {
                                psychologicalRecords.filter((r) => {
                                    const created = new Date(r.created_at);
                                    const now = new Date();
                                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                                }).length
                            }
                        </div>
                    </div>
                </div>

                {/* Tabla de expedientes */}
                <DataTable
                    columns={columns}
                    data={psychologicalRecords}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    searchPlaceholder="Buscar por NIE, estudiante o creador..."
                />
            </div>
        </AppLayout>
    );
}
