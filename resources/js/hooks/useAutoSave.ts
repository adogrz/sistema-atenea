import { useEffect, useRef, useCallback } from 'react';
import { FieldValues, UseFormGetValues, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface UseAutoSaveProps<T extends FieldValues = FieldValues> {
    getValues: UseFormGetValues<T>;
    setValue: UseFormSetValue<T>;
    watch: UseFormWatch<T>;
    onDraftFound?: (draft: DraftInfo) => void;
}

interface DraftInfo {
    data: FieldValues;
    timestamp: number;
    timeAgo: string;
}

const STORAGE_KEY = 'admission_form_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 segundos

export function useAutoSave<T extends FieldValues = FieldValues>({
    getValues,
    setValue,
    watch,
    onDraftFound
}: UseAutoSaveProps<T>) {
    const lastSaveRef = useRef<string>('');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasNotifiedDraftRef = useRef(false);

    // Función para formatear tiempo transcurrido
    const formatTimeAgo = useCallback((timeDiff: number): string => {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'hace un momento';
    }, []);

    // Verificar si el formulario tiene contenido significativo
    const hasSignificantContent = useCallback((data: FieldValues): boolean => {
        const significantFields = [
            'primer_nombre', 'primer_apellido', 'email', 'nie',
            'departamento', 'municipio', 'nivel_educativo'
        ];

        return significantFields.some(field => {
            const value = data[field];
            return value && value.toString().trim() !== '';
        });
    }, []);

    // Eliminar borrador
    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
        lastSaveRef.current = '';
    }, []);

    // Guardar borrador automáticamente
    const saveDraft = useCallback(() => {
        const currentData = getValues();
        const serializedData = JSON.stringify(currentData);

        // Solo guardar si hay cambios y hay contenido significativo
        if (serializedData !== lastSaveRef.current && hasSignificantContent(currentData)) {
            localStorage.setItem(STORAGE_KEY, serializedData);
            localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now().toString());
            lastSaveRef.current = serializedData;
        }
    }, [getValues, hasSignificantContent]);

    // Guardar borrador manualmente con confirmación
    const saveManually = useCallback(() => {
        saveDraft();
        toast.success('Borrador guardado correctamente', {
            duration: 3000
        });
    }, [saveDraft]);

    // Cargar borrador existente
    const loadDraft = useCallback((): DraftInfo | null => {
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        const timestamp = localStorage.getItem(`${STORAGE_KEY}_timestamp`);

        if (savedDraft && timestamp) {
            try {
                const draft = JSON.parse(savedDraft);
                const saveTime = parseInt(timestamp);
                const timeDiff = Date.now() - saveTime;

                // Solo mostrar si el borrador es reciente (menos de 7 días)
                if (timeDiff < 7 * 24 * 60 * 60 * 1000 && hasSignificantContent(draft)) {
                    return {
                        data: draft,
                        timestamp: saveTime,
                        timeAgo: formatTimeAgo(timeDiff)
                    };
                }
            } catch (error) {
                console.error('Error al cargar borrador:', error);
                // Limpiar datos corruptos
                clearDraft();
            }
        }
        return null;
    }, [formatTimeAgo, hasSignificantContent, clearDraft]);

    // Restaurar borrador
    const restoreDraft = useCallback((draft: FieldValues) => {
        Object.keys(draft).forEach(key => {
            if (draft[key] !== '' && draft[key] !== null && draft[key] !== undefined) {
                // Usamos type assertion para resolver el problema de tipos
                (setValue as (name: string, value: unknown) => void)(key, draft[key]);
            }
        });

        lastSaveRef.current = JSON.stringify(draft);
        toast.success('Borrador restaurado correctamente');
    }, [setValue]);

    // Verificar borrador al montar el componente
    useEffect(() => {
        if (!hasNotifiedDraftRef.current) {
            const draft = loadDraft();
            if (draft && onDraftFound) {
                onDraftFound(draft);
                hasNotifiedDraftRef.current = true;
            }
        }
    }, [loadDraft, onDraftFound]);

    // Auto guardado con debounce
    useEffect(() => {
        const subscription = watch(() => {
            // Limpiar timeout anterior
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }

            // Programar nuevo guardado
            intervalRef.current = setTimeout(saveDraft, AUTO_SAVE_INTERVAL);
        });

        return () => {
            subscription.unsubscribe();
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }
        };
    }, [watch, saveDraft]);

    // Guardado antes de cerrar la ventana
    useEffect(() => {
        const handleBeforeUnload = () => {
            saveDraft();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
            }
        };
    }, [saveDraft]);

    return {
        saveDraft,
        saveManually,
        restoreDraft,
        clearDraft,
        loadDraft
    };
}
