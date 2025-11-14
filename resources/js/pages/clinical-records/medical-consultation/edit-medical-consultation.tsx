'use client';

import { EditMedicalConsultationForm } from '@/components/clinical-records/medical-consultation/edit-medical-consultation-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalRecordBasicInfo, StudentBasicInfo, UpdateMedicalConsultationData } from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, Calendar, Clock, FileEdit, Info, Stethoscope, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MedicalConsultation {
    id: number;
    medical_record_id: number;
    doctor_id: number;
    doctor_name: string;
    consent_form_id: number | null;
    consultation_date: string;
    diagnosis: string;
    treatment: string | null;
    observations: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    consultation: MedicalConsultation;
    medical_record: MedicalRecordBasicInfo;
    student: StudentBasicInfo;
    permissions: {
        canUpdate: boolean;
    };
}

export default function EditMedicalConsultation({ consultation, medical_record, student }: Props) {
    const pageTitle = 'Editar Consulta Médica';

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        { title: 'Expedientes Médicos', href: '/dashboard/clinical-records/medical-records' },
        {
            title: `Expediente de ${student.primer_nombre} ${student.primer_apellido}`,
            href: `/dashboard/clinical-records/medical-records/${medical_record.id}`,
        },
        {
            title: 'Consulta Médica',
            href: `/dashboard/clinical-records/medical-records/${medical_record.id}/consultations/${consultation.id}`,
        },
        { title: 'Editar', href: '#' },
    ];

    const [isSubmitting, setIsSubmitting] = useState(false);

    const getStudentFullName = () => {
        const nombres = [student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ');
        const apellidos = [student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ');
        return `${nombres} ${apellidos}`.trim();
    };

    const handleCancel = () => {
        window.history.back();
    };

    const handleSubmit = (data: UpdateMedicalConsultationData) => {
        setIsSubmitting(true);

        const submitData = {
            consultation_date: data.consultation_date,
            diagnosis: data.diagnosis,
            treatment: data.treatment || '',
            observations: data.observations || '',
            change_justification: data.change_justification,
            _method: 'PUT',
        };

        router.put(
            route('clinical-records.medical-records.consultations.update', {
                medical_record: medical_record.id,
                consultation: consultation.id,
            }),
            submitData,
            {
                onSuccess: () => {
                    toast.success('Consulta médica actualizada exitosamente');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    toast.error('Error al actualizar la consulta médica. Por favor revise los campos.');
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <div className="mx-auto w-full max-w-4xl space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                    <FileEdit className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Editar Consulta Médica</CardTitle>
                                    <CardDescription>
                                        Modificando consulta de <span className="font-medium">{getStudentFullName()}</span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <AlertTitle className="text-amber-900 dark:text-amber-100">Modificación de Registro Médico</AlertTitle>
                                <AlertDescription className="text-amber-800 dark:text-amber-200">
                                    Esta acción quedará registrada en el sistema de auditoría. Debe proporcionar una justificación del cambio.
                                </AlertDescription>
                            </Alert>

                            {/* Card informativa con resumen - Arriba del formulario */}
                            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                                            Información de la Consulta Original
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                <User className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Registrada por</p>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">{consultation.doctor_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                <Calendar className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Fecha de registro</p>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                                    {format(new Date(consultation.created_at), 'PPP', { locale: es })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Última actualización</p>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">
                                                    {format(new Date(consultation.updated_at), 'PPP', { locale: es })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                                <Stethoscope className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Paciente</p>
                                                <p className="text-sm text-blue-900 dark:text-blue-100">{getStudentFullName()}</p>
                                                <p className="text-xs text-blue-700 dark:text-blue-300">NIE: {student.nie}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="my-4 bg-blue-200 dark:bg-blue-800" />

                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Los cambios realizados quedarán registrados en el historial de auditoría del sistema.
                                    </p>
                                </CardContent>
                            </Card>

                            <EditMedicalConsultationForm
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                                isSubmitting={isSubmitting}
                                defaultValues={{
                                    consultation_date: consultation.consultation_date,
                                    diagnosis: consultation.diagnosis,
                                    treatment: consultation.treatment || '',
                                    observations: consultation.observations || '',
                                    change_justification: '',
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
