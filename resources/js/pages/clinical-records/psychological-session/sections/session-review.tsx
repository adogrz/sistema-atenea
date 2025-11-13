'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CreateConsentData, CreatePsychologicalSessionData } from '@/types/clinical-records';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckCircle2, FileText, MessageSquare, Target } from 'lucide-react';

interface SessionReviewSectionProps {
    sessionData: CreatePsychologicalSessionData;
    consentData?: {
        consent_form_id?: number;
        consent?: CreateConsentData;
        existing_consent_info?: {
            id: number;
            granted_at: string;
            responsible_name: string;
        };
    };
    responsableName?: string;
    isMinor: boolean;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function SessionReviewSection({
    sessionData,
    consentData,
    responsableName,
    isMinor,
    onBack,
    onSubmit,
    isSubmitting,
}: SessionReviewSectionProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Revisar Información</h3>
                <p className="text-sm text-muted-foreground">Verifique que todos los datos sean correctos antes de guardar</p>
            </div>

            {/* Datos de la sesión */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <CardTitle>Datos de la Sesión</CardTitle>
                    </div>
                    <CardDescription>Información de la sesión psicológica</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="mt-1 h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 space-y-1">
                                <Label className="text-sm font-medium">Fecha de Sesión</Label>
                                <p className="text-sm text-muted-foreground">{formatDate(sessionData.session_date)}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Contenido de la Sesión</Label>
                            <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{sessionData.session_content}</p>
                        </div>

                        {sessionData.interventions && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium">Intervenciones</Label>
                                    </div>
                                    <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{sessionData.interventions}</p>
                                </div>
                            </>
                        )}

                        {sessionData.conclusions && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                        <Label className="text-sm font-medium">Conclusiones</Label>
                                    </div>
                                    <p className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{sessionData.conclusions}</p>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Consentimiento (solo si es menor) */}
            {isMinor && consentData && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <CardTitle>Consentimiento Informado</CardTitle>
                        </div>
                        <CardDescription>Información del consentimiento</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {consentData.consent_form_id ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">Consentimiento existente seleccionado</p>
                                            <Badge variant="secondary">Existente</Badge>
                                        </div>
                                        {consentData.existing_consent_info ? (
                                            <>
                                                <p className="text-sm text-muted-foreground">
                                                    Otorgado: {formatDate(consentData.existing_consent_info.granted_at)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Responsable: {consentData.existing_consent_info.responsible_name}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">ID: {consentData.consent_form_id}</p>
                                        )}
                                    </div>
                                </div>
                                <a
                                    href={`/dashboard/clinical-records/consent-forms/${consentData.consent_form_id}/file`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver documento
                                </a>
                            </div>
                        ) : consentData.consent ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 space-y-1">
                                        <Label className="text-sm font-medium">Responsable</Label>
                                        <p className="text-sm text-muted-foreground">{responsableName || 'No especificado'}</p>
                                    </div>
                                    <Badge variant="secondary">Nuevo</Badge>
                                </div>

                                <Separator />

                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">Fecha de otorgamiento</Label>
                                    <p className="text-sm text-muted-foreground">{formatDate(consentData.consent.granted_at)}</p>
                                </div>

                                <Separator />

                                <div className="space-y-1">
                                    <Label className="text-sm font-medium">Archivo adjunto</Label>
                                    <p className="text-sm text-muted-foreground">{consentData.consent.file.name}</p>
                                </div>

                                {consentData.consent.observations && (
                                    <>
                                        <Separator />
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Observaciones</Label>
                                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{consentData.consent.observations}</p>
                                        </div>
                                    </>
                                )}

                                <Separator />

                                <a
                                    href={URL.createObjectURL(consentData.consent.file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver documento
                                </a>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}

            {/* Botones de acción */}
            <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                    Volver
                </Button>
                <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Crear Sesión'}
                </Button>
            </div>
        </div>
    );
}
