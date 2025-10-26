'use client';

// Sección de Expediente y Consulta Inicial para expedientes médicos
import { MedicalConsultationForm } from '@/components/clinical-records/medical-consultation/medical-consultation-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CreateMedicalConsultationData } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const recordSchema = z.object({
    general_background: z.string().max(5000, 'Los antecedentes no pueden superar los 5000 caracteres').optional(),
});

type RecordFormValues = z.infer<typeof recordSchema>;

interface RecordConsultationProps {
    studentName: string;
    onNext: (data: { general_background?: string; consultation: CreateMedicalConsultationData }) => void;
    defaultValues?: {
        general_background?: string;
        consultation?: Partial<CreateMedicalConsultationData>;
    };
}

export default function RecordConsultationSection({ studentName, onNext, defaultValues }: RecordConsultationProps) {
    const recordForm = useForm<RecordFormValues>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            general_background: defaultValues?.general_background || '',
        },
    });

    const handleConsultationSubmit = (consultationData: CreateMedicalConsultationData) => {
        const recordData = recordForm.getValues();
        onNext({
            general_background: recordData.general_background,
            consultation: consultationData,
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Expediente y Consulta Inicial</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Crear expediente médico para <span className="font-medium text-foreground">{studentName}</span>
                </p>
            </div>

            {/* Formulario de Antecedentes del Expediente */}
            <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-medium">Antecedentes Médicos</h3>
                <Form {...recordForm}>
                    <FormField
                        control={recordForm.control}
                        name="general_background"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Antecedentes Generales</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Alergias, enfermedades crónicas, cirugías previas, medicamentos actuales, antecedentes familiares relevantes (opcional)..."
                                        className="min-h-[150px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Información médica relevante del estudiante ({field.value?.length || 0}/5000)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </div>

            {/* Formulario de Consulta Inicial */}
            <div className="rounded-lg border bg-card p-6">
                <h3 className="mb-4 text-lg font-medium">Consulta Médica Inicial</h3>
                <MedicalConsultationForm onSubmit={handleConsultationSubmit} defaultValues={defaultValues?.consultation} submitLabel="Siguiente" />
            </div>
        </div>
    );
}
