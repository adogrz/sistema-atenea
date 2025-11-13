'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreatePsychologicalRecordData } from '@/types/clinical-records';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Brain, Calendar, ClipboardList, FileCheck, User } from 'lucide-react';

interface ReviewSectionProps {
    data: Partial<CreatePsychologicalRecordData>;
    studentName: string;
    responsableName?: string;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export function ReviewSection({ data, studentName, responsableName, onBack, onSubmit, isSubmitting = false }: ReviewSectionProps) {
    const openLocalConsentPreview = () => {
        const file = data.consent?.file;
        if (!file) return;
        const url = URL.createObjectURL(file);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    };

    return (
        <div className="space-y-8">
            {/* Información del estudiante */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Información del Estudiante</h3>
                </div>
                <div className="space-y-2">
                    <div className="flex gap-1">
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{studentName}</span>
                    </div>
                    <div className="flex gap-1">
                        <span className="text-sm text-muted-foreground">NIE:</span>
                        <span className="text-sm font-medium">{data.student_nie}</span>
                    </div>
                </div>
            </div>

            {/* Evaluación Inicial */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Evaluación Inicial</h3>
                </div>
                {data.initial_assessment ? (
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.initial_assessment}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Sin evaluación inicial registrada</p>
                )}
            </div>

            {/* Primera Sesión */}
            {data.session && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Primera Sesión Psicológica</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Fecha de Sesión</label>
                            <p className="mt-1 text-sm text-muted-foreground">
                                <Calendar className="mr-2 inline h-4 w-4" />
                                {format(new Date(data.session.session_date), 'PPP', { locale: es })}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium">Contenido de la Sesión</label>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.session.session_content}</p>
                        </div>

                        {data.session.interventions && (
                            <div>
                                <label className="text-sm font-medium">Intervenciones</label>
                                <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.session.interventions}</p>
                            </div>
                        )}

                        {data.session.conclusions && (
                            <div>
                                <label className="text-sm font-medium">Conclusiones</label>
                                <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{data.session.conclusions}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Consentimiento Informado */}
            {data.is_minor && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
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
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">ID:</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">#{data.consent_form_id}</span>
                                    <a
                                        href={route('clinical-records.medical-records.consent-forms.file', data.consent_form_id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary underline"
                                    >
                                        Ver documento
                                    </a>
                                </div>
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
                                <div className="mt-1">
                                    <button type="button" onClick={openLocalConsentPreview} className="text-sm text-primary underline">
                                        Ver documento
                                    </button>
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
                    {isSubmitting ? 'Creando expediente...' : 'Crear Expediente Psicológico'}
                </Button>
            </div>
        </div>
    );
}
