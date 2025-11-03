'use client';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalConsultationWithRelations, MedicalRecordBasicInfo, StudentBasicInfo } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { ClipboardList, FileCheck, FileText, User } from 'lucide-react';
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
        router.get(
            route('clinical-records.medical-records.consultations.edit', {
                medical_record: consultation.medical_record_id,
                consultation: consultation.id,
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${pageTitle} - ${studentName}`} />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Encabezado */}
                <div className="flex flex-col gap-2 border-b border-muted/30 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold">{pageTitle}</h1>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleBack}>
                                Volver
                            </Button>
                            {permissions.canUpdate && <Button onClick={handleEdit}>Editar</Button>}
                        </div>
                    </div>
                </div>

                {/* Información general */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Estudiante */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <User className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Estudiante</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Nombre:</span>
                                <span className="font-medium">{studentName}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">NIE:</span>
                                <span className="font-medium">{student.nie}</span>
                            </div>
                            {age !== undefined && (
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Edad:</span>
                                    <span className="font-medium">{age} años</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Consulta */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Consulta</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Fecha:</span>
                                <span className="font-medium">{consultation.consultation_date}</span>
                            </div>
                            {consultation.treatment && (
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Tratamiento:</span>
                                    <span className="font-medium whitespace-pre-wrap">{consultation.treatment}</span>
                                </div>
                            )}
                            {consultation.observations && (
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Observaciones:</span>
                                    <span className="font-medium whitespace-pre-wrap">{consultation.observations}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Diagnóstico */}
                <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-medium">Diagnóstico</h3>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{consultation.diagnosis}</p>
                </div>

                {/* Tratamiento */}
                {consultation.treatment && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-2 font-medium">Tratamiento</div>
                        <p className="text-sm whitespace-pre-wrap">{consultation.treatment}</p>
                    </div>
                )}

                {/* Observaciones */}
                {consultation.observations && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-2 font-medium">Observaciones</div>
                        <p className="text-sm whitespace-pre-wrap">{consultation.observations}</p>
                    </div>
                )}

                {/* Consentimiento Informado */}
                {consultation.consent_form_id && consultation.consent_form && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Consentimiento Informado</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Responsable:</span>
                                <span className="font-medium">
                                    {consultation.consent_form.responsible?.nombres_responsable}{' '}
                                    {consultation.consent_form.responsible?.apellidos_responsable}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="font-medium">#{consultation.consent_form_id}</span>
                                </div>
                                {consultation.consent_form.file_path ? (
                                    <a
                                        href={route('clinical-records.medical-records.consent-forms.file', consultation.consent_form_id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary underline"
                                    >
                                        Ver documento
                                    </a>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Sin archivo adjunto</span>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Fecha de Otorgamiento:</span>
                                <span className="font-medium">{consultation.consent_form.granted_at}</span>
                            </div>
                            {consultation.consent_form.observations && (
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Observaciones:</span>
                                    <span className="font-medium whitespace-pre-wrap">{consultation.consent_form.observations}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Justificación de cambios (si existe) */}
                {consultation.change_justification && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm dark:border-amber-800 dark:bg-amber-950">
                        <div className="mb-2 font-medium text-amber-900 dark:text-amber-200">Justificación de cambios</div>
                        <p className="text-sm whitespace-pre-wrap text-amber-800 dark:text-amber-300">{consultation.change_justification}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
