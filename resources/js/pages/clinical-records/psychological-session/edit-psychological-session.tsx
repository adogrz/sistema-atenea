'use client';

import { EditPsychologicalSessionForm } from '@/components/clinical-records/psychological-session/edit-psychological-session-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PsychologicalSession, UpdatePsychologicalSessionData } from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    session: PsychologicalSession & {
        psychological_record: {
            id: number;
            student_nie: string;
            student: {
                nie: string;
                primer_nombre: string;
                segundo_nombre?: string;
                primer_apellido: string;
                segundo_apellido?: string;
            };
        };
    };
}

export default function EditPsychologicalSession({ session }: Props) {
    const pageTitle = 'Editar Sesión Psicológica';

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        { title: 'Expedientes Psicológicos', href: '/dashboard/clinical-records/psychological-records' },
        {
            title: `Expediente de ${session.psychological_record.student.primer_nombre} ${session.psychological_record.student.primer_apellido}`,
            href: `/dashboard/clinical-records/psychological-records/${session.psychological_record.id}`,
        },
        {
            title: 'Sesión',
            href: `/dashboard/clinical-records/psychological-records/${session.psychological_record.id}/sessions/${session.id}`,
        },
        { title: 'Editar', href: '#' },
    ];

    const handleSubmit = (data: UpdatePsychologicalSessionData) => {
        router.put(
            route('clinical-records.psychological-records.sessions.update', {
                psychological_record: session.psychological_record.id,
                session: session.id,
            }),
            {
                session_date: data.session_date,
                session_content: data.session_content,
                interventions: data.interventions,
                conclusions: data.conclusions,
                change_justification: data.change_justification,
            },
            {
                onSuccess: () => {
                    toast.success('Sesión psicológica actualizada exitosamente');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    toast.error('Error al actualizar la sesión psicológica. Por favor revise los campos.');
                },
            },
        );
    };

    const handleCancel = () => {
        router.visit(
            route('clinical-records.psychological-records.sessions.show', {
                psychological_record: session.psychological_record.id,
                session: session.id,
            }),
        );
    };

    const getStudentFullName = () => {
        const student = session.psychological_record.student;
        const nombres = [student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ');
        const apellidos = [student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ');
        return `${nombres} ${apellidos}`.trim();
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Brain className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Editar Sesión Psicológica</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Modificando sesión de <span className="font-medium">{getStudentFullName()}</span>
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Alerta de auditoría */}
                            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-amber-900 dark:text-amber-100">Importante: Justificación Requerida</AlertTitle>
                                <AlertDescription className="text-amber-800 dark:text-amber-200">
                                    Todos los cambios en sesiones psicológicas quedan registrados en el historial de auditoría. Debe proporcionar una
                                    justificación detallada para la modificación de esta sesión.
                                </AlertDescription>
                            </Alert>

                            {/* Formulario de edición */}
                            <EditPsychologicalSessionForm
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                defaultValues={{
                                    session_date: session.session_date,
                                    session_content: session.session_content,
                                    interventions: session.interventions || undefined,
                                    conclusions: session.conclusions || undefined,
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
