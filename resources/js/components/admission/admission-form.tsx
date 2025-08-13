'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

import { useStepValidation } from '@/hooks/useStepValidation';
import AdmissionLayout from '@/layouts/admission/admission-layout';
import { fullFormSchema, getErrorsBySection } from '@/lib/validations/admission-schemas';
import { Departamento } from '@/types/admission/address';
import { CentroEducativo, NivelEducativo } from '@/types/admission/education';
import { usePage } from '@inertiajs/react';
import AdmissionSidebar from './admission-sidebar';
import Captcha from './captcha';
import Direccion from './sections/address';
import Educacion from './sections/education';
import DatosPersonales from './sections/personal-data';
import DatosResponsable from './sections/responsible';
import ResumenSolicitud from './sections/summary';

type FormData = z.infer<typeof fullFormSchema>;

export default function FormularioAdmision() {
    const [activeTab, setActiveTab] = useState('datos-personales');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [captchaVerified, setCaptchaVerified] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const { departamentos, centros_educativos, niveles_educativos } = usePage<{
        departamentos: Departamento[];
        centros_educativos: CentroEducativo[];
        niveles_educativos: NivelEducativo[];
    }>().props;

    const methods = useForm<FormData>({
        resolver: zodResolver(fullFormSchema),
        defaultValues: {
            primer_nombre: '',
            segundo_nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            sexo: '' as unknown as 'H' | 'M',
            fecha_nacimiento: '',
            nie: '',
            email: '',
            telefono_casa: '',
            direccion: '',
            distrito: '',
            departamento: '',
            municipio: '',
            centro_educativo: '',
            sector: 'PÚBLICO',
            zona: 'Rural',
            internacional: 'NO',
            nivel_educativo: '' as unknown as string,
            dui_responsable_1: '',
            nombres_responsable_1: '',
            apellidos_responsable_1: '',
            email_responsable_1: '',
            telefono_responsable_1: '',
            tipo_parentesco_1: '' as unknown as string,
            dui_responsable_2: '',
            nombres_responsable_2: '',
            apellidos_responsable_2: '',
            email_responsable_2: '',
            telefono_responsable_2: '',
            tipo_parentesco_2: '' as unknown as string,
        } as FormData,
        mode: 'onTouched',
    });

    const {
        formState: { errors },
        trigger,
        getValues,
        clearErrors,
    } = methods;

    // Usar el hook personalizado para validación
    const { validateStep, isValidating } = useStepValidation({ getValues, trigger, clearErrors });

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
            await axios.post('/admision', data, {
                headers: {
                    Accept: 'application/json',
                },
            });

            toast.success('Solicitud enviada ¡Tu postulación ha sido registrada correctamente!');
            setFormStatus('success');
        } catch (error) {
            console.error('Error al enviar:', error);
            toast.error('No se pudo procesar tu solicitud! Intenta nuevamente más tarde.');
            setFormStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (formStatus === 'success') {
        return (
            <Card className="mx-auto max-w-md p-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="rounded-full bg-green-100 p-3">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold">¡Solicitud enviada con éxito!</h2>
                    <p className="text-muted-foreground">Tu solicitud ha sido recibida correctamente. Te hemos enviado un correo de confirmación.</p>
                    <Button onClick={() => (window.location.href = '/')}>Volver al inicio</Button>
                </div>
            </Card>
        );
    }

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
            <Toaster richColors />
            <AdmissionLayout
                sidebar={
                    <AdmissionSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        erroresPorSeccion={erroresPorSeccion}
                        isLoading={isValidating}
                    />
                }
            >
                <div className="flex h-full flex-1 flex-col gap-6 p-4">
                    <div className="mx-auto w-full max-w-4xl">
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

                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Contenido del formulario - cada sección con su propia Card */}
                            <div>
                                {activeTab === 'datos-personales' && <DatosPersonales />}
                                {activeTab === 'datos-responsables' && <DatosResponsable />}
                                {activeTab === 'direccion' && (
                                    <Direccion departamentos={departamentos} municipiosPorDepartamento={{}} distritosPorMunicipio={{}} />
                                )}
                                {activeTab === 'educacion' && (
                                    <Educacion centros_educativos={centros_educativos} niveles_educativos={niveles_educativos} />
                                )}
                                {activeTab === 'resumen' && (
                                    <ResumenSolicitud
                                        departamentos={departamentos}
                                        municipios={{}}
                                        distritos={{}}
                                        niveles_educativos={niveles_educativos}
                                        centros_educativos={centros_educativos}
                                    />
                                )}
                            </div>

                            {/* Captcha solo en el paso resumen */}
                            {activeTab === 'resumen' && (
                                <div className="space-y-6">
                                    <Captcha onVerify={setCaptchaVerified} />
                                </div>
                            )}

                            {/* Alertas de errores y estado */}
                            {totalErrors > 0 && activeTab === 'resumen' && (
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
                            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background pt-6">
                                {currentStepIndex > 0 && (
                                    <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting || isValidating}>
                                        Anterior
                                    </Button>
                                )}

                                {currentStepIndex === 0 && <div />}

                                {activeTab !== 'resumen' ? (
                                    <Button type="button" onClick={handleNext} disabled={isSubmitting || isValidating} className="min-w-[120px]">
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
                                    <Button type="submit" disabled={isSubmitting || !captchaVerified || totalErrors > 0} className="min-w-[160px]">
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
                        </form>
                    </div>
                </div>
            </AdmissionLayout>
        </FormProvider>
    );
}
