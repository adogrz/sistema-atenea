'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const deleteSessionSchema = z.object({
    justification: z
        .string()
        .min(10, 'La justificación debe tener al menos 10 caracteres')
        .max(1000, 'La justificación no puede superar los 1000 caracteres'),
});

type DeleteSessionFormValues = z.infer<typeof deleteSessionSchema>;

interface DeleteSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sessionDate: string;
    sessionContent: string;
    onConfirm: (data: DeleteSessionFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export default function DeleteSessionDialog({
    open,
    onOpenChange,
    sessionDate,
    sessionContent,
    onConfirm,
    isSubmitting = false,
}: DeleteSessionDialogProps) {
    const form = useForm<DeleteSessionFormValues>({
        resolver: zodResolver(deleteSessionSchema),
        defaultValues: {
            justification: '',
        },
    });

    // Resetear el formulario cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            form.reset({
                justification: '',
            });
        }
    }, [open, form]);

    const onSubmit = async (data: DeleteSessionFormValues) => {
        await onConfirm(data);
    };

    const justificationValue = form.watch('justification');
    const isFormValid = justificationValue && justificationValue.trim().length >= 10;

    // Función para truncar texto largo
    const truncateText = (text: string, maxLength: number = 100): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Eliminar Sesión Psicológica</DialogTitle>
                    <DialogDescription>
                        Esta acción eliminará la sesión psicológica de forma permanente. Esta acción requiere justificación por razones de auditoría.
                    </DialogDescription>
                </DialogHeader>

                {/* Alerta de advertencia */}
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>¡Advertencia!</strong> Esta acción no se puede deshacer. La sesión será eliminada permanentemente del sistema.
                    </AlertDescription>
                </Alert>

                {/* Información de la sesión a eliminar */}
                <div className="rounded-lg border bg-muted/50 p-4">
                    <h3 className="mb-2 font-semibold">Sesión a eliminar:</h3>
                    <div className="space-y-1 text-sm">
                        <div>
                            <span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{sessionDate}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Contenido:</span>{' '}
                            <span className="font-medium">{truncateText(sessionContent)}</span>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Campo de Justificación */}
                        <FormField
                            control={form.control}
                            name="justification"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Justificación de Eliminación <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Sesión registrada por error, datos incorrectos que no se pueden corregir, duplicado de otra sesión..."
                                            className="min-h-[120px] resize-none"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Explica detalladamente el motivo de la eliminación ({field.value?.length || 0}/1000)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="destructive" disabled={isSubmitting || !isFormValid}>
                                {isSubmitting ? 'Eliminando...' : 'Eliminar Sesión'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
