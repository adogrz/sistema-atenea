'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, MailIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export default function DatosPersonales() {
    const form = useFormContext();

    // Función para manejar input de NIE con restricción de longitud
    const handleNieChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void; onBlur: () => void }) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo números
        if (value.length <= 10) {
            // Máximo 10 dígitos
            field.onChange(value);
            // Validar en tiempo real mientras escribe
            form.trigger('nie');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Datos personales</CardTitle>
                <p className="text-sm text-muted-foreground">Ingresa tu información personal básica</p>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* IDENTIDAD */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Identidad</h3>

                    {/* Grid 2x2 para nombres, apellidos, sexo y fecha de nacimiento */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="primer_nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Primer nombre <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej. Juan"
                                            {...field}
                                            aria-label="Ingresa tu primer nombre"
                                            onBlur={() => {
                                                field.onBlur();
                                                form.trigger('primer_nombre');
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="primer_apellido"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Primer apellido <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej. Pérez"
                                            {...field}
                                            aria-label="Ingresa tu primer apellido"
                                            onBlur={() => {
                                                field.onBlur();
                                                form.trigger('primer_apellido');
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="segundo_nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between gap-1">
                                        <FormLabel>Segundo nombre</FormLabel>
                                        <span className="text-sm text-muted-foreground">Opcional</span>
                                    </div>
                                    <FormControl>
                                        <Input placeholder="Ej. Antonio" {...field} aria-label="Ingresa tu segundo nombre (opcional)" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="segundo_apellido"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between gap-1">
                                        <FormLabel>Segundo apellido</FormLabel>
                                        <span className="text-sm text-muted-foreground">Opcional</span>
                                    </div>
                                    <FormControl>
                                        <Input placeholder="Ej. González" {...field} aria-label="Ingresa tu segundo apellido" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Sexo */}
                        <FormField
                            control={form.control}
                            name="sexo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Sexo <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            // Validar inmediatamente después del cambio
                                            form.trigger('sexo');
                                        }}
                                        value={field.value || ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full sm:max-w-fit">
                                                <SelectValue placeholder="Selecciona una opción" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="H">Hombre</SelectItem>
                                            <SelectItem value="M">Mujer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Fecha de nacimiento */}
                        <FormField
                            control={form.control}
                            name="fecha_nacimiento"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <FormLabel>
                                            Fecha de nacimiento <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5"
                                                        aria-label="Ayuda para fecha de nacimiento"
                                                    >
                                                        <HelpCircle className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Para estudiantes entre 8 y 18 años</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                    <DatePicker
                                        value={(() => {
                                            if (!field.value) return undefined;

                                            try {
                                                // Parsear fecha usando el mismo método que funciona en roles-manager
                                                if (field.value.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                                                    const [year, month, day] = field.value.split('-').map((num: string) => parseInt(num, 10));
                                                    return new Date(year, month - 1, day);
                                                } else {
                                                    // Fallback para otros formatos
                                                    return new Date(field.value);
                                                }
                                            } catch (error) {
                                                console.warn('Invalid date value:', field.value, error);
                                                return undefined;
                                            }
                                        })()}
                                        onChange={(date) => {
                                            if (date) {
                                                // Formatear fecha en timezone local
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                field.onChange(`${year}-${month}-${day}`);
                                            } else {
                                                field.onChange('');
                                            }
                                            // Validar inmediatamente después del cambio
                                            form.trigger('fecha_nacimiento');
                                        }}
                                        placeholder="Selecciona fecha"
                                        className="truncate"
                                        disableDates={(date) => {
                                            const today = new Date();
                                            const maxAge = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                                            const minAge = new Date(today.getFullYear() - 8, today.getMonth(), today.getDate());
                                            return date > minAge || date < maxAge;
                                        }}
                                    />
                                    <FormDescription>Edad permitida: 8 a 18 años</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* DATOS DE CONTACTO */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Datos de contacto</h3>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>
                                        Correo electrónico <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Ayuda para correo electrónico">
                                                    <HelpCircle className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">Este correo será tu usuario de acceso a la plataforma</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            className="peer pe-9"
                                            type="email"
                                            placeholder="tu.correo@ejemplo.com"
                                            {...field}
                                            onBlur={() => {
                                                field.onBlur();
                                                // Validar cuando el usuario sale del campo
                                                form.trigger('email');
                                            }}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                            <MailIcon size={16} aria-hidden="true" />
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>Recibirás notificaciones importantes en este correo</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* IDENTIFICACIÓN ESCOLAR */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Identificación escolar</h3>

                    <FormField
                        control={form.control}
                        name="nie"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>
                                        NIE (Número de Identificación Estudiantil) <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Ayuda para NIE">
                                                    <HelpCircle className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">Número de 7-10 dígitos asignado por el MINED</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <Input
                                        type="text"
                                        placeholder="Ej. 1234567"
                                        {...field}
                                        onChange={(e) => handleNieChange(e, field)}
                                        onBlur={() => {
                                            field.onBlur();
                                            // Validar cuando el usuario sale del campo
                                            form.trigger('nie');
                                        }}
                                        maxLength={10}
                                    />
                                </FormControl>
                                <FormDescription>Tu número de identificación estudiantil único (7-10 dígitos)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
