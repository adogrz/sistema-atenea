'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUpload } from '@/components/ui/file-upload';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateMedicalConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const consentFormSchema = z
    .object({
        use_existing: z.enum(['existing', 'new']),
        consent_form_id: z.number().optional(),
        responsible_id: z
            .number({
                required_error: 'El responsable es requerido',
            })
            .optional(),
        granted_at: z
            .date({
                required_error: 'La fecha de otorgamiento es requerida',
            })
            .refine((date) => date <= new Date(), 'La fecha no puede ser posterior a hoy')
            .optional(),
        file: z.instanceof(File, { message: 'El archivo es requerido' }).optional(),
        observations: z.string().max(2000, 'Las observaciones no pueden superar los 2000 caracteres').optional(),
    })
    .superRefine((data, ctx) => {
        if (data.use_existing === 'existing') {
            if (data.consent_form_id === undefined) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['consent_form_id'], message: 'Debe seleccionar un consentimiento existente' });
            }
        } else {
            // Validaciones para nuevo consentimiento
            if (!data.responsible_id) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['responsible_id'], message: 'El responsable es requerido' });
            }
            if (!data.granted_at) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['granted_at'], message: 'La fecha de otorgamiento es requerida' });
            }
            if (!data.file) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['file'], message: 'El archivo es requerido' });
            }
        }
    });

type ConsentFormValues = z.infer<typeof consentFormSchema>;

interface ConsentFormSelectorProps {
    responsables: ResponsibleBasicInfo[];
    existingConsents?: Array<{ id: number; granted_at: string; responsible_name: string }>;
    onSubmit: (data: { consent_form_id?: number; consent?: CreateMedicalConsentData }) => void;
    onCancel?: () => void;
    defaultValues?: {
        use_existing?: 'existing' | 'new';
        consent_form_id?: number;
        consent?: Partial<CreateMedicalConsentData>;
    };
    submitLabel?: string;
    showCancel?: boolean;
    showAlert?: boolean;
}

/**
 * Componente reutilizable para seleccionar un consentimiento existente o crear uno nuevo.
 * Se usa en:
 * - Creación de expediente médico
 * - Creación de consulta médica
 * - Edición de consulta médica
 */
export function ConsentFormSelector({
    responsables,
    existingConsents = [],
    onSubmit,
    onCancel,
    defaultValues,
    submitLabel = 'Continuar',
    showCancel = true,
    showAlert = true,
}: ConsentFormSelectorProps) {
    const form = useForm<ConsentFormValues>({
        resolver: zodResolver(consentFormSchema),
        defaultValues: {
            use_existing: defaultValues?.use_existing || (existingConsents.length > 0 ? 'existing' : 'new'),
            consent_form_id: defaultValues?.consent_form_id,
            responsible_id: defaultValues?.consent?.responsible_id || responsables[0]?.id,
            granted_at: defaultValues?.consent?.granted_at ? new Date(defaultValues.consent.granted_at) : new Date(),
            file: defaultValues?.consent?.file,
            observations: defaultValues?.consent?.observations || '',
        },
    });

    const useExisting = form.watch('use_existing');

    const hasMultipleResponsables = Array.isArray(responsables) && responsables.length > 1;
    const hasNoResponsables = !Array.isArray(responsables) || responsables.length === 0;

    // Asegurar responsible_id cuando hay 1 responsable
    useEffect(() => {
        if (!hasNoResponsables && !hasMultipleResponsables) {
            const id = responsables[0]?.id;
            if (id && !form.getValues('responsible_id')) {
                form.setValue('responsible_id', id, { shouldDirty: false, shouldValidate: true });
            }
        }
    }, [hasNoResponsables, hasMultipleResponsables, responsables, form]);

    const onSubmitInternal = (values: ConsentFormValues) => {
        if (values.use_existing === 'existing') {
            onSubmit({ consent_form_id: values.consent_form_id });
        } else {
            if (hasNoResponsables) return; // bloquear si no hay responsables

            // Formatear la fecha sin conversión a UTC para evitar cambios de zona horaria
            const year = values.granted_at!.getFullYear();
            const month = String(values.granted_at!.getMonth() + 1).padStart(2, '0');
            const day = String(values.granted_at!.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;

            onSubmit({
                consent: {
                    responsible_id: values.responsible_id!,
                    type: 'medical',
                    granted_at: formattedDate,
                    file: values.file!,
                    observations: values.observations,
                },
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Alert informativo para menores de edad */}
            {showAlert && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-900 dark:text-blue-100">Consentimiento Informado Requerido</AlertTitle>
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                        Para estudiantes menores de edad es necesario registrar o vincular un consentimiento informado del responsable legal.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInternal)} className="space-y-6">
                    {/* Opción: Usar existente o crear nuevo */}
                    {existingConsents.length > 0 && (
                        <FormField
                            control={form.control}
                            name="use_existing"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>Tipo de Consentimiento</FormLabel>
                                    <FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-y-0 space-x-3">
                                                <FormControl>
                                                    <RadioGroupItem value="existing" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Usar un consentimiento existente</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-y-0 space-x-3">
                                                <FormControl>
                                                    <RadioGroupItem value="new" />
                                                </FormControl>
                                                <FormLabel className="font-normal">Crear un nuevo consentimiento</FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    {/* Seleccionar consentimiento existente */}
                    {useExisting === 'existing' && existingConsents.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Seleccionar Consentimiento Existente</h3>
                            <FormField
                                control={form.control}
                                name="consent_form_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Consentimiento <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString() || ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un consentimiento" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {existingConsents.map((consent) => (
                                                    <SelectItem key={consent.id} value={consent.id.toString()}>
                                                        {consent.responsible_name} — {format(new Date(consent.granted_at), 'dd/MM/yyyy')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Consentimientos médicos válidos para este estudiante</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {/* Crear nuevo consentimiento */}
                    {useExisting === 'new' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium">Nuevo Consentimiento Informado</h3>

                            {hasNoResponsables && (
                                <Alert variant="destructive">
                                    <AlertTitle>Sin responsables registrados</AlertTitle>
                                    <AlertDescription>
                                        Este estudiante no tiene responsables asociados. Registre un responsable antes de crear un consentimiento.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-4">
                                {/* Responsable */}
                                <FormField
                                    control={form.control}
                                    name="responsible_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Responsable Legal <span className="text-destructive">*</span>
                                            </FormLabel>
                                            {hasMultipleResponsables ? (
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value))}
                                                    value={field.value?.toString() || ''}
                                                    disabled={hasNoResponsables}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione un responsable" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {responsables.map((responsable) => (
                                                            <SelectItem key={responsable.id} value={responsable.id.toString()}>
                                                                {responsable.nombres_responsable} {responsable.apellidos_responsable}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <div>
                                                    <input
                                                        type="hidden"
                                                        value={field.value?.toString() || responsables[0]?.id?.toString() || ''}
                                                        readOnly
                                                    />
                                                    <div className="rounded-md border border-input bg-muted px-3 py-2 text-sm">
                                                        {responsables[0]?.nombres_responsable} {responsables[0]?.apellidos_responsable}
                                                    </div>
                                                </div>
                                            )}
                                            <FormDescription>Responsable que otorga el consentimiento</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fecha de otorgamiento */}
                                <FormField
                                    control={form.control}
                                    name="granted_at"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>
                                                Fecha de Otorgamiento <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    value={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    placeholder="Selecciona una fecha"
                                                    disabled={hasNoResponsables}
                                                    disableDates={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                    calendarType="shadcn"
                                                    buttonClassName="w-full text-left"
                                                />
                                            </FormControl>
                                            <FormDescription>Fecha en que se otorgó el consentimiento</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Archivo */}
                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Documento de Consentimiento <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <FileUpload
                                                    {...field}
                                                    value={value}
                                                    onChange={onChange}
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    maxSize={10 * 1024 * 1024}
                                                    placeholder="Arrastra el archivo o haz clic para seleccionar"
                                                />
                                            </FormControl>
                                            <FormDescription>PDF, JPG, JPEG o PNG (máximo 10MB)</FormDescription>
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
                                                    placeholder="Notas adicionales sobre el consentimiento..."
                                                    className="min-h-[80px] resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Información adicional relevante ({field.value?.length || 0}/2000)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-4">
                        {showCancel && onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancelar
                            </Button>
                        )}
                        <Button type="submit" disabled={hasNoResponsables && useExisting === 'new'}>
                            {submitLabel}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
