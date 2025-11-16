import { useCallback, useState } from 'react';
import axios from 'axios';

interface ValidationResult {
    isChecking: boolean;
    isDuplicate: boolean;
    error?: string;
}

interface DuplicateCheckResponse {
    exists: boolean;
    field: 'email' | 'nie';
    value: string;
}

export function useAsyncFieldValidation() {
    const [emailValidation, setEmailValidation] = useState<ValidationResult>({
        isChecking: false,
        isDuplicate: false,
    });

    const [nieValidation, setNieValidation] = useState<ValidationResult>({
        isChecking: false,
        isDuplicate: false,
    });

    const [duplicateData, setDuplicateData] = useState<{
        field: 'email' | 'nie';
        value: string;
    } | null>(null);

    // Estado para controlar si el modal fue cerrado por el usuario
    const [dismissedDuplicates, setDismissedDuplicates] = useState<Set<string>>(new Set());

    const checkFieldDuplicate = useCallback(async (field: 'email' | 'nie', value: string) => {
        if (!value) return;

        // Si este valor ya fue descartado por el usuario, no hacer la validación
        const dismissKey = `${field}:${value}`;
        if (dismissedDuplicates.has(dismissKey)) {
            return;
        }

        const setter = field === 'email' ? setEmailValidation : setNieValidation;

        setter(prev => ({ ...prev, isChecking: true, error: undefined }));

        try {
            const response = await axios.post<DuplicateCheckResponse>('/api/check-duplicate', {
                field,
                value,
            });

            const { exists } = response.data;

            setter({
                isChecking: false,
                isDuplicate: exists,
                error: undefined,
            });

            if (exists && !dismissedDuplicates.has(dismissKey)) {
                setDuplicateData({ field, value });
            }
        } catch (error) {
            console.error('Error checking duplicate:', error);

            // Determinar el tipo de error
            let errorMessage = 'Error al verificar disponibilidad';

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    errorMessage = 'Datos de validación inválidos';
                } else if (error.response && error.response.status >= 500) {
                    errorMessage = 'Error del servidor. Inténtalo más tarde';
                } else if (!error.response) {
                    errorMessage = 'Sin conexión al servidor';
                }
            }

            setter({
                isChecking: false,
                isDuplicate: false,
                error: errorMessage,
            });
        }
    }, [dismissedDuplicates]);

    const clearValidation = useCallback((field: 'email' | 'nie') => {
        const setter = field === 'email' ? setEmailValidation : setNieValidation;
        setter({ isChecking: false, isDuplicate: false });

        if (duplicateData?.field === field) {
            setDuplicateData(null);
        }
    }, [duplicateData?.field]);

    const dismissDuplicate = useCallback((field: 'email' | 'nie', value: string) => {
        const dismissKey = `${field}:${value}`;
        setDismissedDuplicates(prev => new Set([...prev, dismissKey]));
        setDuplicateData(null);

        // Limpiar también el estado de validación
        const setter = field === 'email' ? setEmailValidation : setNieValidation;
        setter({ isChecking: false, isDuplicate: false });
    }, []);

    const clearFieldDismissals = useCallback((field: 'email' | 'nie') => {
        setDismissedDuplicates(prev => {
            const newSet = new Set(prev);
            // Remover todas las entradas que empiecen con "field:"
            Array.from(newSet).forEach(key => {
                if (key.startsWith(`${field}:`)) {
                    newSet.delete(key);
                }
            });
            return newSet;
        });
    }, []);

    const resetDismissedDuplicates = useCallback(() => {
        setDismissedDuplicates(new Set());
    }, []);

    return {
        emailValidation,
        nieValidation,
        duplicateData,
        checkFieldDuplicate,
        clearValidation,
        setDuplicateData,
        dismissDuplicate,
        clearFieldDismissals,
        resetDismissedDuplicates,
    };
}
