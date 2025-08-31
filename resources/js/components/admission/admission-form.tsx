'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AlertCircle, CheckCircle2, FileText, Loader2, Save, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { useAutoSave } from '@/hooks/useAutoSave';
import { useStepValidation } from '@/hooks/useStepValidation';
import AdmissionLayout from '@/layouts/admission/admission-layout';
import { fullFormSchema, getErrorsBySection } from '@/lib/validations/admission-schemas';
import { Departamento, Distrito, Municipio } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import AdmissionSidebar from './admission-sidebar';
import Captcha from './captcha';
import Direccion from './sections/address';
import Educacion from './sections/education';
import DatosPersonales from './sections/personal-data';
import DatosResponsable from './sections/responsible';
import ResumenSolicitud from './sections/summary';
import SuccessAlert from './success-alert';
import SuccessModal from './success-modal';

type FormData = z.infer<typeof fullFormSchema>;

export default function FormularioAdmision(props: {
    departamentos: Departamento[];
    municipios: Municipio[];
    distritos: Distrito[];
    centros_educativos: CentroEducativo[];
    niveles_educativos: NivelEducativo[];
}) {
    const { departamentos, municipios, distritos, centros_educativos, niveles_educativos } = props;
    const [activeTab, setActiveTab] = useState('datos-personales');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [submissionData, setSubmissionData] = useState<{
        estudiante: {
            codigo: string;
            primer_nombre: string;
            primer_apellido: string;
            email: string;
        };
        submissionDate: Date;
    } | null>(null);

    const methods = useForm<FormData>({
        resolver: zodResolver(fullFormSchema),
        defaultValues: {
            primer_nombre: '',
            segundo_nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            sexo: '',
            fecha_nacimiento: '',
            nie: '',
            email: '',
            telefono_casa: '',
            colonia: '',
            calle: '',
            numero_casa: '',
            punto_referencia: '',
            direccion: '',
            distrito: '',
            departamento: '',
            municipio: '',
            centro_educativo: '',
            sector: 'PÚBLICO',
            zona: 'Rural',
            internacional: 'NO',
            nivel_educativo: '',
            dui_responsable_1: '',
            nombres_responsable_1: '',
            apellidos_responsable_1: '',
            email_responsable_1: '',
            telefono_responsable_1: '',
            tipo_parentesco_1: '',
            otro_parentesco_1: '',
            dui_responsable_2: '',
            nombres_responsable_2: '',
            apellidos_responsable_2: '',
            email_responsable_2: '',
            telefono_responsable_2: '',
            tipo_parentesco_2: '',
            otro_parentesco_2: '',
        },
        mode: 'onTouched',
    });

    const {
        formState: { errors },
        trigger,
        getValues,
        clearErrors,
        setValue,
        watch,
    } = methods;

    // Usar el hook personalizado para validación
    const { validateStep, isValidating } = useStepValidation({ getValues, trigger, clearErrors });

    // Función para manejar borrador encontrado
    const handleDraftFound = useCallback(
        (draft: { data: FieldValues; timeAgo: string }) => {
            toast.custom(
                (t) => (
                    <div className="relative flex w-full max-w-sm items-center space-x-3 rounded-md border border-border bg-background p-4 shadow-md">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <p className="text-sm leading-none font-medium">Borrador encontrado</p>
                            <p className="text-xs text-muted-foreground">Guardado {draft.timeAgo}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => {
                                    Object.keys(draft.data).forEach((key) => {
                                        const value = draft.data[key];
                                        if (value !== '' && value !== null && value !== undefined) {
                                            (setValue as (name: string, value: unknown) => void)(key, value);
                                        }
                                    });
                                    toast.success('Borrador restaurado', {
                                        duration: 2000,
                                    });
                                    toast.dismiss(t);
                                }}
                            >
                                Restaurar
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                    localStorage.removeItem('admission_form_draft');
                                    localStorage.removeItem('admission_form_draft_timestamp');
                                    toast.dismiss(t);
                                }}
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Descartar</span>
                            </Button>
                        </div>
                    </div>
                ),
                {
                    duration: 12000,
                    position: 'top-right',
                },
            );
        },
        [setValue],
    );

    // Usar el hook de auto guardado
    const { saveManually, clearDraft } = useAutoSave({
        getValues,
        setValue,
        watch,
        onDraftFound: handleDraftFound,
    });

    const steps = ['datos-personales', 'datos-responsables', 'direccion', 'educacion', 'resumen'];
    const currentStepIndex = steps.indexOf(activeTab);

    // Función simplificada usando el hook
    const handleNext = async () => {
        const isValid = await validateStep(activeTab);
        if (isValid && currentStepIndex < steps.length - 1) {
            setActiveTab(steps[currentStepIndex + 1]);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setActiveTab(steps[currentStepIndex - 1]);
        }
    };

    // Usar la función helper para calcular errores por sección
    const erroresPorSeccion = getErrorsBySection(errors);

    const totalErrors = Object.values(erroresPorSeccion).reduce((acc, curr) => acc + curr, 0);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('/admision', data, {
                headers: {
                    Accept: 'application/json',
                },
            });

            // Limpiar borrador al enviar exitosamente
            clearDraft();

            // Configurar datos de la respuesta
            const submissionDate = new Date();
            setSubmissionData({
                estudiante: {
                    codigo: response.data.estudiante?.codigo || 'N/A',
                    primer_nombre: data.primer_nombre,
                    primer_apellido: data.primer_apellido,
                    email: data.email,
                },
                submissionDate,
            });

            // Mostrar modal de éxito
            setShowSuccessModal(true);
            setFormStatus('success');
        } catch (error) {
            console.error('Error al enviar:', error);
            toast.error('No se pudo procesar tu solicitud! Intenta nuevamente más tarde.');
            setFormStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para cerrar el modal y mostrar la alerta persistente
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        setShowSuccessAlert(true);
    };

    // Función para cerrar la alerta persistente
    const handleDismissAlert = () => {
        setShowSuccessAlert(false);
    };

    if (formStatus === 'error') {
        return (
            <Card className="mx-auto max-w-md p-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="rounded-full bg-red-100 p-3">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Error al enviar la solicitud</h2>
                    <p className="text-muted-foreground">Ocurrió un problema al enviar tu solicitud. Por favor inténtalo de nuevo más tarde.</p>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setFormStatus('idle')}>
                            Volver al formulario
                        </Button>
                        <Button onClick={() => window.location.reload()}>Reintentar</Button>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <FormProvider {...methods}>
            <AdmissionLayout
                sidebar={
                    <AdmissionSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        erroresPorSeccion={erroresPorSeccion}
                        isLoading={isValidating}
                        disabled={formStatus === 'success'}
                    />
                }
            >
                <div className="flex h-full flex-1 flex-col gap-6 p-4">
                    <div className="mx-auto w-full max-w-4xl">
                        {/* Alerta de éxito persistente */}
                        {showSuccessAlert && submissionData && (
                            <div className="mb-6">
                                <SuccessAlert
                                    isVisible={showSuccessAlert}
                                    onDismiss={handleDismissAlert}
                                    submissionDate={submissionData.submissionDate}
                                    studentName={`${submissionData.estudiante.primer_nombre} ${submissionData.estudiante.primer_apellido}`}
                                />
                            </div>
                        )}

                        {/* Encabezado global - siempre visible */}
                        <div className="mb-6 text-start">
                            <h1 className="text-3xl font-bold tracking-tight">Postulación Jóvenes Talento</h1>
                            <p className="mt-2 text-base text-muted-foreground">
                                {currentStepIndex + 1 === 1 && 'Paso 1 de 5: Ingresa tus datos personales'}
                                {currentStepIndex + 1 === 2 && 'Paso 2 de 5: Ingresa los datos de los responsables'}
                                {currentStepIndex + 1 === 3 && 'Paso 3 de 5: Ingresa tu dirección de residencia'}
                                {currentStepIndex + 1 === 4 && 'Paso 4 de 5: Ingresa tu información académica'}
                                {currentStepIndex + 1 === 5 && 'Paso 5 de 5: Revisa y envía tu solicitud'}
                            </p>
                        </div>

                        {/* Overlay para formulario bloqueado */}
                        <div className={`relative ${formStatus === 'success' ? 'pointer-events-none' : ''}`}>
                            {formStatus === 'success' && <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[1px]" />}

                            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                                {/* Contenido del formulario - cada sección con su propia Card */}
                                <div>
                                    {activeTab === 'datos-personales' && <DatosPersonales />}
                                    {activeTab === 'datos-responsables' && <DatosResponsable />}
                                    {activeTab === 'direccion' && (
                                        <Direccion departamentos={departamentos} municipios={municipios} distritos={distritos} />
                                    )}
                                    {activeTab === 'educacion' && (
                                        <Educacion centros_educativos={centros_educativos} niveles_educativos={niveles_educativos} />
                                    )}
                                    {activeTab === 'resumen' && (
                                        <ResumenSolicitud
                                            departamentos={departamentos}
                                            municipios={municipios}
                                            distritos={distritos}
                                            niveles_educativos={niveles_educativos}
                                            centros_educativos={centros_educativos}
                                            onNavigateToSection={setActiveTab}
                                            onSaveManually={saveManually}
                                        />
                                    )}
                                </div>

                                {/* Captcha solo en el paso resumen */}
                                {activeTab === 'resumen' && formStatus !== 'success' && (
                                    <div className="space-y-6">
                                        <Captcha onVerify={setCaptchaVerified} />
                                    </div>
                                )}

                                {/* Alertas de errores y estado */}
                                {totalErrors > 0 && activeTab === 'resumen' && formStatus !== 'success' && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            Hay {totalErrors} error(es) en el formulario. Por favor, revisa las secciones anteriores.
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {isSubmitting && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertTitle>Enviando...</AlertTitle>
                                        <AlertDescription>Tu solicitud está siendo procesada.</AlertDescription>
                                    </Alert>
                                )}

                                {/* Botones de navegación - fuera de cualquier Card */}
                                {formStatus !== 'success' && (
                                    <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background pt-6">
                                        {currentStepIndex > 0 && (
                                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting || isValidating}>
                                                Anterior
                                            </Button>
                                        )}

                                        {currentStepIndex === 0 && <div />}

                                        {activeTab !== 'resumen' ? (
                                            <Button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={isSubmitting || isValidating}
                                                className="min-w-[120px]"
                                            >
                                                {isValidating ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Validando...
                                                    </>
                                                ) : (
                                                    'Siguiente'
                                                )}
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !captchaVerified || totalErrors > 0}
                                                className="min-w-[160px]"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Enviar Solicitud
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </AdmissionLayout>

            {/* Modal de éxito */}
            {submissionData && (
                <SuccessModal
                    isOpen={showSuccessModal}
                    onClose={handleCloseSuccessModal}
                    studentData={{
                        nombre: `${submissionData.estudiante.primer_nombre} ${submissionData.estudiante.primer_apellido}`,
                        codigo: submissionData.estudiante.codigo,
                        email: submissionData.estudiante.email,
                    }}
                    submissionDate={submissionData.submissionDate}
                />
            )}

            <Toaster position="top-right" richColors />
        </FormProvider>
    );
}
