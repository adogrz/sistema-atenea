'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FileUpload } from '@/components/ui/file-upload';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CreateMedicalConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';
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
            .max(new Date(), 'La fecha no puede ser futura')
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

interface ConsentFormSectionProps {
    studentName: string;
    responsables: ResponsibleBasicInfo[];
    existingConsents?: Array<{ id: number; granted_at: string; responsible_name: string }>;
    onNext: (data: { consent_form_id?: number; consent?: CreateMedicalConsentData }) => void;
    onBack: () => void;
    defaultValues?: {
        use_existing?: 'existing' | 'new';
        consent_form_id?: number;
        consent?: Partial<CreateMedicalConsentData>;
    };
}

export function ConsentFormSection({ studentName, responsables, existingConsents = [], onNext, onBack, defaultValues }: ConsentFormSectionProps) {
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
            onNext({ consent_form_id: values.consent_form_id });
        } else {
            if (hasNoResponsables) return; // bloquear si no hay responsables
            onNext({
                consent: {
                    responsible_id: values.responsible_id!,
                    type: 'medical',
                    granted_at: format(values.granted_at!, 'yyyy-MM-dd'),
                    file: values.file!,
                    observations: values.observations,
                },
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Consentimiento Informado</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    El estudiante <span className="font-medium text-foreground">{studentName}</span> es menor de edad y requiere consentimiento
                </p>
            </div>

            <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Consentimiento Requerido</AlertTitle>
                <AlertDescription>
                    Para continuar con la atención médica de un menor de edad, es necesario contar con el consentimiento informado de un responsable
                    legal.
                </AlertDescription>
            </Alert>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInternal)} className="space-y-6">
                    {/* Opción: Usar existente o crear nuevo */}
                    {existingConsents.length > 0 && (
                        <FormField
                            control={form.control}
                            name="use_existing"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>¿Desea usar un consentimiento existente o crear uno nuevo?</FormLabel>
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
                        <div className="rounded-lg border bg-card p-6">
                            <FormField
                                control={form.control}
                                name="consent_form_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Seleccionar Consentimiento</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccione un consentimiento" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {existingConsents.map((consent) => (
                                                    <SelectItem key={consent.id} value={consent.id.toString()}>
                                                        {consent.responsible_name} - {format(new Date(consent.granted_at), 'dd/MM/yyyy')}
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
                        <div className="space-y-6 rounded-lg border bg-card p-6">
                            <h3 className="text-lg font-medium">Nuevo Consentimiento Informado</h3>

                            {hasNoResponsables && (
                                <Alert variant="destructive">
                                    <AlertTitle>Sin responsables registrados</AlertTitle>
                                    <AlertDescription>
                                        Este estudiante no tiene responsables asociados. Registre un responsable antes de crear un consentimiento.
                                    </AlertDescription>
                                </Alert>
                            )}

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
                                                value={field.value?.toString()}
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
                                                            {responsable.nombres_responsable} {responsable.apellidos_responsable} - {responsable.dui}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>
                                                {/* Mantener el valor en el formulario */}
                                                <input
                                                    type="hidden"
                                                    value={field.value?.toString() || responsables[0]?.id?.toString() || ''}
                                                    readOnly
                                                />
                                                <div className="text-sm text-muted-foreground">
                                                    {responsables[0]?.nombres_responsable} {responsables[0]?.apellidos_responsable} -{' '}
                                                    {responsables[0]?.dui}
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
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                                                    >
                                                        {field.value ? format(field.value, 'PPP', { locale: es }) : <span>Selecciona una fecha</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                                    initialFocus
                                                    locale={es}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>Fecha en que se otorgó el consentimiento</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Archivo */}
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Documento de Consentimiento <span className="text-destructive">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <FileUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                maxSize={10 * 1024 * 1024}
                                                placeholder="Subir documento de consentimiento"
                                            />
                                        </FormControl>
                                        <FormDescription>Archivo PDF, JPG o PNG del consentimiento firmado (máx. 10MB)</FormDescription>
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
                                        <FormLabel>Observaciones</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Observaciones adicionales (opcional)..."
                                                className="min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Notas adicionales sobre el consentimiento ({field.value?.length || 0}/2000)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="flex justify-between gap-3">
                        <Button type="button" variant="outline" onClick={onBack}>
                            Atrás
                        </Button>
                        <Button type="submit" disabled={useExisting === 'new' && hasNoResponsables}>
                            Siguiente
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
