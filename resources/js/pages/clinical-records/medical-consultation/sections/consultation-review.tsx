'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateMedicalConsentData, CreateMedicalConsultationData } from '@/types/clinical-records';
import { Calendar, FileCheck, Stethoscope } from 'lucide-react';

interface ConsultationReviewSectionProps {
    consultationData: CreateMedicalConsultationData;
    consentData?: {
        consent_form_id?: number;
        consent?: CreateMedicalConsentData;
    };
    studentName: string;
    responsableName?: string;
    isMinor: boolean;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export function ConsultationReviewSection({
    consultationData,
    consentData,
    studentName,
    responsableName,
    isMinor,
    onBack,
    onSubmit,
    isSubmitting = false,
}: ConsultationReviewSectionProps) {
    const openLocalConsentPreview = () => {
        const file = consentData?.consent?.file;
        if (!file) return;
        const url = URL.createObjectURL(file);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    };

    return (
        <div className="space-y-8">
            {/* Consulta Médica */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Datos de la Consulta</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Paciente</label>
                        <p className="mt-1 text-sm text-muted-foreground">{studentName}</p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Fecha de Consulta</label>
                        <p className="mt-1 text-sm text-muted-foreground">
                            <Calendar className="mr-2 inline h-4 w-4" />
                            {consultationData.consultation_date}
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium">Diagnóstico</label>
                        <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{consultationData.diagnosis}</p>
                    </div>

                    {consultationData.treatment && (
                        <div>
                            <label className="text-sm font-medium">Tratamiento</label>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{consultationData.treatment}</p>
                        </div>
                    )}

                    {consultationData.observations && (
                        <div>
                            <label className="text-sm font-medium">Observaciones</label>
                            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{consultationData.observations}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Consentimiento Informado */}
            {isMinor && consentData && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Consentimiento Informado</h3>
                        <Badge variant="secondary">Requerido</Badge>
                    </div>

                    {consentData.consent_form_id ? (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge>Consentimiento Existente</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">ID:</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">#{consentData.consent_form_id}</span>
                                    <a
                                        href={route('clinical-records.medical-records.consent-forms.file', consentData.consent_form_id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary underline"
                                    >
                                        Ver documento
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : consentData.consent ? (
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <Badge variant="outline">Nuevo Consentimiento</Badge>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Responsable</label>
                                <p className="mt-1 text-sm text-muted-foreground">{responsableName}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Fecha de Otorgamiento</label>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    <Calendar className="mr-2 inline h-4 w-4" />
                                    {consentData.consent.granted_at}
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

                            {consentData.consent.observations && (
                                <div>
                                    <label className="text-sm font-medium">Observaciones</label>
                                    <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{consentData.consent.observations}</p>
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
                    {isSubmitting ? 'Guardando consulta...' : 'Guardar Consulta Médica'}
                </Button>
            </div>
        </div>
    );
}
