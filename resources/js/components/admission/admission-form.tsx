'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

import AdmissionLayout from '@/layouts/admission/admission-layout';
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

// Esquema de validación completo para todo el formulario
export const formSchema = z.object({
    // Datos del estudiante
    codigo: z
        .string()
        .min(1)
        .regex(/^\d{5,10}$/, {
            message: 'Código debe ser numérico entre 5 y 10 dígitos',
        }),
    primer_nombre: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Nombre no válido',
        }),
    segundo_nombre: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Segundo nombre no válido',
        }),
    primer_apellido: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Apellido no válido',
        }),
    segundo_apellido: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Segundo apellido no válido',
        }),
    sexo: z.enum(['H', 'M']),
    fecha_nacimiento: z.string().refine(
        (val) => {
            const parsed = Date.parse(val);
            return !isNaN(parsed) && new Date(parsed) < new Date();
        },
        { message: 'Fecha inválida o en el futuro' },
    ),
    nie: z.string().regex(/^\d{7,10}$/, {
        message: 'NIE debe ser numérico entre 7 y 10 dígitos',
    }),
    email: z.string().email(),

    // Dirección
    telefono_casa: z
        .string()
        .regex(/^[267]\d{7}$/)
        .nullable()
        .optional(),
    direccion: z.string().min(5).max(255),
    distrito: z.string().regex(/^\d+$/, {
        message: 'Debes seleccionar un distrito',
    }),
    departamento: z.string().min(1, {
        message: 'Debes seleccionar un departamento',
    }),
    municipio: z.string().min(1, {
        message: 'Debes seleccionar un municipio',
    }),

    // Datos del responsable 1
    dui_responsable_1: z.string().regex(/^\d{9}$/, {
        message: 'DUI debe tener 9 dígitos numéricos',
    }),
    nombres_responsable_1: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Nombre del responsable no válido',
        }),
    apellidos_responsable_1: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Apellido del responsable no válido',
        }),
    email_responsable_1: z.string().email().nullable().optional(),
    telefono_responsable_1: z.string().regex(/^[267]\d{7}$/, {
        message: 'Teléfono del responsable inválido',
    }),
    tipo_parentesco_1: z.enum(['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal']),

    // Datos del responsable 2 (opcional)
    dui_responsable_2: z
        .string()
        .regex(/^\d{9}$/, {
            message: 'DUI debe tener 9 dígitos numéricos',
        })
        .optional(),
    nombres_responsable_2: z
        .string()
        .max(100)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Nombre del responsable no válido',
        })
        .optional(),
    apellidos_responsable_2: z
        .string()
        .max(100)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/, {
            message: 'Apellido del responsable no válido',
        })
        .optional(),
    email_responsable_2: z.string().email().nullable().optional(),
    telefono_responsable_2: z
        .string()
        .regex(/^[267]\d{7}$/, {
            message: 'Teléfono del responsable inválido',
        })
        .optional(),
    tipo_parentesco_2: z.enum(['Madre', 'Padre', 'Abuelo', 'Tio', 'Tutor legal']).optional(),

    // Educación
    centro_educativo: z
        .string()
        .min(5, { message: 'El nombre debe tener al menos 5 caracteres' })
        .max(100)
        .regex(/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9"'\s\-.]+$/, {
            message: 'Formato de nombre inválido',
        }),
    sector: z.enum(['PÚBLICO', 'PRIVADO'], {
        required_error: 'Selecciona el sector',
    }),
    zona: z.enum(['Rural', 'Urbana'], {
        required_error: 'Selecciona la zona',
    }),
    internacional: z.enum(['SI', 'NO'], {
        required_error: 'Selecciona si el centro es internacional',
    }),
    nivel_educativo: z.enum(['n0', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'], {
        required_error: 'Selecciona tu nivel de estudios',
    }),
});

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

    const methods = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            primer_nombre: '',
            segundo_nombre: '',
            primer_apellido: '',
            segundo_apellido: '',
            sexo: undefined,
            fecha_nacimiento: '',
            nie: '',
            email: '',
            telefono_casa: '',
            direccion: '',
            distrito: '',
            departamento: '',
            municipio: '',
            codigo: '',
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
            tipo_parentesco_1: undefined,
            dui_responsable_2: undefined,
            nombres_responsable_2: undefined,
            apellidos_responsable_2: undefined,
            email_responsable_2: undefined,
            telefono_responsable_2: undefined,
            tipo_parentesco_2: undefined,
        },
        mode: 'onBlur',
    });

    const {
        formState: { errors },
        trigger,
    } = methods;

    const steps = ['datos-personales', 'datos-responsables', 'direccion', 'educacion', 'resumen'];
    const currentStepIndex = steps.indexOf(activeTab);

    const handleNext = async () => {
        const fieldsToValidate = {
            'datos-personales': [
                'codigo',
                'primer_nombre',
                'segundo_nombre',
                'primer_apellido',
                'segundo_apellido',
                'sexo',
                'fecha_nacimiento',
                'nie',
                'email',
            ] as const,
            'datos-responsables': [
                'dui_responsable_1',
                'nombres_responsable_1',
                'apellidos_responsable_1',
                'telefono_responsable_1',
                'tipo_parentesco_1',
            ] as const,
            direccion: ['direccion', 'distrito', 'departamento', 'municipio'] as const,
            educacion: ['centro_educativo', 'nivel_educativo'] as const,
        }[activeTab];

        if (fieldsToValidate) {
            const isValid = await trigger(fieldsToValidate);
            if (isValid && currentStepIndex < steps.length - 1) {
                setActiveTab(steps[currentStepIndex + 1]);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStepIndex > 0) {
            setActiveTab(steps[currentStepIndex - 1]);
        }
    };

    const erroresPorSeccion = {
        'datos-personales': Object.keys(errors).filter((key) =>
            ['codigo', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo', 'fecha_nacimiento', 'nie', 'email'].includes(
                key,
            ),
        ).length,
        'datos-responsables': Object.keys(errors).filter((key) =>
            [
                'dui_responsable_1',
                'nombres_responsable_1',
                'apellidos_responsable_1',
                'telefono_responsable_1',
                'tipo_parentesco_1',
                'dui_responsable_2',
                'nombres_responsable_2',
                'apellidos_responsable_2',
                'telefono_responsable_2',
                'tipo_parentesco_2',
            ].includes(key),
        ).length,
        direccion: Object.keys(errors).filter((key) => ['direccion', 'distrito', 'departamento', 'municipio'].includes(key)).length,
        educacion: Object.keys(errors).filter((key) => ['centro_educativo', 'nivel_educativo'].includes(key)).length,
        resumen: 0,
    };

    const totalErrors = Object.values(erroresPorSeccion).reduce((acc, curr) => acc + curr, 0);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
            <AdmissionLayout sidebar={<AdmissionSidebar activeTab={activeTab} onTabChange={setActiveTab} erroresPorSeccion={erroresPorSeccion} />}>
                <div className="flex h-full flex-1 flex-col gap-6 p-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <Card>
                            <CardHeader className="pb-6">
                                <CardTitle className="text-2xl">Postulación Jóvenes Talento</CardTitle>
                                <CardDescription>Completa todos los pasos del formulario para enviar tu solicitud de admisión.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                                    {/* Contenido del formulario sin Card adicional */}
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

                                    {/* Botones de navegación */}
                                    <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t bg-background pt-6">
                                        {currentStepIndex > 0 && (
                                            <Button type="button" variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                                                Anterior
                                            </Button>
                                        )}

                                        {currentStepIndex === 0 && <div />}

                                        {activeTab !== 'resumen' ? (
                                            <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                                                Siguiente
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !captchaVerified || totalErrors > 0}
                                                onClick={methods.handleSubmit(onSubmit)}
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
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AdmissionLayout>
        </FormProvider>
    );
}
