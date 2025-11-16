import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimePicker } from '@/components/ui/time-picker';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Panel Académico', href: '/dashboard/academico' },
    { title: 'Crear Evento', href: '/dashboard/academic-forms/create-event' },
];

const EVENT_TYPES = [
    { value: 'registro-aspirantes', label: 'Registro de Aspirantes' },
    { value: 'inscripcion', label: 'Inscripción' },
    { value: 'academia-sabatina', label: 'Academia Sabatina' },
    { value: 'fin-de-mes', label: 'Fin de Mes' },
    { value: 'fdtc', label: 'FDTC' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'examen', label: 'Examen' },
    { value: 'graduacion', label: 'Graduación' },
];

const EVENT_STATUSES = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'completado', label: 'Completado' },
];

export default function CreateEvent() {
    const form = useForm({
        nombre: '',
        clasificacion: '',
        fecha_inicio: '',
        fecha_fin: '',
        hora_inicio: '',
        hora_fin: '',
        descripcion: '',
        ubicacion: '',
        estado: 'activo',
    });

    const { data, setData, post, processing } = form;
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        
        if (!data.nombre) {
            newErrors.nombre = 'El nombre del evento es requerido';
        }
        
        if (!data.clasificacion) {
            newErrors.clasificacion = 'El tipo de evento es requerido';
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
    }, [data.nombre, data.clasificacion, data.fecha_inicio, data.fecha_fin]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('academic-forms.store'));
    };

    const isFormValid = () => {
        return (
            data.nombre &&
            data.clasificacion &&
            data.fecha_inicio &&
            data.fecha_fin &&
            Object.keys(validationErrors).length === 0
        );
    };

    const getFieldValidation = (field: string) => {
        switch (field) {
            case 'nombre':
                return { isValid: !!data.nombre, value: data.nombre || 'Sin especificar', isEmpty: !data.nombre };
            case 'clasificacion':
                return { 
                    isValid: !!data.clasificacion, 
                    value: data.clasificacion ? EVENT_TYPES.find(t => t.value === data.clasificacion)?.label || 'Sin especificar' : 'Sin especificar', 
                    isEmpty: !data.clasificacion 
                };
            case 'dates':
                return {
                    isValid: !!data.fecha_inicio && !!data.fecha_fin && !validationErrors.fecha_fin,
                    value: data.fecha_inicio && data.fecha_fin ? `${data.fecha_inicio} - ${data.fecha_fin}` : 'Sin especificar',
                    isEmpty: !data.fecha_inicio || !data.fecha_fin,
                };
            case 'time':
                return {
                    isValid: true,
                    value: data.hora_inicio && data.hora_fin ? `${data.hora_inicio} - ${data.hora_fin}` : 'Sin especificar',
                    isEmpty: !data.hora_inicio || !data.hora_fin,
                };
            case 'location':
                return {
                    isValid: true,
                    value: data.ubicacion || 'No especificada',
                    isEmpty: !data.ubicacion,
                };
            case 'description':
                return {
                    isValid: true,
                    value: data.descripcion || 'Sin descripción',
                    isEmpty: !data.descripcion,
                };
            case 'status':
                return { 
                    isValid: !!data.estado, 
                    value: data.estado ? EVENT_STATUSES.find(s => s.value === data.estado)?.label || 'Sin especificar' : 'Sin especificar', 
                    isEmpty: !data.estado 
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
                    <span className={validation.isEmpty ? 'text-muted-foreground' : 'text-foreground'}>{validation.value}</span>
                </p>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Crear Nuevo Evento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Crear nuevo evento</CardTitle>
                            <CardDescription>Configura un evento académico en el sistema.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-8">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Información Básica</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Define los datos principales del evento
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nombre">Nombre del Evento *</Label>
                                            <Input
                                                id="nombre"
                                                value={data.nombre}
                                                onChange={(e) => setData('nombre', e.target.value)}
                                                placeholder="Nombre del evento"
                                            />
                                            {validationErrors.nombre && <p className="text-sm text-red-600">{validationErrors.nombre}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="clasificacion">Tipo de Evento *</Label>
                                            <Select value={data.clasificacion} onValueChange={(value) => setData('clasificacion', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_TYPES.map((type) => (
                                                        <SelectItem key={type.value} value={type.value}>
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {validationErrors.clasificacion && <p className="text-sm text-red-600">{validationErrors.clasificacion}</p>}
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="estado">Estado del Evento *</Label>
                                            <Select value={data.estado} onValueChange={(value) => setData('estado', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona un estado" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {EVENT_STATUSES.map((status) => (
                                                        <SelectItem key={status.value} value={status.value}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-2 w-2 rounded-full ${
                                                                    status.value === 'activo' ? 'bg-green-500' :
                                                                    status.value === 'inactivo' ? 'bg-red-500' :
                                                                    'bg-gray-500'
                                                                }`} />
                                                                {status.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {validationErrors.status && <p className="text-sm text-red-600">{validationErrors.status}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas y Horarios */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Fechas y Horarios</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Define cuándo se realizará el evento
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
                                            {validationErrors.fecha_inicio && <p className="text-sm text-red-600">{validationErrors.fecha_inicio}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                                            <Input
                                                id="fecha_fin"
                                                type="date"
                                                value={data.fecha_fin}
                                                onChange={(e) => setData('fecha_fin', e.target.value)}
                                            />
                                            {validationErrors.fecha_fin && <p className="text-sm text-red-600">{validationErrors.fecha_fin}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hora_inicio">Hora de Inicio</Label>
                                            <TimePicker
                                                id="hora_inicio"
                                                value={data.hora_inicio}
                                                onChange={(value) => setData('hora_inicio', value)}
                                                placeholder="Seleccionar hora de inicio"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="hora_fin">Hora de Fin</Label>
                                            <TimePicker
                                                id="hora_fin"
                                                value={data.hora_fin}
                                                onChange={(value) => setData('hora_fin', value)}
                                                placeholder="Seleccionar hora de fin"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detalles Adicionales */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Detalles Adicionales</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Información complementaria del evento
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="ubicacion">Ubicación</Label>
                                            <Input
                                                id="ubicacion"
                                                value={data.ubicacion}
                                                onChange={(e) => setData('ubicacion', e.target.value)}
                                                placeholder="Ubicación del evento"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion">Descripción</Label>
                                            <Textarea
                                                id="descripcion"
                                                value={data.descripcion}
                                                onChange={(e) => setData('descripcion', e.target.value)}
                                                placeholder="Describe el evento..."
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Resumen */}
                                <div className="rounded-lg border bg-card p-4">
                                    <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                        Resumen del evento
                                    </h4>
                                    <div className="space-y-2">
                                        <SummaryItem label="Nombre" field="nombre" />
                                        <SummaryItem label="Clasificación" field="clasificacion" />
                                        <SummaryItem label="Estado" field="status" />
                                        <SummaryItem label="Fechas" field="dates" />
                                        <SummaryItem label="Horario" field="time" />
                                        <SummaryItem label="Ubicación" field="location" />
                                        <SummaryItem label="Descripción" field="description" />
                                    </div>
                                    {!isFormValid() && (
                                        <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                                            <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                                                <AlertTriangle className="h-4 w-4" />
                                                Completa todos los campos requeridos para crear el evento
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-between gap-4 border-t pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('dashboard_academico')}>Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing || !isFormValid()} className="min-w-[140px]">
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Crear evento
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