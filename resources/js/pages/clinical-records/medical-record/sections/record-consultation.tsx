'use client';

import { MedicalConsultationForm } from '@/components/clinical-records/medical-consultation/medical-consultation-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
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
    onNext: (data: { general_background?: string; consultation: CreateMedicalConsultationData }) => void;
    defaultValues?: {
        general_background?: string;
        consultation?: Partial<CreateMedicalConsultationData>;
    };
}

export default function RecordConsultationSection({ onNext, defaultValues }: RecordConsultationProps) {
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
            {/* Antecedentes Médicos */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Antecedentes Médicos</h3>
                <Form {...recordForm}>
                    <FormField
                        control={recordForm.control}
                        name="general_background"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Antecedentes Generales <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej: Alergia a la penicilina, asma controlado con inhalador, cirugía de apéndice en 2020..."
                                        className="min-h-[120px] resize-none"
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

            <Separator />

            {/* Consulta Médica Inicial */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Consulta Médica Inicial</h3>
                <MedicalConsultationForm onSubmit={handleConsultationSubmit} defaultValues={defaultValues?.consultation} submitLabel="Siguiente" />
            </div>
        </div>
    );
}
