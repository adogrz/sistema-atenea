'use client';

import { getMedicalConsultationColumns } from '@/components/clinical-records/medical-consultation/medical-consultation-columns';
import EditBackgroundDialog from '@/components/clinical-records/medical-record/edit-background-dialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalRecordWithRelations } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CirclePlus, ClipboardList, Download, FileText, Pencil, Stethoscope, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    medicalRecord: MedicalRecordWithRelations;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
    };
    source?: 'assignments' | 'medical-records'; // Origen de la navegación
}

export default function ShowMedicalRecord({ medicalRecord, permissions, source = 'assignments' }: Props) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Breadcrumbs dinámicos según el origen
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        if (source === 'medical-records') {
            return [
                { title: 'Inicio', href: '/dashboard' },
                { title: 'Expedientes Médicos', href: '/dashboard/clinical-records/medical-records' },
                { title: 'Detalle', href: '#' },
            ];
        }

        // Por defecto desde assignments
        return [
            { title: 'Inicio', href: '/dashboard' },
            { title: 'Mis Estudiantes', href: '/dashboard/clinical-records/assignments' },
            { title: 'Expediente Médico', href: '#' },
        ];
    }, [source]);

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

    // Mostrar toasts de mensajes flash (éxito/error)
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    const handleNewConsultation = () => {
        router.get(route('clinical-records.medical-records.consultations.create', medicalRecord.id));
    };

    const handleDownloadReport = () => {
        window.open(route('clinical-records.medical-records.report', medicalRecord.id), '_blank');
    };

    const handleEditBackground = () => {
        setIsEditDialogOpen(true);
    };

    const handleConfirmEdit = async (data: { general_background: string | null; justification: string }) => {
        setIsSubmitting(true);

        await new Promise<void>((resolve) => {
            router.patch(
                route('clinical-records.medical-records.update', medicalRecord.id),
                {
                    general_background: data.general_background,
                    justification: data.justification,
                },
                {
                    onSuccess: () => {
                        setIsEditDialogOpen(false);
                    },
                    onError: (errors: Record<string, string>) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(firstError || 'No se pudo actualizar los antecedentes médicos.');
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                        resolve();
                    },
                    preserveScroll: true,
                },
            );
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${pageTitle} - ${studentName}`} />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 border-b border-muted/30 pb-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                        <Button variant="secondary" onClick={handleDownloadReport} className="w-full md:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </Button>
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
                    <div className="mb-4 flex items-center justify-between border-b border-muted/20 pb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Antecedentes Médicos</h2>
                        </div>
                        {permissions.canUpdate && (
                            <Button variant="outline" size="sm" onClick={handleEditBackground}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}
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

                {/* Modal de edición de antecedentes */}
                <EditBackgroundDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    currentBackground={medicalRecord.general_background || null}
                    onConfirm={handleConfirmEdit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </AppLayout>
    );
}
