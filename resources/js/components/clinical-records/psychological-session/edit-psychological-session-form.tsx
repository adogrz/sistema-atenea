'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UpdatePsychologicalSessionData } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editSessionSchema = z.object({
    session_date: z
        .date({
            required_error: 'La fecha de sesión es requerida',
        })
        .refine((date) => date <= new Date(), 'La fecha de sesión no puede ser posterior a hoy'),
    session_content: z
        .string({
            required_error: 'El contenido de la sesión es requerido',
        })
        .min(20, 'El contenido debe tener al menos 20 caracteres')
        .max(5000, 'El contenido no puede superar los 5000 caracteres'),
    interventions: z.string().max(5000, 'Las intervenciones no pueden superar los 5000 caracteres').optional(),
    conclusions: z.string().max(5000, 'Las conclusiones no pueden superar los 5000 caracteres').optional(),
    change_justification: z
        .string({
            required_error: 'La justificación del cambio es requerida',
        })
        .min(10, 'La justificación debe tener al menos 10 caracteres')
        .max(1000, 'La justificación no puede superar los 1000 caracteres'),
});

type EditSessionFormValues = z.infer<typeof editSessionSchema>;

interface EditPsychologicalSessionFormProps {
    onSubmit: (data: UpdatePsychologicalSessionData) => void;
    defaultValues?: Partial<UpdatePsychologicalSessionData>;
    isSubmitting?: boolean;
    submitLabel?: string;
    showCancel?: boolean;
    onCancel?: () => void;
}

export function EditPsychologicalSessionForm({
    onSubmit,
    defaultValues,
    isSubmitting = false,
    submitLabel = 'Guardar Cambios',
    showCancel = true,
    onCancel,
}: EditPsychologicalSessionFormProps) {
    const form = useForm<EditSessionFormValues>({
        resolver: zodResolver(editSessionSchema),
        defaultValues: {
            session_date: defaultValues?.session_date ? new Date(defaultValues.session_date) : new Date(),
            session_content: defaultValues?.session_content || '',
            interventions: defaultValues?.interventions || '',
            conclusions: defaultValues?.conclusions || '',
            change_justification: defaultValues?.change_justification || '',
        },
    });

    const handleSubmit = (values: EditSessionFormValues) => {
        // Formatear la fecha sin conversión a UTC para evitar cambios de zona horaria
        const year = values.session_date.getFullYear();
        const month = String(values.session_date.getMonth() + 1).padStart(2, '0');
        const day = String(values.session_date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        onSubmit({
            session_date: formattedDate,
            session_content: values.session_content,
            interventions: values.interventions,
            conclusions: values.conclusions,
            change_justification: values.change_justification,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Fecha de Sesión */}
                <FormField
                    control={form.control}
                    name="session_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>
                                Fecha de Sesión <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <DatePicker
                                    value={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    placeholder="Selecciona una fecha"
                                    disabled={isSubmitting}
                                    disableDates={(date) => date > new Date() || date < new Date('1900-01-01')}
                                    calendarType="shadcn"
                                    buttonClassName="w-full text-left"
                                />
                            </FormControl>
                            <FormDescription>Fecha en la que se realizó la sesión</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Contenido de la Sesión */}
                <FormField
                    control={form.control}
                    name="session_content"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Contenido de la Sesión <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Sesión centrada en ansiedad ante exámenes. Estudiante reporta dificultades para concentrarse..."
                                    className="min-h-[120px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Descripción detallada del desarrollo de la sesión ({field.value?.length || 0}/5000)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Intervenciones */}
                <FormField
                    control={form.control}
                    name="interventions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Intervenciones <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Técnicas de respiración profunda, reestructuración cognitiva, establecimiento de rutinas de estudio..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Intervenciones o técnicas aplicadas durante la sesión ({field.value?.length || 0}/5000)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Conclusiones */}
                <FormField
                    control={form.control}
                    name="conclusions"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Conclusiones <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Estudiante muestra avances en el manejo de la ansiedad. Se recomienda continuar con las técnicas..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Conclusiones y recomendaciones de la sesión ({field.value?.length || 0}/5000)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Justificación del Cambio */}
                <FormField
                    control={form.control}
                    name="change_justification"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Justificación del Cambio <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Corrección de error en el contenido, actualización de intervenciones por nueva evaluación..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Explique el motivo de la modificación de esta sesión (requerido para auditoría) ({field.value?.length || 0}/1000)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Botones de acción */}
                <div className="flex justify-end gap-3">
                    {showCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando cambios...' : submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
