import { fullFormSchema, validateSection } from '@/lib/validations/admission-schemas';
import { useState } from 'react';
import { UseFormClearErrors, UseFormGetValues, UseFormTrigger } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Declarar tipos globales para el estado de duplicados
declare global {
    var __admissionDuplicateState: {
        hasDuplicates: boolean;
        duplicateData: { field: 'email' | 'nie'; value: string } | null;
    };
}

// Inferir el tipo desde el esquema de Zod para asegurar consistencia
type FormData = z.infer<typeof fullFormSchema>;

interface UseStepValidationProps {
    getValues: UseFormGetValues<FormData>;
    trigger: UseFormTrigger<FormData>;
    clearErrors?: UseFormClearErrors<FormData>;
}

export function useStepValidation({ getValues, trigger, clearErrors }: UseStepValidationProps) {
    const [isValidating, setIsValidating] = useState(false);

    const validateStep = async (stepName: string): Promise<boolean> => {
        if (isValidating) return false;

        setIsValidating(true);

        try {
            // Simular un pequeño delay para mostrar el loading
            await new Promise((resolve) => setTimeout(resolve, 300));

            const currentData = getValues();

            // Verificar duplicados antes de la validación del esquema para datos personales
            if (stepName === 'datos-personales') {
                const duplicateState = typeof window !== 'undefined' ? window.__admissionDuplicateState : null;
                if (duplicateState?.hasDuplicates) {
                    toast.error('No puedes continuar con datos duplicados', {
                        description: 'Por favor corrige el correo o NIE que ya existe en el sistema.',
                    });
                    setIsValidating(false);
                    return false;
                }
            }

            const validation = validateSection(stepName, currentData);

            if (validation.success) {
                // Limpiar errores del paso actual después de validación exitosa
                if (clearErrors) {
                    const fieldsMap: Record<string, (keyof FormData)[]> = {
                        'datos-personales': [
                            'primer_nombre',
                            'segundo_nombre',
                            'primer_apellido',
                            'segundo_apellido',
                            'sexo',
                            'fecha_nacimiento',
                            'nie',
                            'email',
                        ],
                        'datos-responsables': [
                            'dui_responsable_1',
                            'nombres_responsable_1',
                            'apellidos_responsable_1',
                            'email_responsable_1',
                            'telefono_responsable_1',
                            'tipo_parentesco_1',
                            'dui_responsable_2',
                            'nombres_responsable_2',
                            'apellidos_responsable_2',
                            'email_responsable_2',
                            'telefono_responsable_2',
                            'tipo_parentesco_2',
                        ],
                        direccion: ['telefono_casa', 'direccion', 'distrito', 'departamento', 'municipio'],
                        educacion: ['centro_educativo', 'sector', 'zona', 'internacional', 'nivel_educativo'],
                    };

                    const fields = fieldsMap[stepName];
                    if (fields) {
                        clearErrors(fields);
                    }
                }
                return true;
            } else {
                // Mostrar toast con errores
                const firstError = validation.error?.issues?.[0]?.message || 'Hay errores en esta sección';
                toast.error(firstError);

                // Disparar validación para mostrar errores en el formulario
                const fieldsMap: Record<string, (keyof FormData)[]> = {
                    'datos-personales': ['primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'sexo', 'fecha_nacimiento', 'nie', 'email'],
                    'datos-responsables': [
                        'dui_responsable_1',
                        'nombres_responsable_1',
                        'apellidos_responsable_1',
                        'telefono_responsable_1',
                        'tipo_parentesco_1',
                    ],
                    direccion: ['direccion', 'distrito', 'departamento', 'municipio'],
                    educacion: ['centro_educativo', 'nivel_educativo', 'sector', 'zona', 'internacional'],
                };

                const fields = fieldsMap[stepName];
                if (fields) {
                    await trigger(fields);
                }

                return false;
            }
        } finally {
            setIsValidating(false);
        }
    };

    return {
        validateStep,
        isValidating,
    };
}
