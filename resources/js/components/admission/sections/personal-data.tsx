'use client';

import { DuplicateModal } from '@/components/admission/duplicate-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAsyncFieldValidation } from '@/hooks/useAsyncFieldValidation';
import { useDebounce } from '@/hooks/useDebounce';
import { HelpCircle, Loader2, MailIcon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

// Crear una variable global para compartir el estado de duplicados
declare global {
    var __admissionDuplicateState: {
        hasDuplicates: boolean;
        duplicateData: { field: 'email' | 'nie'; value: string } | null;
    };
}

if (typeof window !== 'undefined') {
    window.__admissionDuplicateState = {
        hasDuplicates: false,
        duplicateData: null,
    };
}

export default function DatosPersonales() {
    const form = useFormContext();

    // Hook para validación asíncrona
    const {
        emailValidation,
        nieValidation,
        duplicateData,
        checkFieldDuplicate,
        clearValidation,
        setDuplicateData,
        dismissDuplicate,
        clearFieldDismissals,
    } = useAsyncFieldValidation();

    // Estados para los valores actuales de los campos
    const [currentEmail, setCurrentEmail] = useState('');
    const [currentNie, setCurrentNie] = useState('');

    // Estados para rastrear valores anteriores y detectar cambios reales
    const [previousEmail, setPreviousEmail] = useState('');
    const [previousNie, setPreviousNie] = useState('');

    // Debounce de los valores para evitar demasiadas peticiones
    const debouncedEmail = useDebounce(currentEmail, 800);
    const debouncedNie = useDebounce(currentNie, 800);

    // Efecto para validar email cuando cambie el valor debounced
    useEffect(() => {
        if (debouncedEmail && debouncedEmail !== currentEmail) return;

        if (debouncedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail)) {
            checkFieldDuplicate('email', debouncedEmail);
        } else if (debouncedEmail === '') {
            clearValidation('email');
        }
    }, [debouncedEmail, checkFieldDuplicate, clearValidation, currentEmail]);

    // Efecto para validar NIE cuando cambie el valor debounced
    useEffect(() => {
        if (debouncedNie && debouncedNie !== currentNie) return;

        if (debouncedNie && /^\d{7,10}$/.test(debouncedNie)) {
            checkFieldDuplicate('nie', debouncedNie);
        } else if (debouncedNie === '') {
            clearValidation('nie');
        }
    }, [debouncedNie, checkFieldDuplicate, clearValidation, currentNie]);

    // Función para manejar input de NIE con restricción de longitud
    const handleNieChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void; onBlur: () => void }) => {
        const value = e.target.value.replace(/\D/g, ''); // Solo números
        if (value.length <= 10) {
            // Si el valor realmente cambió, limpiar los descartes para este campo
            if (value !== previousNie && previousNie !== '') {
                clearFieldDismissals('nie');
            }

            field.onChange(value);
            setCurrentNie(value);
            setPreviousNie(currentNie); // Actualizar valor anterior
            // Validar en tiempo real mientras escribe
            form.trigger('nie');
        }
    };

    // Función para manejar cambio de email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>, field: { onChange: (value: string) => void; onBlur: () => void }) => {
        const value = e.target.value;

        // Si el valor realmente cambió, limpiar los descartes para este campo
        if (value !== previousEmail && previousEmail !== '') {
            clearFieldDismissals('email');
        }

        field.onChange(value);
        setCurrentEmail(value);
        setPreviousEmail(currentEmail); // Actualizar valor anterior
    };

    // Actualizar el estado global cuando cambie el estado de duplicados
    useEffect(() => {
        const hasDuplicates = emailValidation.isDuplicate || nieValidation.isDuplicate;
        if (typeof window !== 'undefined') {
            window.__admissionDuplicateState = {
                hasDuplicates,
                duplicateData,
            };
        }
    }, [emailValidation.isDuplicate, nieValidation.isDuplicate, duplicateData]);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Datos Personales del Aspirante</CardTitle>
                        <p className="text-sm text-muted-foreground">Información personal del joven que aspira ingresar al programa</p>
                    </div>
                </div>
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
                                        Primer nombre <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Juan" {...field} aria-label="Ingresa el primer nombre del aspirante" />
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
                                    <FormLabel>
                                        Segundo nombre <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Antonio" {...field} aria-label="Ingresa el segundo nombre del aspirante" />
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
                                        Primer apellido <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. Pérez" {...field} aria-label="Ingresa el primer apellido del aspirante" />
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
                                    <FormLabel>
                                        Segundo apellido <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej. González" {...field} aria-label="Ingresa el segundo apellido del aspirante" />
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
                                        Sexo <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger aria-label="Selecciona el sexo del aspirante">
                                                <SelectValue placeholder="Seleccionar" />
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
                                <FormItem>
                                    <FormLabel>
                                        Fecha de nacimiento <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <DatePicker
                                            value={
                                                field.value
                                                    ? (() => {
                                                          try {
                                                              // Intentar parsear la fecha, manejando diferentes formatos
                                                              const date = new Date(field.value);
                                                              return isNaN(date.getTime()) ? undefined : date;
                                                          } catch {
                                                              return undefined;
                                                          }
                                                      })()
                                                    : undefined
                                            }
                                            onChange={(date) => {
                                                // Convertir la fecha a string en formato ISO (YYYY-MM-DD)
                                                if (date) {
                                                    const year = date.getFullYear();
                                                    const month = String(date.getMonth() + 1).padStart(2, '0');
                                                    const day = String(date.getDate()).padStart(2, '0');
                                                    field.onChange(`${year}-${month}-${day}`);
                                                } else {
                                                    field.onChange('');
                                                }
                                            }}
                                            disableDates={(date) => {
                                                // Deshabilitar fechas que no permitan edades entre 6 y 20 años
                                                const today = new Date();
                                                const minDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
                                                const maxDate = new Date(today.getFullYear() - 6, today.getMonth(), today.getDate());
                                                return date < minDate || date > maxDate;
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* DATOS DE CONTACTO */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Información de Contacto</h3>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>
                                        Correo electrónico <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-5 w-5" aria-label="Ayuda para correo electrónico">
                                                    <HelpCircle className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="max-w-xs">
                                                    Este correo será utilizado para comunicaciones oficiales del programa y acceso a la plataforma
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            className="peer pe-9"
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            {...field}
                                            onChange={(e) => handleEmailChange(e, field)}
                                            onBlur={() => {
                                                field.onBlur();
                                                // Validar cuando el usuario sale del campo
                                                form.trigger('email');
                                            }}
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                                            {emailValidation.isChecking ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <MailIcon size={16} aria-hidden="true" />
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>En este correo recibirán notificaciones importantes sobre el proceso de admisión</FormDescription>
                                {emailValidation.isDuplicate && (
                                    <p className="text-sm text-red-500">Este correo ya está registrado en nuestra plataforma.</p>
                                )}
                                {emailValidation.error && <p className="text-sm text-red-500">{emailValidation.error}</p>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* IDENTIFICACIÓN ESCOLAR */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Identificación Estudiantil</h3>

                    <FormField
                        control={form.control}
                        name="nie"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormLabel>
                                        NIE (Número de Identificación Estudiantil) <span className="text-red-500">*</span>
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
                                    <div className="relative">
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
                                            className={nieValidation.isChecking ? 'pr-10' : ''}
                                        />
                                        {nieValidation.isChecking && (
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>Número de identificación estudiantil único asignado por el MINED (7-10 dígitos)</FormDescription>
                                {nieValidation.isDuplicate && (
                                    <p className="text-sm text-red-500">Este NIE ya está registrado en nuestra plataforma.</p>
                                )}
                                {nieValidation.error && <p className="text-sm text-red-500">{nieValidation.error}</p>}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>

            {/* Modal de duplicado */}
            <DuplicateModal
                isOpen={!!duplicateData}
                onClose={() => setDuplicateData(null)}
                field={duplicateData?.field || 'email'}
                value={duplicateData?.value || ''}
                onDismiss={dismissDuplicate}
            />
        </Card>
    );
}
