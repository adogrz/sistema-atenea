'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

export default function DatosResponsables() {
    const form = useFormContext();
    const [showSecondResponsable, setShowSecondResponsable] = useState(false);

    // Función para formatear DUI mientras escribe
    const formatDUI = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 8) {
            return cleaned.replace(/(\d{8})/, '$1-');
        }
        return cleaned.substring(0, 8) + '-' + cleaned.substring(8, 9);
    };

    // Función para manejar cambio en DUI
    const handleDUIChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 9) {
            field.onChange(value);
        }
    };

    // Función para manejar cambio en teléfono
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void }) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 8) {
            field.onChange(value);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Responsables</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Información de contacto de los responsables del aspirante. Al menos un responsable es obligatorio.
                </p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* RESPONSABLE 1 - OBLIGATORIO */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Información del responsable 1</h3>

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
                                        <Input placeholder="Ej. María José" {...field} />
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
                                        <Input placeholder="Ej. Gutiérrez Domínguez" {...field} />
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
                                            onChange={(e) => handleDUIChange(e, field)}
                                            maxLength={10}
                                        />
                                    </FormControl>
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
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                        }}
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
                                                <Input placeholder="Ej. Hermano/a, Primo/a, etc." {...field} />
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
                                    <div className="flex items-center gap-2">
                                        <FormLabel>Correo electrónico (recomendado)</FormLabel>
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
                                            onChange={(e) => handlePhoneChange(e, field)}
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
                        <Button type="button" variant="outline" onClick={() => setShowSecondResponsable(true)} className="w-full max-w-md">
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar segundo responsable (opcional)
                        </Button>
                    </div>
                )}

                {/* RESPONSABLE 2 - OPCIONAL */}
                {showSecondResponsable && (
                    <>
                        <Separator className="my-6" />

                        <div className="space-y-6">
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

                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Nombres y Apellidos */}
                                <FormField
                                    control={form.control}
                                    name="nombres_responsable_2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombres</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Carlos Alberto" {...field} />
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
                                            <FormLabel>Apellidos</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Martínez Silva" {...field} />
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
                                            <FormLabel>DUI</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="12345678-9"
                                                    value={field.value ? formatDUI(field.value) : ''}
                                                    onChange={(e) => handleDUIChange(e, field)}
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
                                            <FormLabel>Parentesco</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                }}
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
                                                        <Input placeholder="Ej. Hermano/a, Primo/a, etc." {...field} />
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
                                            <FormLabel>Correo electrónico (opcional)</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="responsable2@ejemplo.com" {...field} />
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
                                            <FormLabel>Teléfono de contacto</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="tel"
                                                    placeholder="7234-5678"
                                                    value={field.value ? field.value.replace(/(\d{4})(\d{4})/, '$1-$2') : ''}
                                                    onChange={(e) => handlePhoneChange(e, field)}
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
