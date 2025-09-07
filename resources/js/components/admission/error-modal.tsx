'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    title = 'Error en el formulario',
    message = 'Ha ocurrido un error al procesar tu solicitud. Por favor, revisa los datos e intenta nuevamente.',
    onRetry,
    showRetry = true,
    errors,
    onNavigateToField,
}: ErrorModalProps) {
    const primaryButtonRef = useRef<HTMLButtonElement>(null);

    // Mapeo de campos a nombres amigables
    const fieldLabels: Record<string, string> = {
        primer_nombre: 'Primer nombre',
        segundo_nombre: 'Segundo nombre',
        primer_apellido: 'Primer apellido',
        segundo_apellido: 'Segundo apellido',
        sexo: 'Sexo',
        fecha_nacimiento: 'Fecha de nacimiento',
        nie: 'NIE',
        telefono_estudiante: 'Teléfono del estudiante',
        email: 'Correo electrónico',
        telefono_casa: 'Teléfono de casa',
        colonia: 'Colonia',
        calle: 'Calle',
        numero_casa: 'Número de casa',
        distrito: 'Distrito',
        departamento: 'Departamento',
        municipio: 'Municipio',
        centro_educativo: 'Centro educativo',
        nivel_educativo: 'Nivel educativo',
        dui_responsable_1: 'DUI del responsable principal',
        nombres_responsable_1: 'Nombres del responsable principal',
        apellidos_responsable_1: 'Apellidos del responsable principal',
        telefono_responsable_1: 'Teléfono del responsable principal',
        email_responsable_1: 'Email del responsable principal',
        tipo_parentesco_1: 'Parentesco del responsable principal',
        dui_responsable_2: 'DUI del segundo responsable',
        nombres_responsable_2: 'Nombres del segundo responsable',
        apellidos_responsable_2: 'Apellidos del segundo responsable',
        telefono_responsable_2: 'Teléfono del segundo responsable',
        email_responsable_2: 'Email del segundo responsable',
        tipo_parentesco_2: 'Parentesco del segundo responsable',
    };

    // Función para obtener errores más amigables
    const getFriendlyErrors = () => {
        if (!errors) return [];

        const friendlyErrors: Array<{ field: string; label: string; message: string }> = [];

        Object.entries(errors).forEach(([field, messages]) => {
            const label = fieldLabels[field] || field;
            messages.forEach((message) => {
                // Hacer el mensaje más amigable y específico
                let friendlyMessage = message;

                // Errores específicos de duplicación
                if (message.includes('NIE ya está registrado') || (message.includes('unique') && field === 'nie')) {
                    friendlyMessage = 'Este NIE ya está registrado en el sistema. Cada estudiante debe tener un NIE único.';
                } else if (
                    message.includes('correo electrónico ya está en uso') ||
                    message.includes('email ya está en uso') ||
                    (message.includes('unique') && field === 'email')
                ) {
                    friendlyMessage = 'Este correo electrónico ya está en uso. Por favor, usa una dirección de correo diferente.';
                } else if (message.includes('taken') && field === 'nie') {
                    friendlyMessage = 'Este NIE ya está registrado en el sistema. Cada estudiante debe tener un NIE único.';
                } else if (message.includes('taken') && field === 'email') {
                    friendlyMessage = 'Este correo electrónico ya está en uso. Por favor, usa una dirección de correo diferente.';
                }
                // Errores de validación de formato y tamaño específicos
                else if (message.includes('required') || message.includes('obligatorio')) {
                    friendlyMessage = 'Este campo es obligatorio';
                } else if (message.includes('email') && !message.includes('uso') && !message.includes('taken') && !message.includes('unique')) {
                    friendlyMessage = 'El formato del correo electrónico no es válido. Ejemplo: usuario@dominio.com';
                } else if (message.includes('size') && field.includes('dui')) {
                    friendlyMessage = 'El DUI debe tener exactamente 9 dígitos numéricos';
                } else if (message.includes('size') && field.includes('telefono')) {
                    friendlyMessage = 'El teléfono debe tener exactamente 8 dígitos y empezar con 2, 6 o 7';
                } else if (message.includes('regex') && field.includes('dui')) {
                    friendlyMessage = 'El DUI debe contener solo números (9 dígitos)';
                } else if (message.includes('regex') && field.includes('telefono')) {
                    friendlyMessage = 'El teléfono debe tener 8 dígitos y empezar con 2, 6 o 7';
                } else if (message.includes('regex') && (field.includes('nombre') || field.includes('apellido'))) {
                    friendlyMessage = 'Solo se permiten letras, espacios, guiones y apostrofes';
                } else if (message.includes('unique') && !field.includes('email') && !field.includes('nie')) {
                    friendlyMessage = 'Este valor ya está registrado en el sistema';
                } else if (message.includes('min') || message.includes('mínimo')) {
                    friendlyMessage = 'Este campo es demasiado corto';
                } else if (message.includes('max') || message.includes('máximo')) {
                    friendlyMessage = 'Este campo es demasiado largo';
                } else if (message.includes('integer') || message.includes('número')) {
                    friendlyMessage = 'Debe ser un número válido';
                } else if (message.includes('exists')) {
                    if (field.includes('distrito')) {
                        friendlyMessage = 'El distrito seleccionado no es válido';
                    } else if (field.includes('centro_educativo') || field.includes('codigo')) {
                        friendlyMessage = 'El centro educativo seleccionado no es válido';
                    } else if (field.includes('nivel_educativo')) {
                        friendlyMessage = 'El nivel educativo seleccionado no es válido';
                    } else {
                        friendlyMessage = 'El valor seleccionado no es válido';
                    }
                } else if (message.includes('date')) {
                    friendlyMessage = 'La fecha ingresada no es válida';
                } else if (message.includes('refine') && field.includes('fecha_nacimiento')) {
                    friendlyMessage = 'La edad debe estar entre 6 y 20 años';
                } else if (message.includes('in:') && field.includes('sexo')) {
                    friendlyMessage = 'Selecciona el sexo del aspirante (H o M)';
                } else if (message.includes('in:') && field.includes('parentesco')) {
                    friendlyMessage = 'Selecciona un tipo de parentesco válido';
                }

                friendlyErrors.push({ field, label, message: friendlyMessage });
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

    // Enfocar el botón principal cuando se abre el modal
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
        if (onRetry) {
            onRetry();
        }
    };

    const formatMessage = (text: string) => {
        return text.split('\n').map((line, index) => (
            <span key={index}>
                {line}
                {index < text.split('\n').length - 1 && <br />}
            </span>
        ));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
                    <DialogDescription className="mt-3 text-gray-600 dark:text-gray-400">{formatMessage(message)}</DialogDescription>
                </DialogHeader>

                {/* Mostrar errores específicos si los hay */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
                            <h4 className="mb-3 flex items-center text-sm font-semibold text-amber-800 dark:text-amber-200">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Campos que requieren atención:
                            </h4>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {getFriendlyErrors().map(({ field, label, message }, index) => (
                                    <div
                                        key={`${field}-${index}`}
                                        className="group flex cursor-pointer items-start justify-between gap-3 rounded-md bg-white/90 p-3 transition-colors hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                                        onClick={() => handleFieldNavigation(field)}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-red-800 dark:text-red-200">{label}</p>
                                            <p className="mt-1 text-xs text-red-700 dark:text-red-300">{message}</p>
                                        </div>
                                        <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600 group-hover:text-red-700 dark:text-red-400 dark:group-hover:text-red-300" />
                                    </div>
                                ))}
                            </div>
                            {onNavigateToField && (
                                <p className="mt-3 text-center text-xs text-amber-700 dark:text-amber-300">
                                    💡 Haz clic en cualquier campo para ir directamente a él
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {showRetry && onRetry && (
                        <Button ref={primaryButtonRef} onClick={handleRetry} className="bg-primary hover:bg-primary/90">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Intentar nuevamente
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose} ref={!showRetry ? primaryButtonRef : undefined}>
                        <Home className="mr-2 h-4 w-4" />
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
