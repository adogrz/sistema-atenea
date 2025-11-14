'use client';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PsychologicalRecordBasicInfo, PsychologicalSessionWithRelations, StudentBasicInfo } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Brain, ClipboardList, FileCheck, FileText, User } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

interface Props {
    session: PsychologicalSessionWithRelations;
    psychological_record: PsychologicalRecordBasicInfo;
    student: StudentBasicInfo;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
    };
}

export default function ShowPsychologicalSession({ session, psychological_record, student, permissions }: Props) {
    const studentName = `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`;

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Inicio', href: '/dashboard' },
            { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
            { title: 'Expedientes Psicológicos', href: '/dashboard/clinical-records/psychological-records' },
            {
                title: `Expediente de ${studentName}`,
                href: route('clinical-records.psychological-records.show', psychological_record.id),
            },
            { title: 'Sesión Psicológica', href: '#' },
        ],
        [psychological_record.id, studentName],
    );

    const pageTitle = 'Sesión Psicológica';
    const age = student?.fecha_nacimiento ? new Date().getFullYear() - new Date(student.fecha_nacimiento).getFullYear() : undefined;

    // Helper para formatear fechas de manera segura
    const formatDate = (dateString: string | null | undefined, formatStr: string = 'PPP'): string => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return format(date, formatStr, { locale: es });
        } catch {
            return dateString;
        }
    };

    // Mostrar toasts de mensajes flash (éxito/error)
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    const handleBack = () => {
        router.get(route('clinical-records.psychological-records.show', psychological_record.id));
    };

    const handleEdit = () => {
        router.get(
            route('clinical-records.psychological-records.sessions.edit', {
                psychological_record: session.psychological_record_id,
                session: session.id,
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
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Brain className="h-5 w-5 text-primary" />
                            </div>
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

                    {/* Sesión */}
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Sesión</h3>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Fecha:</span>
                                <span className="font-medium">{formatDate(session.session_date)}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Psicólogo:</span>
                                <span className="font-medium">{session.psychologist?.name || 'N/A'}</span>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Registrado:</span>
                                <span className="font-medium">{formatDate(session.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contenido de la Sesión */}
                <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-medium">Contenido de la Sesión</h3>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{session.session_content}</p>
                </div>

                {/* Intervenciones */}
                {session.interventions && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Intervenciones</h3>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{session.interventions}</p>
                    </div>
                )}

                {/* Conclusiones */}
                {session.conclusions && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Conclusiones</h3>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{session.conclusions}</p>
                    </div>
                )}

                {/* Consentimiento Informado */}
                {session.consent_form_id && session.consent_form && (
                    <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b border-muted/20 pb-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-medium">Consentimiento Informado</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Responsable:</span>
                                <span className="font-medium">
                                    {session.consent_form.responsible?.nombres_responsable} {session.consent_form.responsible?.apellidos_responsable}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">ID:</span>
                                    <span className="font-medium">#{session.consent_form_id}</span>
                                </div>
                                <a
                                    href={route('clinical-records.consent-forms.file', session.consent_form_id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary underline"
                                >
                                    Ver documento
                                </a>
                            </div>
                            <div className="flex gap-1">
                                <span className="text-muted-foreground">Fecha de Otorgamiento:</span>
                                <span className="font-medium">{formatDate(session.consent_form.granted_at)}</span>
                            </div>
                            {session.consent_form.observations && (
                                <div className="flex gap-1">
                                    <span className="text-muted-foreground">Observaciones:</span>
                                    <span className="font-medium whitespace-pre-wrap">{session.consent_form.observations}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Justificación de cambios (si existe) */}
                {session.change_justification && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 shadow-sm dark:border-amber-800 dark:bg-amber-950">
                        <div className="mb-2 font-medium text-amber-900 dark:text-amber-200">Justificación de cambios</div>
                        <p className="text-sm whitespace-pre-wrap text-amber-800 dark:text-amber-300">{session.change_justification}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
