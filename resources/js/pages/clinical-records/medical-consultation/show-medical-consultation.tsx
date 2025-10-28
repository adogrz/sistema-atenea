'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalConsultationWithRelations, MedicalRecordBasicInfo, StudentBasicInfo } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, ClipboardList, FileCheck, FileText, Pencil, Stethoscope, User } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

interface Props {
    consultation: MedicalConsultationWithRelations;
    medical_record: MedicalRecordBasicInfo;
    student: StudentBasicInfo;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
    };
}

export default function ShowMedicalConsultation({ consultation, medical_record, student, permissions }: Props) {
    const studentName = `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`;

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Inicio', href: '/dashboard' },
            { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
            { title: 'Expedientes Médicos', href: '/dashboard/clinical-records/medical-records' },
            {
                title: `Expediente de ${studentName}`,
                href: route('clinical-records.medical-records.show', medical_record.id),
            },
            { title: 'Consulta Médica', href: '#' },
        ],
        [medical_record.id, studentName],
    );

    const pageTitle = 'Consulta Médica';
    const age = student?.fecha_nacimiento ? new Date().getFullYear() - new Date(student.fecha_nacimiento).getFullYear() : undefined;

    // Mostrar toasts de mensajes flash (éxito/error)
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    const handleBack = () => {
        router.get(route('clinical-records.medical-records.show', medical_record.id));
    };

    const handleEdit = () => {
        // TODO: Implementar edición de consulta
        toast.info('La edición de consultas estará disponible próximamente');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${pageTitle} - ${studentName}`} />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 border-b border-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Consulta del <span className="font-medium text-foreground">{format(new Date(consultation.consultation_date), 'PPP', { locale: es })}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {permissions.canUpdate && (
                                <Button variant="outline" onClick={handleEdit}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Button>
                            )}
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al Expediente
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Información general */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Estudiante */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <User className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Información del Paciente</h2>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nombre:</span>
                                <span className="font-medium">{studentName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">NIE:</span>
                                <span className="font-medium">{student.nie}</span>
                            </div>
                            {student?.fecha_nacimiento && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Edad:</span>
                                    <span className="font-medium">{age} años</span>
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

                    {/* Consulta */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Datos de la Consulta</h2>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Médico:</span>
                                <span className="font-medium">{consultation.doctor?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha de Consulta:</span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(consultation.consultation_date), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Registrada el:</span>
                                <span className="font-medium">{format(new Date(consultation.created_at), 'PPP', { locale: es })}</span>
                            </div>
                            {consultation.updated_at !== consultation.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Última Actualización:</span>
                                    <span className="font-medium">{format(new Date(consultation.updated_at), 'PPP', { locale: es })}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Diagnóstico */}
                <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Diagnóstico</h2>
                        <Badge variant="secondary">Requerido</Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{consultation.diagnosis}</p>
                </div>

                {/* Tratamiento */}
                {consultation.treatment && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Tratamiento</h2>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{consultation.treatment}</p>
                    </div>
                )}

                {/* Observaciones */}
                {consultation.observations && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Observaciones</h2>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{consultation.observations}</p>
                    </div>
                )}

                {/* Consentimiento Informado */}
                {consultation.consent_form_id && consultation.consent_form && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Consentimiento Informado</h2>
                            <Badge>Requerido (Menor de Edad)</Badge>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID del Consentimiento:</span>
                                <span className="font-medium">#{consultation.consent_form_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Responsable:</span>
                                <span className="font-medium">
                                    {consultation.consent_form.responsible
                                        ? `${consultation.consent_form.responsible.nombres_responsable} ${consultation.consent_form.responsible.apellidos_responsable}`
                                        : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha de Otorgamiento:</span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(consultation.consent_form.granted_at), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            {consultation.consent_form.observations && (
                                <div>
                                    <span className="text-muted-foreground">Observaciones del Consentimiento:</span>
                                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{consultation.consent_form.observations}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Justificación de cambios (si existe) */}
                {consultation.change_justification && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm dark:border-amber-800 dark:bg-amber-950">
                        <div className="mb-4 flex items-center gap-2 border-b border-amber-200 pb-2 dark:border-amber-800">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">Justificación de Cambios</h2>
                            <Badge variant="outline" className="border-amber-600 text-amber-600 dark:border-amber-400 dark:text-amber-400">
                                Auditoría
                            </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-amber-800 dark:text-amber-200">{consultation.change_justification}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

