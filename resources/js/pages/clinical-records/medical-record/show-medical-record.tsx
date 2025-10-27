'use client';

import { getMedicalConsultationColumns } from '@/components/clinical-records/medical-consultation/medical-consultation-columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalRecordWithRelations } from '@/types/clinical-records';
import { Head } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CirclePlus, ClipboardList, FileText, Stethoscope, User } from 'lucide-react';
import { useMemo, useState } from 'react';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
    { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
    { title: 'Expediente Médico', href: '#' },
];

interface Props {
    medicalRecord: MedicalRecordWithRelations;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
    };
}

export default function ShowMedicalRecord({ medicalRecord }: Props) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const student = medicalRecord.student;
    const studentName = student
        ? `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`
        : 'N/A';

    const pageTitle = `Expediente Médico`;
    const age = student?.fecha_nacimiento ? new Date().getFullYear() - new Date(student.fecha_nacimiento).getFullYear() : undefined;

    const sortedConsultations = useMemo(() => {
        if (!medicalRecord.medical_consultations) return [];
        return [...medicalRecord.medical_consultations].sort(
            (a, b) => new Date(b.consultation_date).getTime() - new Date(a.consultation_date).getTime(),
        );
    }, [medicalRecord.medical_consultations]);

    const columns = useMemo(() => getMedicalConsultationColumns(), []);

    const handleNewConsultation = () => {
        console.log('Agregar nueva consulta');
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={`${pageTitle} - ${studentName}`} />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 border-b border-muted/30 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                            <p className="text-sm text-muted-foreground">
                                Detalles del expediente médico de <span className="font-medium text-foreground">{studentName}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información general */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Estudiante */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <User className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Información del Estudiante</h2>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nombre:</span>
                                <span className="font-medium">{studentName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">NIE:</span>
                                <span className="font-medium">{medicalRecord.student_nie}</span>
                            </div>
                            {student?.fecha_nacimiento && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Fecha de Nacimiento:</span>
                                    <span className="font-medium">
                                        {format(new Date(student.fecha_nacimiento), 'dd/MM/yyyy')}
                                        {age && ` (${age} años)`}
                                    </span>
                                </div>
                            )}
                            {student?.sexo && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sexo:</span>
                                    <span className="font-medium">{student.sexo === 'M' ? 'Femenino' : 'Masculino'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expediente */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Datos del Expediente</h2>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Creado por:</span>
                                <span className="font-medium">{medicalRecord.creator?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha de Creación:</span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(medicalRecord.created_at), 'PPP', { locale: es })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Última Actualización:</span>
                                <span className="font-medium">{format(new Date(medicalRecord.updated_at), 'PPP', { locale: es })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Antecedentes Médicos */}
                <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Antecedentes Médicos</h2>
                    </div>
                    {medicalRecord.general_background ? (
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{medicalRecord.general_background}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Sin antecedentes registrados</p>
                    )}
                </div>

                {/* Consultas Médicas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Consultas Médicas</h2>
                            <p className="text-sm text-muted-foreground">{sortedConsultations.length} consulta(s) registrada(s)</p>
                        </div>
                        <Button onClick={handleNewConsultation}>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Nueva Consulta
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={sortedConsultations}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        searchPlaceholder="Buscar por diagnóstico, tratamiento o médico..."
                    />
                </section>
            </div>
        </AppLayout>
    );
}
