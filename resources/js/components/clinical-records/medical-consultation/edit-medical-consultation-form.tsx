'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UpdateMedicalConsultationData } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const editConsultationSchema = z.object({
    consultation_date: z
        .date({
            required_error: 'La fecha de consulta es requerida',
        })
        .refine((date) => date <= new Date(), 'La fecha de consulta no puede ser posterior a hoy'),
    diagnosis: z
        .string({
            required_error: 'El diagnóstico es requerido',
        })
        .min(10, 'El diagnóstico debe tener al menos 10 caracteres')
        .max(5000, 'El diagnóstico no puede superar los 5000 caracteres'),
    treatment: z.string().max(5000, 'El tratamiento no puede superar los 5000 caracteres').optional(),
    observations: z.string().max(5000, 'Las observaciones no pueden superar los 5000 caracteres').optional(),
    change_justification: z
        .string({
            required_error: 'La justificación del cambio es requerida',
        })
        .min(10, 'La justificación debe tener al menos 10 caracteres')
        .max(1000, 'La justificación no puede superar los 1000 caracteres'),
});

type EditConsultationFormValues = z.infer<typeof editConsultationSchema>;

interface EditMedicalConsultationFormProps {
    onSubmit: (data: UpdateMedicalConsultationData) => void;
    defaultValues?: Partial<UpdateMedicalConsultationData>;
    isSubmitting?: boolean;
    submitLabel?: string;
    showCancel?: boolean;
    onCancel?: () => void;
}

export function EditMedicalConsultationForm({
    onSubmit,
    defaultValues,
    isSubmitting = false,
    submitLabel = 'Guardar Cambios',
    showCancel = true,
    onCancel,
}: EditMedicalConsultationFormProps) {
    const form = useForm<EditConsultationFormValues>({
        resolver: zodResolver(editConsultationSchema),
        defaultValues: {
            consultation_date: defaultValues?.consultation_date ? new Date(defaultValues.consultation_date) : new Date(),
            diagnosis: defaultValues?.diagnosis || '',
            treatment: defaultValues?.treatment || '',
            observations: defaultValues?.observations || '',
            change_justification: defaultValues?.change_justification || '',
        },
    });

    const handleSubmit = (values: EditConsultationFormValues) => {
        // Formatear la fecha sin conversión a UTC para evitar cambios de zona horaria
        const year = values.consultation_date.getFullYear();
        const month = String(values.consultation_date.getMonth() + 1).padStart(2, '0');
        const day = String(values.consultation_date.getDate()).padStart(2, '0');
        const hours = String(values.consultation_date.getHours()).padStart(2, '0');
        const minutes = String(values.consultation_date.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        onSubmit({
            consultation_date: formattedDate,
            diagnosis: values.diagnosis,
            treatment: values.treatment,
            observations: values.observations,
            change_justification: values.change_justification,
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Fecha de Consulta */}
                <FormField
                    control={form.control}
                    name="consultation_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>
                                Fecha de Consulta <span className="text-destructive">*</span>
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
                            <FormDescription>Fecha en la que se realizó la consulta</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Diagnóstico */}
                <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Diagnóstico <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Faringitis aguda, dolor de cabeza persistente, fiebre de 38.5°C..."
                                    className="min-h-[120px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Descripción detallada del diagnóstico ({field.value?.length || 0}/5000)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Tratamiento */}
                <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Tratamiento <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Amoxicilina 500mg cada 8 horas por 7 días, reposo y abundantes líquidos..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Tratamiento médico prescrito ({field.value?.length || 0}/5000)</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Observaciones */}
                <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Observaciones <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ej: Control en 3 días si persisten los síntomas, evitar actividades físicas intensas..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>Notas u observaciones adicionales ({field.value?.length || 0}/5000)</FormDescription>
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
                                    placeholder="Ej: Corrección de error en el diagnóstico, actualización de tratamiento por nueva evaluación..."
                                    className="min-h-[100px] resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Explique el motivo de la modificación de esta consulta (requerido para auditoría) ({field.value?.length || 0}/1000)
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
