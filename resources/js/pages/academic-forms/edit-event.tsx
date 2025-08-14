import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Panel Académico', href: '/dashboard/academico' },
    { title: 'Editar Evento', href: '#' },
];

const EVENT_STATUSES = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'completado', label: 'Completado' },
];

interface Event {
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description: string;
    location: string;
    status: string;
}

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

export default function EditEventPage() {
    const { event } = usePage<{
        event: Event;
    }>().props;

    const form = useForm({
        name: event.name || '',
        type: event.type || '',
        start_date: event.start_date || '',
        end_date: event.end_date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        description: event.description || '',
        location: event.location || '',
        status: event.status || 'activo',
    });

    const { data, setData, put, processing } = form;
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        
        if (!data.name) {
            newErrors.name = 'El nombre del evento es requerido';
        }
        
        if (!data.type) {
            newErrors.type = 'El tipo de evento es requerido';
        }
        
        if (!data.start_date) {
            newErrors.start_date = 'La fecha de inicio es requerida';
        }
        
        if (!data.end_date) {
            newErrors.end_date = 'La fecha de fin es requerida';
        }
        
        if (data.start_date && data.end_date && new Date(data.start_date) > new Date(data.end_date)) {
            newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
        }
        
        setValidationErrors(newErrors);
    }, [data.name, data.type, data.start_date, data.end_date]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('academic-forms.update', event.id));
    };

    const isFormValid = () => {
        return (
            data.name &&
            data.type &&
            data.start_date &&
            data.end_date &&
            Object.keys(validationErrors).length === 0
        );
    };

    const getFieldValidation = (field: string) => {
        switch (field) {
            case 'name':
                return { isValid: !!data.name, value: data.name || 'Sin especificar', isEmpty: !data.name };
            case 'type':
                return { 
                    isValid: !!data.type, 
                    value: data.type ? EVENT_TYPES.find(t => t.value === data.type)?.label || 'Sin especificar' : 'Sin especificar', 
                    isEmpty: !data.type 
                };
            case 'dates':
                return {
                    isValid: !!data.start_date && !!data.end_date && !validationErrors.end_date,
                    value: data.start_date && data.end_date ? `${data.start_date} - ${data.end_date}` : 'Sin especificar',
                    isEmpty: !data.start_date || !data.end_date,
                };
            case 'time':
                return {
                    isValid: true, 
                    value: data.start_time && data.end_time ? `${data.start_time} - ${data.end_time}` : 'Sin especificar',
                    isEmpty: !data.start_time || !data.end_time,
                };
            case 'location':
                return {
                    isValid: true, 
                    value: data.location || 'No especificada',
                    isEmpty: !data.location,
                };
            case 'description':
                return {
                    isValid: true, 
                    value: data.description || 'Sin descripción',
                    isEmpty: !data.description,
                };
            case 'status':
                return { 
                    isValid: !!data.status, 
                    value: data.status ? EVENT_STATUSES.find(s => s.value === data.status)?.label || 'Sin especificar' : 'Sin especificar', 
                    isEmpty: !data.status 
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
            <Head title="Editar Evento" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Editar evento</CardTitle>
                            <CardDescription>Actualiza los datos del evento académico.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-8">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Información Básica</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Actualiza los datos básicos del evento
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre del Evento *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Nombre del evento"
                                            />
                                            {validationErrors.name && <p className="text-sm text-red-600">{validationErrors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="type">Tipo de Evento *</Label>
                                            <Select value={data.type} onValueChange={(value) => setData('type', value)}>
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
                                            {validationErrors.type && <p className="text-sm text-red-600">{validationErrors.type}</p>}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="status">Estado del Evento *</Label>
                                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
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
                                            <Label htmlFor="start_date">Fecha de Inicio *</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                            />
                                            {validationErrors.start_date && <p className="text-sm text-red-600">{validationErrors.start_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">Fecha de Fin *</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                            />
                                            {validationErrors.end_date && <p className="text-sm text-red-600">{validationErrors.end_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="start_time">Hora de Inicio</Label>
                                            <Input
                                                id="start_time"
                                                type="time"
                                                value={data.start_time}
                                                onChange={(e) => setData('start_time', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_time">Hora de Fin</Label>
                                            <Input
                                                id="end_time"
                                                type="time"
                                                value={data.end_time}
                                                onChange={(e) => setData('end_time', e.target.value)}
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
                                            <Label htmlFor="location">Ubicación</Label>
                                            <Input
                                                id="location"
                                                value={data.location}
                                                onChange={(e) => setData('location', e.target.value)}
                                                placeholder="Ubicación del evento"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Descripción</Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
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
                                        <SummaryItem label="Nombre" field="name" />
                                        <SummaryItem label="Tipo" field="type" />
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
                                                Completa todos los campos requeridos para actualizar el evento
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
                                        Actualizar evento
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