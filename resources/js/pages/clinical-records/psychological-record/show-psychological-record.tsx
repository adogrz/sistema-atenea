'use client';

import EditAssessmentDialog from '@/components/clinical-records/psychological-record/edit-assessment-dialog';
import { getPsychologicalSessionColumns } from '@/components/clinical-records/psychological-session/psychological-session-columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { PsychologicalRecordWithRelations } from '@/types/clinical-records';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Brain, Calendar, CirclePlus, ClipboardList, FileText, Pencil, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    psychologicalRecord: PsychologicalRecordWithRelations;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
    };
    source?: 'assignments' | 'psychological-records'; // Origen de la navegación
}

export default function ShowPsychologicalRecord({ psychologicalRecord, permissions, source = 'assignments' }: Props) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Breadcrumbs dinámicos según el origen
    const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
        const base = [
            { title: 'Inicio', href: '/dashboard' },
            { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        ];

        if (source === 'psychological-records') {
            return [
                ...base,
                { title: 'Expedientes Psicológicos', href: '/dashboard/clinical-records/psychological-records' },
                { title: 'Detalle', href: '#' },
            ];
        }

        // Por defecto desde assignments
        return [...base, { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' }, { title: 'Expediente Psicológico', href: '#' }];
    }, [source]);

    const student = psychologicalRecord.student;
    const studentName = student
        ? `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`
        : 'N/A';

    const pageTitle = `Expediente Psicológico`;
    const age = student?.fecha_nacimiento ? new Date().getFullYear() - new Date(student.fecha_nacimiento).getFullYear() : undefined;

    const sortedSessions = useMemo(() => {
        if (!psychologicalRecord.psychological_sessions) return [];
        return [...psychologicalRecord.psychological_sessions].sort(
            (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
        );
    }, [psychologicalRecord.psychological_sessions]);

    const columns = useMemo(() => getPsychologicalSessionColumns(), []);

    // Mostrar toasts de mensajes flash (éxito/error)
    const { props: pageProps } = usePage<{ flash?: { success?: string | null; error?: string | null } }>();
    useEffect(() => {
        if (pageProps.flash?.success) toast.success(pageProps.flash.success);
        if (pageProps.flash?.error) toast.error(pageProps.flash.error);
    }, [pageProps.flash?.success, pageProps.flash?.error]);

    const handleNewSession = () => {
        router.get(route('clinical-records.psychological-records.sessions.create', psychologicalRecord.id));
    };

    const handleEditAssessment = () => {
        setIsEditDialogOpen(true);
    };

    const handleConfirmEdit = async (data: { initial_assessment: string | null; justification: string }) => {
        setIsSubmitting(true);

        await new Promise<void>((resolve) => {
            router.patch(
                route('clinical-records.psychological-records.update', psychologicalRecord.id),
                {
                    initial_assessment: data.initial_assessment,
                    justification: data.justification,
                },
                {
                    onSuccess: () => {
                        setIsEditDialogOpen(false);
                    },
                    onError: (errors: Record<string, string>) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(firstError || 'No se pudo actualizar la evaluación inicial.');
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
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                            <p className="text-sm text-muted-foreground">
                                Detalles del expediente psicológico de <span className="font-medium text-foreground">{studentName}</span>
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
                                <span className="font-medium">{psychologicalRecord.student_nie}</span>
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
                                <span className="font-medium">{psychologicalRecord.creator?.name || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Fecha de Creación:</span>
                                <span className="flex items-center gap-1 font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {format(new Date(psychologicalRecord.created_at), 'PPP', { locale: es })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Última Actualización:</span>
                                <span className="font-medium">{format(new Date(psychologicalRecord.updated_at), 'PPP', { locale: es })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluación Inicial */}
                <div className="rounded-lg border bg-card px-6 py-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between border-b border-muted/20 pb-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Evaluación Inicial</h2>
                        </div>
                        {permissions.canUpdate && (
                            <Button variant="outline" size="sm" onClick={handleEditAssessment}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                    </div>
                    {psychologicalRecord.initial_assessment ? (
                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">{psychologicalRecord.initial_assessment}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground italic">Sin evaluación inicial registrada</p>
                    )}
                </div>

                {/* Sesiones Psicológicas */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Sesiones Psicológicas</h2>
                            <p className="text-sm text-muted-foreground">{sortedSessions.length} sesión(es) registrada(s)</p>
                        </div>
                        <Button onClick={handleNewSession}>
                            <CirclePlus className="mr-2 h-4 w-4" />
                            Nueva Sesión
                        </Button>
                    </div>

                    <DataTable
                        columns={columns}
                        data={sortedSessions}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        searchPlaceholder="Buscar por contenido, intervenciones o psicólogo..."
                    />
                </section>

                {/* Modal de edición de evaluación inicial */}
                <EditAssessmentDialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    currentAssessment={psychologicalRecord.initial_assessment || null}
                    onConfirm={handleConfirmEdit}
                    isSubmitting={isSubmitting}
                />
            </div>
        </AppLayout>
    );
}
