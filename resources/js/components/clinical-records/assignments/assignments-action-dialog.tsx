'use client';

import { AsyncCombobox } from '@/components/ui/async-combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AssignmentWithRelations, RecordType } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z
    .object({
        student_nie: z.string().min(1, 'El NIE del estudiante es requerido'),
        professional_id: z.string().min(1, 'Debe seleccionar un profesional'),
        is_active: z.boolean(),
        change_justification: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Validación condicional: si is_active es false, la justificación es obligatoria
        if (!data.is_active && (!data.change_justification || data.change_justification.trim().length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Debe proporcionar una justificación para desactivar esta asignación.',
                path: ['change_justification'],
            });
        }

        // Validación de longitud mínima si hay justificación
        if (data.change_justification && data.change_justification.trim().length > 0 && data.change_justification.trim().length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La justificación debe tener al menos 10 caracteres.',
                path: ['change_justification'],
            });
        }

        // Validación de longitud máxima
        if (data.change_justification && data.change_justification.length > 1000) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'La justificación no puede exceder los 1000 caracteres.',
                path: ['change_justification'],
            });
        }
    });

type FormValues = z.infer<typeof formSchema>;

interface SearchItem {
    value: string;
    label: string;
    nie?: string;
    [key: string]: unknown;
}

interface Props {
    currentAssignment?: AssignmentWithRelations;
    open: boolean;
    onOpenChange: () => void;
    onRefresh?: () => void;
    // El tipo se infiere del rol del usuario (canManageMedical = medical, canManagePsychological = psychological)
    assignmentType?: RecordType;
}

export function AssignmentsActionDialog({ currentAssignment, open, onOpenChange, onRefresh, assignmentType = 'medical' }: Props) {
    const isEdit = !!currentAssignment;
    const title = isEdit ? 'Editar Asignación' : 'Nueva Asignación';
    const description = isEdit ? 'Modifica los datos de la asignación existente.' : 'Crea una nueva asignación de estudiante a profesional.';

    // Estados para búsqueda asíncrona
    const [students, setStudents] = useState<SearchItem[]>([]);
    const [professionals, setProfessionals] = useState<SearchItem[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
    const [selectedStudentLabel, setSelectedStudentLabel] = useState('');
    const [selectedProfessionalLabel, setSelectedProfessionalLabel] = useState('');

    // Estado para rastrear si hubo cambios en los campos
    const [hasChanges, setHasChanges] = useState(false);
    const [originalValues, setOriginalValues] = useState<FormValues | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            student_nie: '',
            professional_id: '',
            is_active: true,
            change_justification: '',
        },
    });

    // Resetear el formulario y estados cuando se abre el dialog
    useEffect(() => {
        if (open) {
            if (currentAssignment) {
                const initialValues = {
                    student_nie: currentAssignment.student_nie,
                    professional_id: currentAssignment.professional_id.toString(),
                    is_active: currentAssignment.is_active,
                    change_justification: currentAssignment.change_justification || '',
                };

                form.reset(initialValues);
                setOriginalValues(initialValues);

                const studentName = currentAssignment.student
                    ? (() => {
                          const fullName = [
                              currentAssignment.student.primer_nombre,
                              currentAssignment.student.segundo_nombre,
                              currentAssignment.student.primer_apellido,
                              currentAssignment.student.segundo_apellido,
                          ]
                              .filter(Boolean)
                              .join(' ');
                          return `${fullName} - NIE: ${currentAssignment.student_nie}`;
                      })()
                    : currentAssignment.student_nie;

                const professionalName = currentAssignment.professional?.name || 'Profesional no disponible';

                setSelectedStudentLabel(studentName);
                setSelectedProfessionalLabel(professionalName);
                setHasChanges(false);
            } else {
                form.reset({
                    student_nie: '',
                    professional_id: '',
                    is_active: true,
                    change_justification: '',
                });
                setOriginalValues(null);
                setSelectedStudentLabel('');
                setSelectedProfessionalLabel('');
                setHasChanges(false);
            }
            setStudents([]);
            setProfessionals([]);
        }
    }, [open, currentAssignment, form]);

    // Detectar cambios en los valores del formulario
    useEffect(() => {
        if (!isEdit || !originalValues) {
            setHasChanges(false);
            return;
        }

        const subscription = form.watch((values) => {
            const changed = values.professional_id !== originalValues.professional_id || values.is_active !== originalValues.is_active;

            setHasChanges(changed);
        });

        return () => subscription.unsubscribe();
    }, [form, isEdit, originalValues]);

    // Determinar si el botón de guardar debe estar deshabilitado
    const isSubmitDisabled = () => {
        if (form.formState.isSubmitting) return true;

        if (isEdit) {
            // En modo edición: deshabilitar si no hay cambios
            return !hasChanges;
        } else {
            // En modo creación: deshabilitar si faltan campos requeridos
            const values = form.getValues();
            return !values.student_nie || !values.professional_id;
        }
    };

    // Búsqueda de estudiantes
    const handleStudentSearch = async (search: string) => {
        if (!search || search.length < 2) {
            setStudents([]);
            return;
        }

        setIsLoadingStudents(true);
        try {
            // TODO: Reemplazar con la ruta real del backend
            const response = await axios.get(`/api/students/search`, {
                params: { q: search, limit: 10 },
            });

            const formattedStudents = response.data.map(
                (student: { nie: string; primer_nombre: string; segundo_nombre?: string; primer_apellido: string; segundo_apellido?: string }) => {
                    const fullName = [student.primer_nombre, student.segundo_nombre, student.primer_apellido, student.segundo_apellido]
                        .filter(Boolean)
                        .join(' ');

                    return {
                        value: student.nie,
                        label: `${fullName} - NIE: ${student.nie}`,
                        nie: student.nie,
                    };
                },
            );

            setStudents(formattedStudents);
        } catch (error) {
            console.error('Error buscando estudiantes:', error);
            setStudents([]);
        } finally {
            setIsLoadingStudents(false);
        }
    };

    // Búsqueda de profesionales
    const handleProfessionalSearch = async (search: string) => {
        if (!search || search.length < 2) {
            setProfessionals([]);
            return;
        }

        setIsLoadingProfessionals(true);
        try {
            // TODO: Reemplazar con la ruta real del backend
            const response = await axios.get(`/api/professionals/search`, {
                params: {
                    q: search,
                    type: assignmentType,
                    limit: 10,
                },
            });

            const formattedProfessionals = response.data.map((professional: { id: number; name: string }) => ({
                value: professional.id.toString(),
                label: professional.name,
            }));

            setProfessionals(formattedProfessionals);
        } catch (error) {
            console.error('Error buscando profesionales:', error);
            setProfessionals([]);
        } finally {
            setIsLoadingProfessionals(false);
        }
    };

    const onSubmit = async (data: FormValues) => {
        // El tipo se agrega aquí según el rol del jefe
        const submitData = {
            ...data,
            type: currentAssignment?.type || assignmentType,
        };

        console.log('Datos del formulario:', submitData);

        // Aquí irá la lógica para guardar usando Inertia
        if (isEdit) {
            console.log('Actualizar asignación:', currentAssignment?.id);
            // router.put(`/dashboard/clinical-records/assignments/${currentAssignment?.id}`, submitData)
        } else {
            console.log('Crear nueva asignación');
            // router.post('/dashboard/clinical-records/assignments', submitData)
        }

        onOpenChange();
        onRefresh?.();
    };

    // Manejar cambio en el switch de is_active
    const handleActiveChange = (checked: boolean) => {
        form.setValue('is_active', checked);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Campo NIE del Estudiante con búsqueda asíncrona */}
                        <FormField
                            control={form.control}
                            name="student_nie"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estudiante</FormLabel>
                                    <FormControl>
                                        <AsyncCombobox
                                            value={field.value}
                                            onValueChange={(value, item) => {
                                                field.onChange(value);
                                                if (item) {
                                                    setSelectedStudentLabel(item.label);
                                                }
                                            }}
                                            onSearchChange={handleStudentSearch}
                                            items={students}
                                            placeholder="Buscar estudiante..."
                                            searchPlaceholder="Escribe el nombre o NIE..."
                                            emptyText="No se encontraron estudiantes. Intenta con otro nombre."
                                            loadingText="Buscando estudiantes..."
                                            isLoading={isLoadingStudents}
                                            disabled={isEdit}
                                            selectedLabel={selectedStudentLabel}
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        {isEdit
                                            ? 'El estudiante no puede modificarse en una asignación existente.'
                                            : 'Empieza a escribir el nombre o NIE del estudiante.'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo Profesional con búsqueda asíncrona */}
                        <FormField
                            control={form.control}
                            name="professional_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profesional</FormLabel>
                                    <FormControl>
                                        <AsyncCombobox
                                            value={field.value}
                                            onValueChange={(value, item) => {
                                                field.onChange(value);
                                                if (item) {
                                                    setSelectedProfessionalLabel(item.label);
                                                }
                                            }}
                                            onSearchChange={handleProfessionalSearch}
                                            items={professionals}
                                            placeholder="Buscar profesional..."
                                            searchPlaceholder="Escribe el nombre del profesional..."
                                            emptyText="No se encontraron profesionales. Intenta con otro nombre."
                                            loadingText="Buscando profesionales..."
                                            isLoading={isLoadingProfessionals}
                                            selectedLabel={selectedProfessionalLabel}
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Selecciona el profesional {assignmentType === 'medical' ? 'médico' : 'psicólogo'} que atenderá al estudiante.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo Estado Activo con Switch */}
                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="flex-1 space-y-1">
                                        <FormLabel>Asignación Activa</FormLabel>
                                        <FormDescription
                                            className={`text-sm transition-colors duration-300 ${
                                                !field.value && isEdit ? 'font-medium text-destructive' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {!field.value && isEdit
                                                ? 'Al desactivar, el profesional perderá acceso inmediato al expediente. Debes proporcionar una justificación.'
                                                : isEdit
                                                  ? 'Desactivar esta asignación removerá el acceso del profesional al expediente.'
                                                  : 'Las nuevas asignaciones se crean activas por defecto.'}
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={handleActiveChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Justificación del cambio */}
                        {isEdit && (
                            <FormField
                                control={form.control}
                                name="change_justification"
                                render={({ field }) => (
                                    <FormItem className="duration-300 animate-in fade-in-50 slide-in-from-top-2">
                                        <FormLabel className="transition-colors duration-200">
                                            Justificación del Cambio
                                            {hasChanges && !form.watch('is_active') && (
                                                <span className="ml-1 text-destructive duration-200 animate-in fade-in">*</span>
                                            )}
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={
                                                    hasChanges
                                                        ? 'Ej: Cambio de profesional debido a redistribución de carga de trabajo en la sede...'
                                                        : ''
                                                }
                                                {...field}
                                                rows={3}
                                                disabled={!hasChanges}
                                                className={`transition-all duration-300 ${
                                                    !hasChanges ? 'cursor-not-allowed bg-muted opacity-60' : 'opacity-100'
                                                }`}
                                            />
                                        </FormControl>
                                        <FormDescription
                                            className={`text-sm transition-all duration-300 ${
                                                hasChanges && !form.watch('is_active') ? 'font-medium text-destructive' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {!hasChanges
                                                ? 'Este campo se habilitará cuando realices cambios en el profesional o el estado de la asignación.'
                                                : !form.watch('is_active')
                                                  ? 'Obligatorio al desactivar una asignación. Mínimo 10 caracteres.'
                                                  : 'Recomendado al modificar una asignación. Mínimo 10 caracteres si se proporciona.'}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onOpenChange}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitDisabled()}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Guardar Cambios' : 'Crear Asignación'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
