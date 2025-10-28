'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editBackgroundSchema = z.object({
    general_background: z.string().max(5000, 'Los antecedentes no pueden superar los 5000 caracteres').nullable(),
    justification: z
        .string()
        .min(10, 'La justificación debe tener al menos 10 caracteres')
        .max(1000, 'La justificación no puede superar los 1000 caracteres'),
});

type EditBackgroundFormValues = z.infer<typeof editBackgroundSchema>;

interface EditBackgroundDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentBackground: string | null;
    onConfirm: (data: EditBackgroundFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export default function EditBackgroundDialog({ open, onOpenChange, currentBackground, onConfirm, isSubmitting = false }: EditBackgroundDialogProps) {
    const form = useForm<EditBackgroundFormValues>({
        resolver: zodResolver(editBackgroundSchema),
        defaultValues: {
            general_background: currentBackground || '',
            justification: '',
        },
    });

    const backgroundValue = form.watch('general_background');
    const hasChanged = backgroundValue !== (currentBackground || '');

    // Resetear el formulario cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            form.reset({
                general_background: currentBackground || '',
                justification: '',
            });
        }
    }, [open, currentBackground, form]);

    // Limpiar justificación si se revierte el cambio
    useEffect(() => {
        if (!hasChanged) {
            form.setValue('justification', '', { shouldValidate: false });
        }
    }, [hasChanged, form]);

    const onSubmit = async (data: EditBackgroundFormValues) => {
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
                    <DialogTitle>Editar Antecedentes Médicos</DialogTitle>
                    <DialogDescription>
                        Modifica los antecedentes médicos del expediente. Cualquier cambio debe estar justificado por razones de auditoría.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Campo de Antecedentes */}
                        <FormField
                            control={form.control}
                            name="general_background"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Antecedentes Generales</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Alergia a la penicilina, asma controlado con inhalador, cirugía de apéndice en 2020..."
                                            className="min-h-[150px] resize-none"
                                            disabled={isSubmitting}
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    <FormDescription>Información médica relevante del estudiante ({field.value?.length || 0}/5000)</FormDescription>
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
                                            placeholder="Ej: Actualización de información proporcionada por el responsable del estudiante..."
                                            className="min-h-[100px] resize-none"
                                            disabled={!hasChanged || isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {hasChanged
                                            ? `Explica el motivo de la modificación (${field.value?.length || 0}/1000)`
                                            : 'Este campo se habilitará al detectar cambios en los antecedentes'}
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
