import { useState } from 'react';
import { UseFormGetValues, UseFormTrigger } from 'react-hook-form';
import { toast } from 'sonner';
import { validateSection } from '@/lib/validations/admission-schemas';

type FormData = {
    primer_nombre: string;
    segundo_nombre?: string;
    primer_apellido: string;
    segundo_apellido?: string;
    sexo?: 'H' | 'M';
    fecha_nacimiento: string;
    nie: string;
    email: string;
    telefono_casa?: string;
    direccion: string;
    distrito: string;
    departamento: string;
    municipio: string;
    centro_educativo: string;
    sector: 'PÚBLICO' | 'PRIVADO';
    zona: 'Rural' | 'Urbana';
    internacional: 'SI' | 'NO';
    nivel_educativo?: string;
    dui_responsable_1: string;
    nombres_responsable_1: string;
    apellidos_responsable_1: string;
    email_responsable_1?: string;
    telefono_responsable_1: string;
    tipo_parentesco_1?: string;
    dui_responsable_2?: string;
    nombres_responsable_2?: string;
    apellidos_responsable_2?: string;
    email_responsable_2?: string;
    telefono_responsable_2?: string;
    tipo_parentesco_2?: string;
};

interface UseStepValidationProps {
    getValues: UseFormGetValues<FormData>;
    trigger: UseFormTrigger<FormData>;
}

export function useStepValidation({ getValues, trigger }: UseStepValidationProps) {
    const [isValidating, setIsValidating] = useState(false);

    const validateStep = async (stepName: string): Promise<boolean> => {
        if (isValidating) return false;

        setIsValidating(true);

        try {
            // Simular un pequeño delay para mostrar el loading
            await new Promise(resolve => setTimeout(resolve, 300));

            const currentData = getValues();
            const validation = validateSection(stepName, currentData);

            if (validation.success) {
                return true;
            } else {
                // Mostrar toast con errores
                const firstError = validation.error?.issues?.[0]?.message || 'Hay errores en esta sección';
                toast.error(firstError);

                // Disparar validación para mostrar errores en el formulario
                const fieldsMap: Record<string, (keyof FormData)[]> = {
                    'datos-personales': ['primer_nombre', 'primer_apellido', 'sexo', 'fecha_nacimiento', 'nie', 'email'],
                    'datos-responsables': ['dui_responsable_1', 'nombres_responsable_1', 'apellidos_responsable_1', 'telefono_responsable_1', 'tipo_parentesco_1'],
                    'direccion': ['direccion', 'distrito', 'departamento', 'municipio'],
                    'educacion': ['centro_educativo', 'nivel_educativo', 'sector', 'zona', 'internacional'],
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
