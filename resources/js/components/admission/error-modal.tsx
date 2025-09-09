'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AlertCircle, ChevronRight, Home, RefreshCw } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    onRetry?: () => void;
    showRetry?: boolean;
    errors?: Record<string, string[]>;
    onNavigateToField?: (fieldName: string) => void;
}

export default function ErrorModal({
    isOpen,
    onClose,
    title = 'Revisa los datos del formulario',
    message = 'Parece que hay algunos campos que necesitan atención antes de continuar.',
    onRetry,
    showRetry = true,
    errors,
    onNavigateToField,
}: ErrorModalProps) {
    const primaryButtonRef = useRef<HTMLButtonElement>(null);

    const fieldLabels: Record<string, string> = {
        primer_nombre: 'Primer nombre',
        segundo_nombre: 'Segundo nombre',
        primer_apellido: 'Primer apellido',
        segundo_apellido: 'Segundo apellido',
        sexo: 'Sexo',
        fecha_nacimiento: 'Fecha de nacimiento',
        nie: 'NIE del estudiante',
        telefono_estudiante: 'Teléfono del estudiante',
        email: 'Correo electrónico del estudiante',
        telefono_casa: 'Teléfono de casa',
        colonia: 'Colonia',
        calle: 'Calle',
        numero_casa: 'Número de casa',
        distrito: 'Distrito',
        departamento: 'Departamento',
        municipio: 'Municipio',
        centro_educativo: 'Centro educativo',
        nivel_educativo: 'Nivel educativo',
        dui_responsable_1: 'DUI (Responsable principal)',
        nombres_responsable_1: 'Nombres (Responsable principal)',
        apellidos_responsable_1: 'Apellidos (Responsable principal)',
        telefono_responsable_1: 'Teléfono (Responsable principal)',
        email_responsable_1: 'Correo electrónico (Responsable principal)',
        tipo_parentesco_1: 'Parentesco (Responsable principal)',
        dui_responsable_2: 'DUI (Segundo responsable)',
        nombres_responsable_2: 'Nombres (Segundo responsable)',
        apellidos_responsable_2: 'Apellidos (Segundo responsable)',
        telefono_responsable_2: 'Teléfono (Segundo responsable)',
        email_responsable_2: 'Correo electrónico (Segundo responsable)',
        tipo_parentesco_2: 'Parentesco (Segundo responsable)',
    };

    const getFriendlyErrors = () => {
        if (!errors) return [];

        const friendlyErrors: Array<{ field: string; label: string; message: string; critical?: boolean }> = [];

        Object.entries(errors).forEach(([field, messages]) => {
            const label = fieldLabels[field] || field;
            messages.forEach((message) => {
                let friendlyMessage = message;
                let critical = false;

                if (message.includes('NIE ya está registrado') || (message.includes('unique') && field === 'nie')) {
                    friendlyMessage = 'Este NIE ya está registrado en el sistema. Cada estudiante debe tener un NIE único.';
                    critical = true;
                } else if (
                    message.includes('correo electrónico ya está en uso') ||
                    message.includes('email ya está en uso') ||
                    (message.includes('unique') && field === 'email')
                ) {
                    friendlyMessage = 'Este correo electrónico ya está en uso. Por favor, usa una dirección diferente.';
                    critical = true;
                } else if (message.includes('required') || message.includes('obligatorio')) {
                    friendlyMessage = 'Este campo es obligatorio';
                } else if (message.includes('email') && !message.includes('uso') && !message.includes('taken') && !message.includes('unique')) {
                    friendlyMessage = 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
                } else if (message.includes('size') && field.includes('dui')) {
                    friendlyMessage = 'El DUI debe tener exactamente 9 dígitos numéricos';
                } else if (message.includes('size') && field.includes('telefono')) {
                    friendlyMessage = 'El teléfono debe tener exactamente 8 dígitos y empezar con 2, 6 o 7';
                }

                friendlyErrors.push({ field, label, message: friendlyMessage, critical });
            });
        });

        return friendlyErrors;
    };

    const handleFieldNavigation = (fieldName: string) => {
        if (onNavigateToField) {
            onNavigateToField(fieldName);
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen && primaryButtonRef.current) {
            const timer = setTimeout(() => {
                primaryButtonRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleRetry = () => {
        onClose();
        if (onRetry) onRetry();
    };

    const friendlyErrors = getFriendlyErrors();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto" aria-labelledby="error-title" aria-describedby="error-description">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div
                        className="mb-2 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                        role="img"
                        aria-label="Icono de alerta de error"
                    >
                        <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle id="error-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </DialogTitle>
                    <DialogDescription id="error-description" className="mt-2 text-gray-600 dark:text-gray-400">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {friendlyErrors.length > 0 && (
                    <section role="region" aria-labelledby="errors-list-title" className="py-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-700 dark:bg-amber-900/40">
                            <h4 id="errors-list-title" className="mb-3 flex items-center text-sm font-semibold text-amber-800 dark:text-amber-200">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Campos que necesitan atención:
                            </h4>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {friendlyErrors.map(({ field, label, message, critical }, index) => (
                                    <button
                                        key={`${field}-${index}`}
                                        type="button"
                                        className={cn(
                                            'group flex w-full cursor-pointer items-start justify-between gap-3 rounded-md p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                                            critical
                                                ? 'border border-red-200 bg-red-50 hover:bg-red-100/80 dark:border-red-800 dark:bg-red-900/40 dark:hover:bg-red-900/60'
                                                : 'bg-white/90 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800',
                                        )}
                                        onClick={() => handleFieldNavigation(field)}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-red-800 dark:text-red-200">{label}</p>
                                            <p className="mt-1 text-xs whitespace-normal text-red-700 dark:text-red-300">{message}</p>
                                        </div>
                                        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 transition-transform group-hover:translate-x-1 dark:text-red-400" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                    {showRetry && onRetry && (
                        <Button ref={primaryButtonRef} onClick={handleRetry}>
                            <RefreshCw className="mr-2 size-4" />
                            Reintentar envío
                        </Button>
                    )}
                    <Button
                        variant={showRetry && onRetry ? 'outline' : 'default'}
                        onClick={onClose}
                        ref={!showRetry || !onRetry ? primaryButtonRef : undefined}
                    >
                        <Home className="mr-2 size-4" />
                        Cerrar y corregir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
