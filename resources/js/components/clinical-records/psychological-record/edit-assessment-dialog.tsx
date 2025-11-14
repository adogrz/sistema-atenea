'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editAssessmentSchema = z.object({
    initial_assessment: z.string().max(5000, 'La evaluación inicial no puede superar los 5000 caracteres').nullable(),
    justification: z
        .string()
        .min(10, 'La justificación debe tener al menos 10 caracteres')
        .max(1000, 'La justificación no puede superar los 1000 caracteres'),
});

type EditAssessmentFormValues = z.infer<typeof editAssessmentSchema>;

interface EditAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentAssessment: string | null;
    onConfirm: (data: EditAssessmentFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export default function EditAssessmentDialog({ open, onOpenChange, currentAssessment, onConfirm, isSubmitting = false }: EditAssessmentDialogProps) {
    const form = useForm<EditAssessmentFormValues>({
        resolver: zodResolver(editAssessmentSchema),
        defaultValues: {
            initial_assessment: currentAssessment || '',
            justification: '',
        },
    });

    const assessmentValue = form.watch('initial_assessment');
    const hasChanged = assessmentValue !== (currentAssessment || '');

    // Resetear el formulario cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            form.reset({
                initial_assessment: currentAssessment || '',
                justification: '',
            });
        }
    }, [open, currentAssessment, form]);

    // Limpiar justificación si se revierte el cambio
    useEffect(() => {
        if (!hasChanged) {
            form.setValue('justification', '', { shouldValidate: false });
        }
    }, [hasChanged, form]);

    const onSubmit = async (data: EditAssessmentFormValues) => {
        if (!hasChanged) {
            onOpenChange(false);
            return;
        }

        await onConfirm(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Evaluación Inicial</DialogTitle>
                    <DialogDescription>
                        Modifica la evaluación inicial del expediente psicológico. Cualquier cambio debe estar justificado por razones de auditoría.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Campo de Evaluación Inicial */}
                        <FormField
                            control={form.control}
                            name="initial_assessment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Evaluación Inicial</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Estudiante presenta ansiedad ante situaciones sociales, bajo rendimiento académico reciente..."
                                            className="min-h-[150px] resize-none"
                                            disabled={isSubmitting}
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription>Evaluación psicológica inicial del estudiante ({field.value?.length || 0}/5000)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo de Justificación (solo si hay cambios) */}
                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Justificación del Cambio {hasChanged && <span className="text-destructive">*</span>}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Actualización de información tras nueva entrevista con el estudiante..."
                                            className="min-h-[100px] resize-none"
                                            disabled={!hasChanged || isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {hasChanged
                                            ? `Explica el motivo de la modificación (${field.value?.length || 0}/1000)`
                                            : 'Este campo se habilitará al detectar cambios en la evaluación'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting || (!hasChanged && form.getValues('justification') === '')}>
                                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
