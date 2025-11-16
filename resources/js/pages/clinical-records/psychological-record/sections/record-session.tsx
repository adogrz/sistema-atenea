'use client';

import { PsychologicalSessionForm } from '@/components/clinical-records/psychological-session/psychological-session-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CreatePsychologicalSessionData } from '@/types/clinical-records';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const recordSchema = z.object({
    initial_assessment: z.string().max(5000, 'La evaluación inicial no puede superar los 5000 caracteres').optional(),
});

type RecordFormValues = z.infer<typeof recordSchema>;

interface RecordSessionProps {
    onNext: (data: { initial_assessment?: string; session: CreatePsychologicalSessionData }) => void;
    defaultValues?: {
        initial_assessment?: string;
        session?: Partial<CreatePsychologicalSessionData>;
    };
}

export default function RecordSessionSection({ onNext, defaultValues }: RecordSessionProps) {
    const recordForm = useForm<RecordFormValues>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            initial_assessment: defaultValues?.initial_assessment || '',
        },
    });

    const handleSessionSubmit = (sessionData: CreatePsychologicalSessionData) => {
        const recordData = recordForm.getValues();
        onNext({
            initial_assessment: recordData.initial_assessment,
            session: sessionData,
        });
    };

    return (
        <div className="space-y-8">
            {/* Evaluación Inicial */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Evaluación Inicial</h3>
                <Form {...recordForm}>
                    <FormField
                        control={recordForm.control}
                        name="initial_assessment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Evaluación Inicial <span className="text-sm font-normal text-muted-foreground">(Opcional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej: Estudiante presenta ansiedad ante situaciones sociales, bajo rendimiento académico reciente, dificultades en relaciones interpersonales..."
                                        className="min-h-[120px] resize-none"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Evaluación psicológica inicial del estudiante ({field.value?.length || 0}/5000)</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </Form>
            </div>

            <Separator />

            {/* Primera Sesión Psicológica */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Primera Sesión Psicológica</h3>
                <PsychologicalSessionForm onSubmit={handleSessionSubmit} defaultValues={defaultValues?.session} submitLabel="Siguiente" />
            </div>
        </div>
    );
}
