'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EntityFinder } from '@/components/ui/entity-finder';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAssignmentForm } from '@/hooks/use-assignment-form';
import { AssignmentWithRelations, RecordType } from '@/types/clinical-records';
import { Loader2 } from 'lucide-react';

interface AssignmentFormProps {
    currentAssignment?: AssignmentWithRelations;
    assignmentType: RecordType;
    onCancel: () => void;
}

export function AssignmentForm({ currentAssignment, assignmentType, onCancel }: AssignmentFormProps) {
    const {
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
        onSubmit,
    } = useAssignmentForm({ currentAssignment, assignmentType });

    return (
        <Card className="mx-auto max-w-3xl">
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Estudiante */}
                        <FormField
                            control={form.control}
                            name="student_nie"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <EntityFinder
                                            searchRoute="clinical-records.assignments.search.students"
                                            value={field.value}
                                            onSelect={handleStudentSelect}
                                            onClear={handleStudentClear}
                                            label="Estudiante"
                                            placeholder="Buscar por nombre o NIE del estudiante..."
                                            selectedInfo={selectedStudentInfo || undefined}
                                            error={fieldState.error?.message}
                                            disabled={isEdit}
                                            maxResults={6}
                                        />
                                    </FormControl>
                                    {isEdit && (
                                        <FormDescription className="text-xs text-muted-foreground/70 italic">
                                            El estudiante no puede modificarse en una asignación existente.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Profesional */}
                        <FormField
                            control={form.control}
                            name="professional_id"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormControl>
                                        <EntityFinder
                                            searchRoute="clinical-records.assignments.search.professionals"
                                            searchParams={{ type: assignmentType }}
                                            value={field.value}
                                            onSelect={handleProfessionalSelect}
                                            onClear={handleProfessionalClear}
                                            label="Profesional"
                                            placeholder="Buscar por nombre del profesional..."
                                            selectedInfo={selectedProfessionalInfo || undefined}
                                            error={fieldState.error?.message}
                                            maxResults={6}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-muted-foreground/70">
                                        Selecciona el profesional {assignmentType === 'medical' ? 'médico' : 'psicólogo'} que atenderá al estudiante.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Separador visual */}
                        {isEdit && <div className="my-6 border-t border-border/60" />}

                        {/* Estado Activo - Solo en edición */}
                        {isEdit && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="is_active"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex flex-row items-center justify-between rounded-lg border border-border/80 bg-muted/20 p-4 transition-colors hover:bg-muted/30">
                                                <div className="flex-1 space-y-1 pr-4">
                                                    <FormLabel className="text-sm font-medium">Estado de la asignación</FormLabel>
                                                    <FormDescription className="text-xs text-muted-foreground/70">
                                                        {field.value
                                                            ? 'La asignación está activa. El profesional tiene acceso al expediente.'
                                                            : 'La asignación está desactivada. El profesional no tiene acceso al expediente.'}
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Activar o desactivar asignación" />
                                                </FormControl>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Justificación - Solo si hay cambios */}
                                {hasChanges && (
                                    <FormField
                                        control={form.control}
                                        name="change_justification"
                                        render={({ field }) => (
                                            <FormItem className="duration-200 animate-in fade-in-0 slide-in-from-top-1">
                                                <FormLabel className="text-sm font-medium">
                                                    Justificación del cambio
                                                    {!form.watch('is_active') && <span className="ml-1 text-destructive">*</span>}
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Explica el motivo del cambio en la asignación..."
                                                        className="min-h-[100px] resize-none text-sm focus-visible:ring-2"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-muted-foreground/70">
                                                    {!form.watch('is_active')
                                                        ? 'Obligatorio al desactivar. Mínimo 10 caracteres, máximo 1000 caracteres.'
                                                        : 'Recomendado al modificar el profesional. Mínimo 10 caracteres si se proporciona.'}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </>
                        )}

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-6">
                            <Button type="button" variant="outline" onClick={onCancel} disabled={form.formState.isSubmitting} className="min-w-[100px]">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitDisabled()} className="min-w-[100px]">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Actualizar Asignación' : 'Crear Asignación'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
