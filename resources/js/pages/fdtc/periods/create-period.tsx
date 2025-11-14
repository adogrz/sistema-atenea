import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
    { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos' },
    { title: 'Crear Periodo', href: '/dashboard/internado-fdtc/periodos/create' },
];

export default function CreatePeriod() {

    const { flash } = usePage().props as any;

    const form = useForm({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        descripcion: '',
    });

    const { data, setData, post, processing } = form;
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        
        if (!data.nombre) {
            newErrors.nombre = 'El nombre del periodo es requerido';
        }

        if (!data.fecha_inicio) {
            newErrors.fecha_inicio = 'La fecha de inicio es requerida';
        }
        
        if (!data.fecha_fin) {
            newErrors.fecha_fin = 'La fecha de fin es requerida';
        }

        if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
            newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        
        setValidationErrors(newErrors);
    }, [data.nombre, data.fecha_inicio, data.fecha_fin]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('internado-fdtc.periodos.store'),
        {
            onSuccess: () => {
                toast.success('Periodo creado exitosamente');
            },
            onError: () => {
                toast.error('Error al crear periodo');
            },
        });
    };

    const isFormValid = () => {
        return (
            data.nombre &&
            data.fecha_inicio &&
            data.fecha_fin &&
            Object.keys(validationErrors).length === 0
        );
    };

    const getFieldValidation = (field: string) => {
        switch (field) {
            case 'nombre':
                return { 
                    isValid: !!data.nombre, 
                    value: data.nombre || 'Sin especificar', 
                    isEmpty: !data.nombre 
                };
            case 'fechas':
                return {
                    isValid: !!data.fecha_inicio && !!data.fecha_fin && !validationErrors.fecha_fin,
                    value: data.fecha_inicio && data.fecha_fin 
                        ? `${data.fecha_inicio} - ${data.fecha_fin}` 
                        : 'Sin especificar',
                    isEmpty: !data.fecha_inicio || !data.fecha_fin,
                };
            case 'descripcion':
                return {
                    isValid: true,
                    value: data.descripcion || 'Sin descripción',
                    isEmpty: !data.descripcion,
                };
            default:
                return { isValid: false, value: '', isEmpty: true };
        }
    };

    const SummaryItem = ({ label, field }: { label: string; field: string }) => {
        const validation = getFieldValidation(field);
        return (
            <div className="flex items-center gap-2">
                {validation.isValid ? (
                    <Check className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                )}
                <p className="text-sm text-foreground">
                    <span className="font-medium">{label}:</span>{' '}
                    <span className={validation.isEmpty ? 'text-muted-foreground' : 'text-foreground'}>
                        {validation.value}
                    </span>
                </p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Crear Periodo - Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Crear nuevo periodo</CardTitle>
                            <CardDescription>
                                Configura un periodo académico para registrar asistencia y conducta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-8">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Información Básica</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Define los datos principales del periodo
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre del Periodo *</Label>
                                            <Input
                                                id="nombre"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                placeholder="Ej: Enero 2025, Periodo 1 - 2025"
                                            />
                                            {validationErrors.nombre && (
                                                <p className="text-sm text-red-600">{validationErrors.nombre}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">Descripción</Label>
                                            <Textarea
                                                id="descripcion"
                                                value={data.descripcion}
                                                onChange={(e) => setData('descripcion', e.target.value)}
                                                placeholder="Descripción opcional del periodo..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Fechas del Periodo</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Define la duración del periodo académico
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                                            <Input
                                                id="fecha_inicio"
                                                type="date"
                                                value={data.fecha_inicio}
                                                onChange={(e) => setData('fecha_inicio', e.target.value)}
                                            />
                                            {validationErrors.fecha_inicio && (
                                                <p className="text-sm text-red-600">
                                                    {validationErrors.fecha_inicio}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                                            <Input
                                                id="fecha_fin"
                                                type="date"
                                                value={data.fecha_fin}
                                                onChange={(e) => setData('fecha_fin', e.target.value)}
                                            />
                                            {validationErrors.fecha_fin && (
                                                <p className="text-sm text-red-600">{validationErrors.fecha_fin}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="rounded-lg border bg-card p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        Resumen del periodo
                                    </h4>
                                    <div className="space-y-2">
                                        <SummaryItem label="Nombre" field="nombre" />
                                        <SummaryItem label="Fechas" field="fechas" />
                                        <SummaryItem label="Descripción" field="descripcion" />
                                    </div>
                                    {!isFormValid() && (
                                        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                                            <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                                <AlertTriangle className="h-4 w-4" />
                                                Completa todos los campos requeridos para crear el periodo
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-between gap-4 border-t pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('internado-fdtc.periodos')}>Cancelar</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={processing || !isFormValid()}
                                        className="min-w-[140px]"
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Crear periodo
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}