'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/hooks/use-file-upload';
import { CreateMedicalRecordData } from '@/types/clinical-records';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ClipboardList, FileCheck, FileText, User } from 'lucide-react';

interface ReviewSectionProps {
    data: Partial<CreateMedicalRecordData>;
    studentName: string;
    responsableName?: string;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export function ReviewSection({ data, studentName, responsableName, onBack, onSubmit, isSubmitting = false }: ReviewSectionProps) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Revisar y Confirmar</h2>
                <p className="mt-1 text-sm text-muted-foreground">Verifique que toda la información sea correcta antes de crear el expediente</p>
            </div>

            {/* Estudiante */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Información del Estudiante</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{studentName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">NIE:</span>
                        <span className="text-sm font-medium">{data.student_nie}</span>
                    </div>
                </div>
            </div>

            {/* Antecedentes Médicos */}
            <div className="rounded-lg border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Antecedentes Médicos</h3>
                </div>
                {data.general_background ? (
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.general_background}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Sin antecedentes registrados</p>
                )}
            </div>

            {/* Consulta Inicial */}
            {data.consultation && (
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Consulta Médica Inicial</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Fecha de Consulta</label>
                            <p className="mt-1 text-sm text-muted-foreground">
                                <Calendar className="mr-2 inline h-4 w-4" />
                                {format(new Date(data.consultation.consultation_date), 'PPP', { locale: es })}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Diagnóstico</label>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.consultation.diagnosis}</p>
                        </div>

                        {data.consultation.treatment && (
                            <div>
                                <label className="text-sm font-medium">Tratamiento</label>
                                <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.consultation.treatment}</p>
                            </div>
                        )}

                        {data.consultation.observations && (
                            <div>
                                <label className="text-sm font-medium">Observaciones</label>
                                <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.consultation.observations}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Consentimiento Informado */}
            {data.is_minor && (
                <div className="rounded-lg border bg-card p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Consentimiento Informado</h3>
                        <Badge variant="secondary">Requerido</Badge>
                    </div>

                    {data.consent_form_id ? (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge>Consentimiento Existente</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ID:</span>
                                <span className="text-sm font-medium">#{data.consent_form_id}</span>
                            </div>
                        </div>
                    ) : data.consent ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge variant="outline">Nuevo Consentimiento</Badge>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Responsable</label>
                                <p className="mt-1 text-sm text-muted-foreground">{responsableName || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Fecha de Otorgamiento</label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    <Calendar className="mr-2 inline h-4 w-4" />
                                    {format(new Date(data.consent.granted_at), 'PPP', { locale: es })}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Documento</label>
                                <div className="mt-2 flex items-center gap-3 rounded-md border p-3">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{data.consent.file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(data.consent.file.size)}</p>
                                    </div>
                                </div>
                            </div>

                            {data.consent.observations && (
                                <div>
                                    <label className="text-sm font-medium">Observaciones</label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.consent.observations}</p>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Atrás
                </Button>
                <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Creando expediente...' : 'Crear Expediente Médico'}
                </Button>
            </div>
        </div>
    );
}
