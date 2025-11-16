'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InlineStepper from '@/components/ui/inline-stepper';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    CreateConsentData,
    CreatePsychologicalSessionData,
    PsychologicalRecordBasicInfo,
    ResponsibleBasicInfo,
    StudentBasicInfo,
} from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Brain, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SessionConsentSection } from './sections/session-consent';
import { SessionDataSection } from './sections/session-data';
import { SessionReviewSection } from './sections/session-review';

interface Props {
    psychological_record: PsychologicalRecordBasicInfo;
    student: StudentBasicInfo;
    is_minor: boolean;
    responsables: ResponsibleBasicInfo[];
    existing_consents: Array<{ id: number; granted_at: string; responsible_name: string }>;
}

export default function CreatePsychologicalSession({ psychological_record, student, is_minor, responsables, existing_consents }: Props) {
    const pageTitle = 'Nueva Sesión Psicológica';

    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
        { title: 'Expedientes Psicológicos', href: '/dashboard/clinical-records/psychological-records' },
        {
            title: `Expediente de ${student.primer_nombre} ${student.primer_apellido}`,
            href: `/dashboard/clinical-records/psychological-records/${psychological_record.id}`,
        },
        { title: 'Nueva Sesión', href: '#' },
    ];

    const [activeStep, setActiveStep] = useState(0);
    const [sessionData, setSessionData] = useState<CreatePsychologicalSessionData | null>(null);
    const [consentData, setConsentData] = useState<{
        consent_form_id?: number;
        consent?: CreateConsentData;
        existing_consent_info?: {
            id: number;
            granted_at: string;
            responsible_name: string;
        };
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Scroll to top cuando cambie el paso
    useEffect(() => {
        const container = document.getElementById('form-content-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeStep]);

    const getStudentFullName = () => {
        const nombres = [student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ');
        const apellidos = [student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ');
        return `${nombres} ${apellidos}`.trim();
    };

    const getResponsableName = (responsableId: number) => {
        const responsable = responsables.find((r) => r.id === responsableId);
        if (!responsable) return undefined;
        return `${responsable.nombres_responsable} ${responsable.apellidos_responsable}`;
    };

    // Handler para el paso 1: Datos de sesión
    const handleSessionNext = (data: CreatePsychologicalSessionData) => {
        setSessionData(data);
        setActiveStep(1);
    };

    // Handler para el paso 2: Consentimiento (solo si es menor)
    const handleConsentNext = (data: { consent_form_id?: number; consent?: CreateConsentData }) => {
        // Si se seleccionó un consentimiento existente, buscar su información completa
        const existingConsentInfo = data.consent_form_id ? existing_consents.find((c) => c.id === data.consent_form_id) : undefined;

        setConsentData({
            consent_form_id: data.consent_form_id,
            consent: data.consent_form_id ? undefined : data.consent,
            existing_consent_info: existingConsentInfo,
        });
        setActiveStep(2);
    };

    // Handler para volver del paso de consentimiento
    const handleConsentBack = () => {
        setActiveStep(0);
    };

    // Handler para volver del paso de review
    const handleReviewBack = () => {
        if (is_minor) {
            setActiveStep(1);
        } else {
            setActiveStep(0);
        }
    };

    // Handler para enviar el formulario
    const handleSubmit = () => {
        if (!sessionData) return;

        setIsSubmitting(true);

        const submitData = new FormData();

        // Datos de la sesión
        submitData.append('psychological_record_id', psychological_record.id.toString());
        submitData.append('session_date', sessionData.session_date);
        submitData.append('session_content', sessionData.session_content);
        if (sessionData.interventions) {
            submitData.append('interventions', sessionData.interventions);
        }
        if (sessionData.conclusions) {
            submitData.append('conclusions', sessionData.conclusions);
        }

        // Datos de consentimiento si aplica
        if (is_minor) {
            submitData.append('is_minor', '1');

            if (consentData?.consent_form_id) {
                submitData.append('consent_form_id', consentData.consent_form_id.toString());
            } else if (consentData?.consent) {
                submitData.append('consent[responsible_id]', consentData.consent.responsible_id.toString());
                submitData.append('consent[type]', consentData.consent.type);
                submitData.append('consent[granted_at]', consentData.consent.granted_at);
                submitData.append('consent[file]', consentData.consent.file);
                if (consentData.consent.observations) {
                    submitData.append('consent[observations]', consentData.consent.observations);
                }
            }
        } else {
            submitData.append('is_minor', '0');
        }

        router.post(route('clinical-records.psychological-records.sessions.store', psychological_record.id), submitData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Sesión psicológica registrada exitosamente');
            },
            onError: (errors) => {
                console.error('Errores de validación:', errors);
                toast.error('Error al registrar la sesión psicológica. Por favor revise los campos.');
                setIsSubmitting(false);
            },
        });
    };

    // Determinar los pasos según si es menor o no
    const steps = is_minor
        ? [
              { id: 1, title: 'Datos de Sesión', completed: activeStep > 0 },
              { id: 2, title: 'Consentimiento', completed: activeStep > 1 },
              { id: 3, title: 'Revisar', completed: false },
          ]
        : [
              { id: 1, title: 'Datos de Sesión', completed: activeStep > 0 },
              { id: 2, title: 'Revisar', completed: false },
          ];

    const reviewStepIndex = is_minor ? 2 : 1;

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
                                    <CardTitle className="text-xl">Nueva Sesión Psicológica</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Registrando sesión para <span className="font-medium">{getStudentFullName()}</span>
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Info del expediente */}
                            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-blue-900 dark:text-blue-100">Expediente Psicológico</AlertTitle>
                                <AlertDescription className="text-blue-800 dark:text-blue-200">
                                    Esta sesión se agregará al expediente psicológico del estudiante <strong>{getStudentFullName()}</strong> (NIE:{' '}
                                    {student.nie})
                                </AlertDescription>
                            </Alert>

                            {/* Stepper */}
                            <div className="mx-auto w-full max-w-2xl">
                                <InlineStepper
                                    steps={steps.map((s) => ({ title: s.title }))}
                                    activeIndex={activeStep}
                                    onChange={!isSubmitting ? setActiveStep : undefined}
                                />
                            </div>

                            {/* Contenido de los pasos */}
                            <div id="form-content-container">
                                {/* Paso 0: Datos de Sesión */}
                                {activeStep === 0 && <SessionDataSection onNext={handleSessionNext} defaultValues={sessionData || undefined} />}

                                {/* Paso 1: Consentimiento (solo menores) */}
                                {activeStep === 1 && is_minor && (
                                    <SessionConsentSection
                                        responsables={responsables}
                                        existingConsents={existing_consents}
                                        onNext={handleConsentNext}
                                        onBack={handleConsentBack}
                                        defaultValues={{
                                            consent_form_id: consentData?.consent_form_id,
                                            consent: consentData?.consent,
                                        }}
                                    />
                                )}

                                {/* Paso Final: Revisar */}
                                {activeStep === reviewStepIndex && sessionData && (
                                    <SessionReviewSection
                                        sessionData={sessionData}
                                        consentData={consentData || undefined}
                                        responsableName={
                                            consentData?.consent?.responsible_id ? getResponsableName(consentData.consent.responsible_id) : undefined
                                        }
                                        isMinor={is_minor}
                                        onBack={handleReviewBack}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </div>

                            {/* Mensaje si no es menor (solo en paso 0) */}
                            {!is_minor && activeStep === 0 && (
                                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                                    <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertTitle className="text-green-900 dark:text-green-100">Mayor de Edad</AlertTitle>
                                    <AlertDescription className="text-green-800 dark:text-green-200">
                                        El estudiante es mayor de edad, por lo que no se requiere consentimiento informado.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
