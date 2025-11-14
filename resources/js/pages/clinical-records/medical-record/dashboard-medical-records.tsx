'use client';

import { getMedicalRecordColumns } from '@/components/clinical-records/medical-record/medical-record-columns';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type MedicalRecordWithRelations } from '@/types/clinical-records';
import { Head, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Stethoscope } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expedientes Médicos', href: '/dashboard/clinical-records/medical-records' },
];

interface Props {
    medicalRecords: MedicalRecordWithRelations[];
}

export default function IndexMedicalRecords({ medicalRecords }: Props) {
    const pageTitle = 'Expedientes Médicos';
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns = useMemo(() => getMedicalRecordColumns(), []);

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
                            <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                            <p className="text-sm text-muted-foreground">Gestión y visualización de todos los expedientes médicos del sistema</p>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="mb-4 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Total Expedientes</div>
                        <div className="text-2xl font-bold">{medicalRecords.length}</div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Con Antecedentes</div>
                        <div className="text-2xl font-bold">{medicalRecords.filter((r) => r.general_background).length}</div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Total Consultas</div>
                        <div className="text-2xl font-bold">{medicalRecords.reduce((acc, r) => acc + (r.medical_consultations?.length || 0), 0)}</div>
                    </div>
                    <div className="rounded-lg border bg-card px-4 py-3 shadow-sm">
                        <div className="text-sm font-medium text-muted-foreground">Creados Este Mes</div>
                        <div className="text-2xl font-bold">
                            {
                                medicalRecords.filter((r) => {
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
                    data={medicalRecords}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    searchPlaceholder="Buscar por NIE, estudiante o creador..."
                />
            </div>
        </AppLayout>
    );
}
