'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AlertCircle, CheckCircle2, FileText, Loader2, Save, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import ErrorModal from './error-modal';
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
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
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
            telefono_estudiante: '',
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
            nivel_educativo: undefined,
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

    const steps = useMemo(() => ['datos-personales', 'datos-responsables', 'direccion', 'educacion', 'resumen'], []);
    const currentStepIndex = steps.indexOf(activeTab);

    // Función simplificada usando el hook
    const handleNext = async () => {
        const isValid = await validateStep(activeTab);
        if (isValid && currentStepIndex < steps.length - 1) {
            // Marcar el paso actual como completado
            setCompletedSteps((prev) => new Set(prev).add(activeTab));
            setActiveTab(steps[currentStepIndex + 1]);
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setActiveTab(steps[currentStepIndex - 1]);
        }
    };

    // Función de validación que se pasa al stepper
    const handleValidateStep = async (stepId: string): Promise<boolean> => {
        const isValid = await validateStep(stepId);
        if (isValid) {
            // Marcar el paso como completado si es válido
            setCompletedSteps((prev) => new Set(prev).add(stepId));
        }
        return isValid;
    };

    // Función para manejar el cambio de tab desde el stepper
    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
    };

    // Usar la función helper para calcular errores por sección
    const erroresPorSeccion = getErrorsBySection(errors);

    const totalErrors = Object.values(erroresPorSeccion).reduce((acc, curr) => acc + curr, 0);

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            console.log('=== INICIO DEL ENVÍO ===');
            console.log('Datos del formulario a enviar:', data);

            const response = await axios.post('/admision', data, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            console.log('=== RESPUESTA COMPLETA ===');
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            console.log('Data:', response.data);
            console.log('========================');

            // Verificar que la respuesta sea exitosa
            if (response.status < 200 || response.status >= 300) {
                throw new Error(`Status HTTP ${response.status}: ${response.statusText}`);
            }

            // Verificar que tenemos los datos necesarios
            if (!response.data || !response.data.estudiante) {
                throw new Error('Respuesta del servidor incompleta - falta información del estudiante');
            }

            console.log('Procesando respuesta exitosa...');

            // Limpiar borrador al enviar exitosamente
            try {
                clearDraft();
                console.log('Borrador limpiado exitosamente');
            } catch (draftError) {
                console.warn('Error al limpiar borrador:', draftError);
                // No es crítico, continuar
            }

            // Configurar datos de la respuesta de manera más robusta
            const submissionDate = new Date();
            const estudianteData = response.data.estudiante;

            setSubmissionData({
                estudiante: {
                    codigo: estudianteData?.codigo || 'N/A',
                    primer_nombre: data.primer_nombre,
                    primer_apellido: data.primer_apellido,
                    email: data.email,
                },
                submissionDate,
            });

            console.log('Datos de envío configurados, mostrando modal de éxito...');

            // Mostrar modal de éxito
            setShowSuccessModal(true);
            setFormStatus('success');

            console.log('Solicitud procesada exitosamente');
        } catch (error) {
            console.error('=== ERROR DETALLADO ===');
            console.error('Error completo:', error);

            // Análisis más detallado del error
            let errorMessage = 'No se pudo procesar tu solicitud. Intenta nuevamente más tarde.';
            let errorDetails = '';

            if (axios.isAxiosError(error)) {
                console.error('Es un error de Axios');

                if (error.response) {
                    // Error de respuesta del servidor
                    console.error('Error de respuesta del servidor:');
                    console.error('- Status:', error.response.status);
                    console.error('- Data:', error.response.data);
                    console.error('- Headers:', error.response.headers);

                    if (error.response.status === 419) {
                        errorMessage = 'Error de seguridad (CSRF). Por favor, recarga la página e intenta nuevamente.';
                        errorDetails = 'Token CSRF expirado o inválido';
                    } else if (error.response.status === 422) {
                        errorMessage = 'Hay errores en los datos del formulario. Por favor revisa la información ingresada.';
                        errorDetails = JSON.stringify(error.response.data.errors || error.response.data, null, 2);
                    } else if (error.response.status >= 500) {
                        errorMessage = 'Error interno del servidor. Por favor intenta más tarde.';
                        errorDetails = error.response.data.message || 'Error del servidor';
                    } else if (error.response.status === 404) {
                        errorMessage = 'La ruta del formulario no fue encontrada. Contacta al administrador.';
                        errorDetails = 'Ruta /admision no encontrada';
                    } else {
                        errorMessage = `Error del servidor (${error.response.status}). Por favor intenta más tarde.`;
                        errorDetails = error.response.statusText;
                    }
                } else if (error.request) {
                    // Error de red/conexión
                    console.error('Error de conexión:', error.request);
                    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                    errorDetails = 'Sin respuesta del servidor';
                } else {
                    // Error de configuración
                    console.error('Error de configuración:', error.message);
                    errorMessage = 'Error en la configuración de la petición.';
                    errorDetails = error.message;
                }
            } else if (error instanceof Error) {
                // Error personalizado que lanzamos
                console.error('Error personalizado:', error.message);
                errorMessage = error.message;
                errorDetails = error.stack || '';
            }

            console.error('Mensaje de error final:', errorMessage);
            console.error('Detalles del error:', errorDetails);
            console.error('====================');

            toast.error(errorMessage);
            setErrorMessage(errorMessage + (errorDetails ? '\n\nDetalles técnicos:\n' + errorDetails : ''));
            setShowErrorModal(true);
            setFormStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Función para cerrar el modal de error y volver al formulario
    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        setFormStatus('idle');
    };

    // Función para reintentar el envío
    const handleRetrySubmission = async () => {
        setShowErrorModal(false);
        setFormStatus('idle');
        // Intentar enviar nuevamente
        await methods.handleSubmit(onSubmit)();
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

    return (
        <FormProvider {...methods}>
            <AdmissionLayout
                sidebar={
                    <AdmissionSidebar
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        erroresPorSeccion={erroresPorSeccion}
                        isLoading={isValidating}
                        disabled={formStatus === 'success'}
                        onValidateStep={handleValidateStep}
                        completedSteps={completedSteps}
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
                                {currentStepIndex + 1 === 1 && 'Paso 1 de 5: Ingresa los datos personales del aspirante'}
                                {currentStepIndex + 1 === 2 && 'Paso 2 de 5: Proporciona los datos de contacto de los responsables'}
                                {currentStepIndex + 1 === 3 && 'Paso 3 de 5: Ingresa la dirección de residencia del aspirante'}
                                {currentStepIndex + 1 === 4 && 'Paso 4 de 5: Selecciona el centro educativo y nivel de estudios'}
                                {currentStepIndex + 1 === 5 && 'Paso 5 de 5: Revisa toda la información y envía la solicitud'}
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

            {/* Modal de error */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={handleCloseErrorModal}
                title="Error al procesar la solicitud"
                message={errorMessage}
                onRetry={handleRetrySubmission}
                showRetry={true}
            />

            <Toaster position="top-right" richColors />
        </FormProvider>
    );
}
