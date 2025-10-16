import { EntityItem } from '@/components/ui/entity-finder';
import { AssignmentWithRelations, RecordType } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Variable para almacenar los valores originales y usarlos en la validación
let originalValuesForValidation: { professional_id: string; is_active: boolean } | null = null;

const formSchema = z
    .object({
        student_nie: z.string().min(1, 'El NIE del estudiante es requerido'),
        professional_id: z.string().min(1, 'Debe seleccionar un profesional'),
        is_active: z.boolean(),
        change_justification: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Verificar si hay cambios críticos
        let hasCriticalChanges = false;

        if (originalValuesForValidation) {
            // Cambió el profesional
            if (data.professional_id !== originalValuesForValidation.professional_id) {
                hasCriticalChanges = true;
            }
            // Se desactivó la asignación
            if (!data.is_active && originalValuesForValidation.is_active) {
                hasCriticalChanges = true;
            }
        } else {
            // Si no hay valores originales, solo validar al desactivar
            if (!data.is_active) {
                hasCriticalChanges = true;
            }
        }

        // Si hay cambios críticos, la justificación es obligatoria
        if (hasCriticalChanges) {
            if (!data.change_justification || data.change_justification.trim().length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Debe proporcionar una justificación para este cambio.',
                    path: ['change_justification'],
                });
            } else if (data.change_justification.trim().length < 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'La justificación debe tener al menos 10 caracteres.',
                    path: ['change_justification'],
                });
            }
        }

        // Validar longitud máxima
        if (data.change_justification && data.change_justification.length > 1000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La justificación no puede exceder los 1000 caracteres.',
                path: ['change_justification'],
            });
        }
    });

export type AssignmentFormValues = z.infer<typeof formSchema>;

interface UseAssignmentFormProps {
    currentAssignment?: AssignmentWithRelations;
    assignmentType: RecordType;
}

export function useAssignmentForm({ currentAssignment, assignmentType }: UseAssignmentFormProps) {
    const isEdit = !!currentAssignment;
    const [selectedStudentInfo, setSelectedStudentInfo] = useState<{ title: string; subtitle: string } | null>(null);
    const [selectedProfessionalInfo, setSelectedProfessionalInfo] = useState<{ title: string; subtitle?: string } | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalValues, setOriginalValues] = useState<AssignmentFormValues | null>(null);

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_nie: currentAssignment?.student_nie || '',
            professional_id: currentAssignment?.professional_id.toString() || '',
            is_active: currentAssignment?.is_active ?? true,
            change_justification: currentAssignment?.change_justification || '',
        },
    });

    // Configurar valores iniciales
    useEffect(() => {
        if (currentAssignment) {
            const initialValues: AssignmentFormValues = {
                student_nie: currentAssignment.student_nie,
                professional_id: currentAssignment.professional_id.toString(),
                is_active: currentAssignment.is_active,
                change_justification: currentAssignment.change_justification || '',
            };

            form.reset(initialValues);
            setOriginalValues(initialValues);

            // Actualizar valores originales para validación
            originalValuesForValidation = {
                professional_id: initialValues.professional_id,
                is_active: initialValues.is_active,
            };

            if (currentAssignment.student) {
                const fullName = [
                    currentAssignment.student.primer_nombre,
                    currentAssignment.student.segundo_nombre,
                    currentAssignment.student.primer_apellido,
                    currentAssignment.student.segundo_apellido,
                ]
                    .filter(Boolean)
                    .join(' ');

                setSelectedStudentInfo({
                    title: fullName,
                    subtitle: `NIE: ${currentAssignment.student_nie}`,
                });
            }

            if (currentAssignment.professional) {
                setSelectedProfessionalInfo({
                    title: currentAssignment.professional.name,
                    subtitle: currentAssignment.professional.sede_name ? `Sede: ${currentAssignment.professional.sede_name}` : undefined,
                });
            }

            setHasChanges(false);
        } else {
            // Limpiar valores originales si no hay asignación actual
            originalValuesForValidation = null;
        }
    }, [currentAssignment, form]);

    // Detectar cambios
    useEffect(() => {
        if (!isEdit || !originalValues) {
            setHasChanges(false);
            return;
        }

        const subscription = form.watch((values) => {
            const changed = values.professional_id !== originalValues.professional_id || values.is_active !== originalValues.is_active;

            // Solo actualizar si el estado de hasChanges realmente cambió
            if (changed !== hasChanges) {
                setHasChanges(changed);
            }
        });

        return () => subscription.unsubscribe();
    }, [form, isEdit, originalValues, hasChanges]);

    // Revalidar justificación cuando hasChanges cambia
    useEffect(() => {
        if (isEdit && hasChanges) {
            // Usar setTimeout para evitar loop infinito
            const timeoutId = setTimeout(() => {
                form.trigger('change_justification');
            }, 0);

            return () => clearTimeout(timeoutId);
        }
    }, [hasChanges, isEdit, form]);

    // Handlers para selección de entidades
    const handleStudentSelect = (item: EntityItem) => {
        form.setValue('student_nie', item.value, { shouldValidate: true });
        setSelectedStudentInfo({
            title: item.label,
            subtitle: item.sublabel || '',
        });
    };

    const handleStudentClear = () => {
        form.setValue('student_nie', '', { shouldValidate: true });
        setSelectedStudentInfo(null);
    };

    const handleProfessionalSelect = (item: EntityItem) => {
        form.setValue('professional_id', item.value, { shouldValidate: true });
        setSelectedProfessionalInfo({
            title: item.label,
            subtitle: item.sublabel,
        });
    };

    const handleProfessionalClear = () => {
        form.setValue('professional_id', '', { shouldValidate: true });
        setSelectedProfessionalInfo(null);
    };

    // Determinar si el botón está deshabilitado
    const isSubmitDisabled = () => {
        if (form.formState.isSubmitting) return true;

        if (isEdit) {
            // Si no hay cambios, deshabilitar
            if (!hasChanges) return true;

            // Si hay errores de validación, deshabilitar
            if (Object.keys(form.formState.errors).length > 0) return true;

            return false;
        } else {
            const values = form.getValues();

            // Si faltan campos requeridos, deshabilitar
            if (!values.student_nie || !values.professional_id) return true;

            // Si hay errores de validación, deshabilitar
            if (Object.keys(form.formState.errors).length > 0) return true;

            return false;
        }
    };

    return {
        form,
        isEdit,
        hasChanges,
        selectedStudentInfo,
        selectedProfessionalInfo,
        handleStudentSelect,
        handleStudentClear,
        handleProfessionalSelect,
        handleProfessionalClear,
        isSubmitDisabled,
    };
}
