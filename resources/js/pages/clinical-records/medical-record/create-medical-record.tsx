'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stepper, StepperIndicator, StepperItem, StepperSeparator, StepperTitle, StepperTrigger } from '@/components/ui/stepper';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import {
    CreateMedicalConsentData,
    CreateMedicalConsultationData,
    CreateMedicalRecordData,
    ResponsibleBasicInfo,
    StudentBasicInfo,
} from '@/types/clinical-records';
import { Head, router } from '@inertiajs/react';
import { AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConsentFormSection } from './sections/consent-form';
import RecordConsultationSection from './sections/record-consultation';
import { ReviewSection } from './sections/review';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Expediente Clínico', href: '/dashboard/clinical-records' },
    { title: 'Asignaciones', href: '/dashboard/clinical-records/assignments' },
    { title: 'Nuevo Expediente Médico', href: '/dashboard/clinical-records/medical-records/create' },
];

interface Props {
    student_nie: string;
    student: StudentBasicInfo | null;
    responsables: ResponsibleBasicInfo[];
    existing_consents: Array<{ id: number; granted_at: string; responsible_name: string }>;
}

export default function CreateMedicalRecord({ student_nie, student, responsables, existing_consents }: Props) {
    const pageTitle = 'Nuevo Expediente Médico';
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<Partial<CreateMedicalRecordData>>({
        student_nie: student_nie,
        is_minor: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calcular si es menor de edad
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

    // Handler para el paso 1: Expediente y Consulta
    const handleRecordConsultationNext = (data: { general_background?: string; consultation: CreateMedicalConsultationData }) => {
        const minor = isMinor();
        setFormData((prev) => ({
            ...prev,
            is_minor: minor,
            general_background: data.general_background,
            consultation: data.consultation,
        }));

        // Ir al siguiente paso (para menores: consentimiento; para mayores: review)
        setActiveStep(1);
    };

    // Handler para el paso 2: Consentimiento (solo si es menor)
    const handleConsentNext = (data: { consent_form_id?: number; consent?: CreateMedicalConsentData }) => {
        setFormData((prev) => ({
            ...prev,
            consent_form_id: data.consent_form_id,
            consent: data.consent,
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

            if (formData.general_background) {
                submitData.append('general_background', formData.general_background);
            }

            // Datos de consulta
            if (formData.consultation) {
                submitData.append('consultation[consultation_date]', formData.consultation.consultation_date);
                submitData.append('consultation[diagnosis]', formData.consultation.diagnosis);
                if (formData.consultation.treatment) {
                    submitData.append('consultation[treatment]', formData.consultation.treatment);
                }
                if (formData.consultation.observations) {
                    submitData.append('consultation[observations]', formData.consultation.observations);
                }
            }

            // Datos de consentimiento si es menor
            if (formData.is_minor) {
                if (formData.consent_form_id) {
                    submitData.append('consent_form_id', formData.consent_form_id.toString());
                } else if (formData.consent) {
                    submitData.append('consent[responsible_id]', formData.consent.responsible_id.toString());
                    submitData.append('consent[type]', formData.consent.type);
                    submitData.append('consent[granted_at]', formData.consent.granted_at);
                    submitData.append('consent[file]', formData.consent.file);
                    if (formData.consent.observations) {
                        submitData.append('consent[observations]', formData.consent.observations);
                    }
                }
            }

            router.post(route('clinical-records.medical-records.store'), submitData, {
                onSuccess: () => {
                    toast.success('Expediente médico creado exitosamente');
                },
                onError: (errors) => {
                    console.error('Errores de validación:', errors);
                    toast.error('Error al crear el expediente médico. Por favor revise los campos.');
                    setIsSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Error al enviar:', error);
            toast.error('Ocurrió un error al crear el expediente médico');
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

    // Determinar los pasos según si es menor o no
    const minorUI = isMinor();
    const steps = minorUI
        ? [
              { id: 0, title: 'Expediente y Consulta', completed: activeStep > 0 },
              { id: 1, title: 'Consentimiento', completed: activeStep > 1 },
              { id: 2, title: 'Revisar', completed: false },
          ]
        : [
              { id: 0, title: 'Expediente y Consulta', completed: activeStep > 0 },
              { id: 1, title: 'Revisar', completed: false },
          ];

    const reviewStepIndex = minorUI ? 2 : 1;

    // Debug info (remove in production)
    console.log('DEBUG - CreateMedicalRecord:', {
        fecha_nacimiento: student?.fecha_nacimiento,
        isMinor: minorUI,
        activeStep,
        reviewStepIndex,
        formData_is_minor: formData.is_minor,
        totalSteps: steps.length,
    });

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={pageTitle} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
                    <p className="mt-2 text-muted-foreground">Complete los pasos para crear el expediente médico del estudiante</p>
                </div>

                {/* Stepper */}
                <div className="mx-auto w-full max-w-4xl">
                    <Stepper value={activeStep} onValueChange={setActiveStep} orientation="horizontal">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex w-full items-center">
                                <StepperItem step={step.id} completed={step.completed}>
                                    <StepperTrigger>
                                        <StepperIndicator>{index + 1}</StepperIndicator>
                                        <StepperTitle>{step.title}</StepperTitle>
                                    </StepperTrigger>
                                </StepperItem>
                                {index < steps.length - 1 && <StepperSeparator />}
                            </div>
                        ))}
                    </Stepper>
                </div>

                {/* Contenido de los pasos */}
                <div className="mx-auto w-full max-w-4xl">
                    {/* Paso 0: Expediente y Consulta Inicial (siempre) */}
                    {activeStep === 0 && (
                        <RecordConsultationSection
                            studentName={getStudentFullName()}
                            onNext={handleRecordConsultationNext}
                            defaultValues={{
                                general_background: formData.general_background,
                                consultation: formData.consultation,
                            }}
                        />
                    )}

                    {/* Paso 1: Consentimiento (solo menores) */}
                    {activeStep === 1 && minorUI && (
                        <ConsentFormSection
                            studentName={getStudentFullName()}
                            responsables={responsables}
                            existingConsents={existing_consents}
                            onNext={handleConsentNext}
                            onBack={handleConsentBack}
                            defaultValues={{
                                consent_form_id: formData.consent_form_id,
                                consent: formData.consent,
                            }}
                        />
                    )}

                    {/* Paso Final: Revisar (índice depende si es menor) */}
                    {activeStep === reviewStepIndex && (
                        <ReviewSection
                            data={formData}
                            studentName={getStudentFullName()}
                            responsableName={formData.consent?.responsible_id ? getResponsableName(formData.consent.responsible_id) : undefined}
                            onBack={handleReviewBack}
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
