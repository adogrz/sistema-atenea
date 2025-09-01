'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, HelpCircle, Minus, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export default function DatosResponsables() {
    const form = useFormContext();
    const [showSecondResponsable, setShowSecondResponsable] = useState(false);
    const secondResponsableRef = useRef<HTMLDivElement>(null);

    // Observar los valores del responsable 2 para mostrar asteriscos dinámicamente
    const watchedValues = useWatch({
        control: form.control,
        name: ['dui_responsable_2', 'nombres_responsable_2', 'apellidos_responsable_2', 'telefono_responsable_2', 'tipo_parentesco_2'],
    });

    // Verificar si hay algún dato del responsable 2 para mostrar asteriscos
    const hasAnySecondResponsableData = () => {
        const [dui, nombres, apellidos, telefono, parentesco] = watchedValues;
        return (
            (dui && dui.trim() !== '') ||
            (nombres && nombres.trim() !== '') ||
            (apellidos && apellidos.trim() !== '') ||
            (telefono && telefono.trim() !== '') ||
            (parentesco && parentesco.trim() !== '')
        );
    };

    // Función para formatear DUI mientras escribe
    const formatDUI = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 8) {
            return cleaned.replace(/(\d{8})/, '$1-');
        }
        return cleaned.substring(0, 8) + '-' + cleaned.substring(8, 9);
    };

    // Función para validar todos los campos del responsable 2 cuando hay datos parciales
    const triggerResponsable2Validation = (currentFieldName: string, currentValue: string) => {
        // Obtener los valores actuales del formulario
        const formValues = form.getValues();

        // Simular el valor que se acaba de cambiar
        const updatedValues = { ...formValues, [currentFieldName]: currentValue };

        // Verificar si hay algún dato del responsable 2 con los valores actualizados
        const hasAnyData =
            (updatedValues.dui_responsable_2 && updatedValues.dui_responsable_2.trim() !== '') ||
            (updatedValues.nombres_responsable_2 && updatedValues.nombres_responsable_2.trim() !== '') ||
            (updatedValues.apellidos_responsable_2 && updatedValues.apellidos_responsable_2.trim() !== '') ||
            (updatedValues.telefono_responsable_2 && updatedValues.telefono_responsable_2.trim() !== '') ||
            (updatedValues.tipo_parentesco_2 && updatedValues.tipo_parentesco_2.trim() !== '');

        // Si hay algún dato, validar todos los campos del responsable 2
        if (hasAnyData) {
            setTimeout(() => {
                form.trigger([
                    'dui_responsable_2',
                    'nombres_responsable_2',
                    'apellidos_responsable_2',
                    'telefono_responsable_2',
                    'tipo_parentesco_2',
                ]);
            }, 150);
        }
    };

    // Función para manejar cambio en DUI
    const handleDUIChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }, fieldName: string) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 9) {
            field.onChange(value);
            // Validar en tiempo real y limpiar errores si es válido
            if (value.length === 9) {
                setTimeout(() => form.trigger(fieldName), 100);
            }

            // Si es del responsable 2, activar validación de todos los campos cuando hay datos parciales
            if (fieldName.includes('responsable_2')) {
                triggerResponsable2Validation(fieldName, value);
            }
        }
    };

    // Función para manejar cambio en teléfono
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }, fieldName: string) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            field.onChange(value);
            // Validar en tiempo real y limpiar errores si es válido
            if (value.length === 8 && /^[267]/.test(value)) {
                setTimeout(() => form.trigger(fieldName), 100);
            }

            // Si es del responsable 2, activar validación de todos los campos cuando hay datos parciales
            if (fieldName.includes('responsable_2')) {
                triggerResponsable2Validation(fieldName, value);
            }
        }
    };

    // Función para manejar cambio en nombres/apellidos
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }, fieldName: string) => {
        const value = e.target.value;
        field.onChange(value);
        // Validar en tiempo real y limpiar errores si es válido
        if (value.trim().length > 0) {
            setTimeout(() => form.trigger(fieldName), 100);
        }

        // Si es del responsable 2, activar validación de todos los campos cuando hay datos parciales
        if (fieldName.includes('responsable_2')) {
            triggerResponsable2Validation(fieldName, value);
        }
    };

    // Función para manejar cambio en Select
    const handleSelectChange = (value: string, field: { onChange: (value: string) => void }, fieldName: string) => {
        field.onChange(value);
        // Validar en tiempo real y limpiar errores si es válido
        setTimeout(() => form.trigger(fieldName), 100);

        // Si es del responsable 2, activar validación de todos los campos cuando hay datos parciales
        if (fieldName.includes('responsable_2')) {
            triggerResponsable2Validation(fieldName, value);
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Información de Responsables</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Datos de contacto de los padres o responsables legales del aspirante. Es obligatorio proporcionar al menos un responsable.
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* RESPONSABLE 1 - OBLIGATORIO */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Responsable Principal (Obligatorio)</h3>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {/* Nombres y Apellidos */}
                        <FormField
                            control={form.control}
                            name="nombres_responsable_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nombres <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej. María José"
                                            {...field}
                                            onChange={(e) => handleTextChange(e, field, 'nombres_responsable_1')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="apellidos_responsable_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Apellidos <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej. Gutiérrez Domínguez"
                                            {...field}
                                            onChange={(e) => handleTextChange(e, field, 'apellidos_responsable_1')}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* DUI y Parentesco */}
                        <FormField
                            control={form.control}
                            name="dui_responsable_1"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>
                                            DUI <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4">
                                                        <HelpCircle className="h-3 w-3" />
                                                        <span className="sr-only">Ayuda</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Documento Único de Identidad (9 dígitos)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <FormControl>
                                        <Input
                                            placeholder="12345678-9"
                                            value={field.value ? formatDUI(field.value) : ''}
                                            onChange={(e) => handleDUIChange(e, field, 'dui_responsable_1')}
                                            maxLength={10}
                                        />
                                    </FormControl>
                                    <FormDescription>Debe contener 9 dígitos, formato: 12345678-9</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="tipo_parentesco_1"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormLabel>
                                            Parentesco <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4">
                                                        <HelpCircle className="h-3 w-3" />
                                                        <span className="sr-only">Ayuda</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Relación familiar con el aspirante</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <Select
                                        onValueChange={(value) => handleSelectChange(value, field, 'tipo_parentesco_1')}
                                        value={field.value || ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el parentesco" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Madre">Madre</SelectItem>
                                            <SelectItem value="Padre">Padre</SelectItem>
                                            <SelectItem value="Abuelo">Abuelo/a</SelectItem>
                                            <SelectItem value="Tio">Tío/a</SelectItem>
                                            <SelectItem value="Tutor legal">Tutor legal</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo condicional para "Otro" parentesco */}
                        {form.watch('tipo_parentesco_1') === 'Otro' && (
                            <div className="lg:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="otro_parentesco_1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Especifica el parentesco <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej. Hermano/a, Primo/a, etc."
                                                    {...field}
                                                    onChange={(e) => handleTextChange(e, field, 'otro_parentesco_1')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Correo y Teléfono */}
                        <FormField
                            control={form.control}
                            name="email_responsable_1"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between gap-1">
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-muted-foreground">Recomendado</span>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-4 w-4">
                                                            <HelpCircle className="h-3 w-3" />
                                                            <span className="sr-only">Ayuda</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Para recibir notificaciones importantes del proceso</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Input type="email" placeholder="responsable@ejemplo.com" {...field} />
                                    </FormControl>
                                    <FormDescription>Te enviaremos actualizaciones importantes del proceso de admisión</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="telefono_responsable_1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Teléfono de contacto <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="7234-5678"
                                            value={field.value ? field.value.replace(/(\d{4})(\d{4})/, '$1-$2') : ''}
                                            onChange={(e) => handlePhoneChange(e, field, 'telefono_responsable_1')}
                                            maxLength={9}
                                        />
                                    </FormControl>
                                    <FormDescription>Número de 8 dígitos que inicie con 2, 6 o 7</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* BOTÓN PARA AGREGAR SEGUNDO RESPONSABLE */}
                {!showSecondResponsable && (
                    <div className="flex justify-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowSecondResponsable(true);
                                // Scroll suave hacia el segundo responsable después de un breve delay
                                setTimeout(() => {
                                    secondResponsableRef.current?.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    });
                                }, 100);
                            }}
                            className="group text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            <ArrowRight className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            Agregar segundo responsable (opcional)
                        </Button>
                    </div>
                )}

                {/* RESPONSABLE 2 - OPCIONAL */}
                {showSecondResponsable && (
                    <>
                        <Separator className="my-6" />

                        <div className="space-y-6" ref={secondResponsableRef}>
                            <div>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Información del responsable 2 <span className="text-sm text-muted-foreground">(Opcional)</span>
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowSecondResponsable(false);
                                            // Limpiar campos del segundo responsable
                                            form.setValue('dui_responsable_2', '');
                                            form.setValue('nombres_responsable_2', '');
                                            form.setValue('apellidos_responsable_2', '');
                                            form.setValue('tipo_parentesco_2', undefined);
                                            form.setValue('email_responsable_2', '');
                                            form.setValue('telefono_responsable_2', '');
                                            form.setValue('otro_parentesco_2', '');
                                            // Limpiar errores de validación
                                            form.clearErrors('dui_responsable_2');
                                            form.clearErrors('nombres_responsable_2');
                                            form.clearErrors('apellidos_responsable_2');
                                            form.clearErrors('tipo_parentesco_2');
                                            form.clearErrors('email_responsable_2');
                                            form.clearErrors('telefono_responsable_2');
                                            form.clearErrors('otro_parentesco_2');
                                        }}
                                    >
                                        <Minus className="mr-1 h-4 w-4" />
                                        Quitar
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Si decides completar este responsable, todos los campos son obligatorios excepto el correo electrónico.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Nombres y Apellidos */}
                                <FormField
                                    control={form.control}
                                    name="nombres_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombres {hasAnySecondResponsableData() && <span className="text-red-500">*</span>}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej. Carlos Alberto"
                                                    {...field}
                                                    autoFocus
                                                    onChange={(e) => handleTextChange(e, field, 'nombres_responsable_2')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="apellidos_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Apellidos {hasAnySecondResponsableData() && <span className="text-red-500">*</span>}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej. Martínez Silva"
                                                    {...field}
                                                    onChange={(e) => handleTextChange(e, field, 'apellidos_responsable_2')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* DUI y Parentesco */}
                                <FormField
                                    control={form.control}
                                    name="dui_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>DUI {hasAnySecondResponsableData() && <span className="text-red-500">*</span>}</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="12345678-9"
                                                    value={field.value ? formatDUI(field.value) : ''}
                                                    onChange={(e) => handleDUIChange(e, field, 'dui_responsable_2')}
                                                    maxLength={10}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="tipo_parentesco_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Parentesco {hasAnySecondResponsableData() && <span className="text-red-500">*</span>}
                                            </FormLabel>
                                            <Select
                                                onValueChange={(value) => handleSelectChange(value, field, 'tipo_parentesco_2')}
                                                value={field.value || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona el parentesco" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Madre">Madre</SelectItem>
                                                    <SelectItem value="Padre">Padre</SelectItem>
                                                    <SelectItem value="Abuelo">Abuelo/a</SelectItem>
                                                    <SelectItem value="Tio">Tío/a</SelectItem>
                                                    <SelectItem value="Tutor legal">Tutor legal</SelectItem>
                                                    <SelectItem value="Otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Campo condicional para "Otro" parentesco */}
                                {form.watch('tipo_parentesco_2') === 'Otro' && (
                                    <div className="lg:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="otro_parentesco_2"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Especifica el parentesco <span className="text-red-500">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Ej. Hermano/a, Primo/a, etc."
                                                            {...field}
                                                            onChange={(e) => handleTextChange(e, field, 'otro_parentesco_2')}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                {/* Correo y Teléfono */}
                                <FormField
                                    control={form.control}
                                    name="email_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center justify-between gap-1">
                                                <FormLabel>Correo electrónico</FormLabel>
                                                <span className="text-sm text-muted-foreground">Opcional</span>
                                            </div>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="responsable2@ejemplo.com"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e.target.value);
                                                        // Validar email si no está vacío
                                                        if (e.target.value.trim().length > 0) {
                                                            setTimeout(() => form.trigger('email_responsable_2'), 100);
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="telefono_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Teléfono de contacto {hasAnySecondResponsableData() && <span className="text-red-500">*</span>}
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="7234-5678"
                                                    value={field.value ? field.value.replace(/(\d{4})(\d{4})/, '$1-$2') : ''}
                                                    onChange={(e) => handlePhoneChange(e, field, 'telefono_responsable_2')}
                                                    maxLength={9}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
