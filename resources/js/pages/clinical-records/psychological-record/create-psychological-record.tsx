'use client';

import { ConsentFormSection } from '@/components/clinical-records/consent/consent-form-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InlineStepper from '@/components/ui/inline-stepper';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    CreateConsentData,
    CreatePsychologicalRecordData,
    CreatePsychologicalSessionData,
    ResponsibleBasicInfo,
    StudentBasicInfo,
} from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { AlertCircle, Brain } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import RecordSessionSection from './sections/record-session';
import { ReviewSection } from './sections/review';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
    { title: 'Nuevo Expediente Psicológico', href: '/dashboard/clinical-records/psychological-records/create' },
];

interface Props {
    student_nie: string;
    student: StudentBasicInfo | null;
    responsables: ResponsibleBasicInfo[];
    existing_consents: Array<{ id: number; granted_at: string; responsible_name: string }>;
}

export default function CreatePsychologicalRecord({ student_nie, student, responsables, existing_consents }: Props) {
    const pageTitle = 'Nuevo Expediente Psicológico';
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<Partial<CreatePsychologicalRecordData>>({
        student_nie: student_nie,
        is_minor: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Calcular si es menor de edad basado en la fecha de nacimiento
     * Nota: Este cálculo también se realiza en el backend (modelo Estudiante::isMinor())
     */
    const isMinor = useCallback(() => {
        if (!student?.fecha_nacimiento) return false;
        const today = new Date();
        const birthDate = new Date(student.fecha_nacimiento);
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            return age - 1 < 18;
        }
        return age < 18;
    }, [student]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, is_minor: isMinor() }));
    }, [isMinor]);

    // Scroll to top cuando cambie el paso
    useEffect(() => {
        const container = document.getElementById('form-content-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // También scroll general de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeStep]);

    const getStudentFullName = () => {
        if (!student) return 'Estudiante';
        const nombres = [student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ');
        const apellidos = [student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ');
        return `${nombres} ${apellidos}`.trim();
    };

    const getResponsableName = (responsableId: number) => {
        const responsable = responsables.find((r) => r.id === responsableId);
        if (!responsable) return undefined;
        return `${responsable.nombres_responsable} ${responsable.apellidos_responsable}`;
    };

    // Handler para el paso 1: Expediente y Sesión
    const handleRecordSessionNext = (data: { initial_assessment?: string; session: CreatePsychologicalSessionData }) => {
        const minor = isMinor();
        setFormData((prev) => ({
            ...prev,
            is_minor: minor,
            initial_assessment: data.initial_assessment,
            session: data.session,
        }));

        // Ir al siguiente paso (para menores: consentimiento; para mayores: review)
        setActiveStep(1);
    };

    // Handler para el paso 2: Consentimiento (solo si es menor)
    const handleConsentNext = (data: { consent_form_id?: number; consent?: CreateConsentData }) => {
        setFormData((prev) => ({
            ...prev,
            // Si hay consent_form_id, limpiar consent; si hay consent, limpiar consent_form_id
            consent_form_id: data.consent_form_id,
            consent: data.consent_form_id ? undefined : data.consent,
        }));
        setActiveStep(2);
    };

    // Handler para volver del paso de consentimiento
    const handleConsentBack = () => {
        setActiveStep(0);
    };

    // Handler para volver del paso de review
    const handleReviewBack = () => {
        if (isMinor()) {
            setActiveStep(1);
        } else {
            setActiveStep(0);
        }
    };

    // Handler para enviar el formulario
    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            // Preparar FormData para envío
            const submitData = new FormData();

            submitData.append('student_nie', formData.student_nie!);
            submitData.append('is_minor', formData.is_minor ? '1' : '0');

            if (formData.initial_assessment) {
                submitData.append('initial_assessment', formData.initial_assessment);
            }

            // Datos de sesión
            if (formData.session) {
                submitData.append('session[session_date]', formData.session.session_date);
                submitData.append('session[session_content]', formData.session.session_content);
                if (formData.session.interventions) {
                    submitData.append('session[interventions]', formData.session.interventions);
                }
                if (formData.session.conclusions) {
                    submitData.append('session[conclusions]', formData.session.conclusions);
                }
            }

            // Datos de consentimiento si es menor
            if (formData.is_minor) {
                // Caso 1: Usar consentimiento existente
                if (formData.consent_form_id) {
                    submitData.append('consent_form_id', formData.consent_form_id.toString());
                }
                // Caso 2: Crear nuevo consentimiento (solo si NO hay consent_form_id)
                else if (formData.consent) {
                    submitData.append('consent[responsible_id]', formData.consent.responsible_id.toString());
                    submitData.append('consent[type]', formData.consent.type);
                    submitData.append('consent[granted_at]', formData.consent.granted_at);
                    submitData.append('consent[file]', formData.consent.file);
                    if (formData.consent.observations) {
                        submitData.append('consent[observations]', formData.consent.observations);
                    }
                }
            }

            router.post(route('clinical-records.psychological-records.store'), submitData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Expediente psicológico creado exitosamente');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    toast.error('Error al crear el expediente psicológico. Por favor revise los campos.');
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error al enviar:', error);
            toast.error('Ocurrió un error al crear el expediente psicológico');
            setIsSubmitting(false);
        }
    };

    // Validar que tenemos un estudiante
    if (!student) {
        return (
            <AppLayout breadcrumbs={BREADCRUMBS}>
                <Head title={pageTitle} />
                <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>No se encontró el estudiante con NIE: {student_nie}</AlertDescription>
                    </Alert>
                </div>
            </AppLayout>
        );
    }

    // Determinar los pasos según si es menor o no (comenzar desde 1)
    const minorUI = isMinor();
    const steps = minorUI
        ? [
              { id: 1, title: 'Expediente y Sesión', completed: activeStep > 0 },
              { id: 2, title: 'Consentimiento', completed: activeStep > 1 },
              { id: 3, title: 'Revisar', completed: false },
          ]
        : [
              { id: 1, title: 'Expediente y Sesión', completed: activeStep > 0 },
              { id: 2, title: 'Revisar', completed: false },
          ];

    const reviewStepIndex = minorUI ? 2 : 1;

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
                                    <CardTitle className="text-xl">Creación de Expediente Psicológico</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Registrando expediente psicológico para <span className="font-medium">{getStudentFullName()}</span>
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Stepper centrado (componente reutilizable) */}
                            <div className="mx-auto w-full max-w-2xl">
                                <InlineStepper
                                    steps={steps.map((s) => ({ title: s.title }))}
                                    activeIndex={activeStep}
                                    onChange={!isSubmitting ? setActiveStep : undefined}
                                />
                            </div>

                            {/* Contenido de los pasos */}
                            <div id="form-content-container">
                                {/* Paso 0: Expediente y Sesión Inicial (siempre) */}
                                {activeStep === 0 && (
                                    <RecordSessionSection
                                        onNext={handleRecordSessionNext}
                                        defaultValues={{
                                            initial_assessment: formData.initial_assessment,
                                            session: formData.session,
                                        }}
                                    />
                                )}

                                {/* Paso 1: Consentimiento (solo menores) */}
                                {activeStep === 1 && minorUI && (
                                    <ConsentFormSection
                                        responsables={responsables}
                                        existingConsents={existing_consents}
                                        onNext={handleConsentNext}
                                        onBack={handleConsentBack}
                                        defaultValues={{
                                            consent_form_id: formData.consent_form_id,
                                            consent: formData.consent,
                                        }}
                                        consentType="psychological"
                                    />
                                )}

                                {/* Paso Final: Revisar (índice depende si es menor) */}
                                {activeStep === reviewStepIndex && (
                                    <ReviewSection
                                        data={formData}
                                        studentName={getStudentFullName()}
                                        responsableName={
                                            formData.consent?.responsible_id ? getResponsableName(formData.consent.responsible_id) : undefined
                                        }
                                        onBack={handleReviewBack}
                                        onSubmit={handleSubmit}
                                        isSubmitting={isSubmitting}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
