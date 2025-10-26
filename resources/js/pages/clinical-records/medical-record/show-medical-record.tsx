'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MedicalRecordWithRelations } from '@/types/clinical-records';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, FileText, Stethoscope, User } from 'lucide-react';

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
    const student = medicalRecord.student;
    const studentName = student
        ? `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`
        : 'N/A';

    const pageTitle = `Expediente Médico - ${studentName}`;

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                        <p className="mt-2 text-muted-foreground">Visualización del expediente médico del estudiante</p>
                    </div>
                    <Badge variant="outline" className="h-fit">
                        <FileText className="mr-2 h-4 w-4" />
                        Expediente #{medicalRecord.id}
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Información del Estudiante */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Estudiante
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-sm text-muted-foreground">Nombre:</span>
                                <span className="text-sm font-medium">{studentName}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-sm text-muted-foreground">NIE:</span>
                                <span className="text-sm font-medium">{medicalRecord.student_nie}</span>
                            </div>
                            {student?.fecha_nacimiento && (
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-sm text-muted-foreground">Fecha de Nacimiento:</span>
                                    <span className="text-sm font-medium">{format(new Date(student.fecha_nacimiento), 'dd/MM/yyyy')}</span>
                                </div>
                            )}
                            {student?.sexo && (
                                <div className="grid grid-cols-2 gap-2">
                                    <span className="text-sm text-muted-foreground">Sexo:</span>
                                    <span className="text-sm font-medium">{student.sexo}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Información del Expediente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5" />
                                Datos del Expediente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-sm text-muted-foreground">Creado por:</span>
                                <span className="text-sm font-medium">{medicalRecord.creator?.name || 'N/A'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-sm text-muted-foreground">Fecha de Creación:</span>
                                <span className="text-sm font-medium">
                                    <Calendar className="mr-1 inline h-3 w-3" />
                                    {format(new Date(medicalRecord.created_at), 'PPP', { locale: es })}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="text-sm text-muted-foreground">Última Actualización:</span>
                                <span className="text-sm font-medium">{format(new Date(medicalRecord.updated_at), 'PPP', { locale: es })}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Antecedentes Médicos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Antecedentes Médicos</CardTitle>
                        <CardDescription>Información general sobre el historial médico del estudiante</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {medicalRecord.general_background ? (
                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{medicalRecord.general_background}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Sin antecedentes registrados</p>
                        )}
                    </CardContent>
                </Card>

                {/* Consultas Médicas */}
                {medicalRecord.medical_consultations && medicalRecord.medical_consultations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Consultas Médicas</CardTitle>
                            <CardDescription>{medicalRecord.medical_consultations.length} consulta(s) registrada(s)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {medicalRecord.medical_consultations.map((consultation) => (
                                    <div key={consultation.id} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                {format(new Date(consultation.consultation_date), 'PPP', { locale: es })}
                                            </span>
                                            <span className="text-xs text-muted-foreground">Dr. {consultation.doctor?.name || 'N/A'}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-xs font-medium">Diagnóstico:</span>
                                                <p className="mt-1 text-sm text-muted-foreground">{consultation.diagnosis}</p>
                                            </div>
                                            {consultation.treatment && (
                                                <div>
                                                    <span className="text-xs font-medium">Tratamiento:</span>
                                                    <p className="mt-1 text-sm text-muted-foreground">{consultation.treatment}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
