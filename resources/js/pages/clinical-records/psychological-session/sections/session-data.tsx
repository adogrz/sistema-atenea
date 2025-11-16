'use client';

import { PsychologicalSessionForm } from '@/components/clinical-records/psychological-session/psychological-session-form';
import { CreatePsychologicalSessionData } from '@/types/clinical-records';

interface SessionDataSectionProps {
    onNext: (data: CreatePsychologicalSessionData) => void;
    defaultValues?: CreatePsychologicalSessionData;
}

export function SessionDataSection({ onNext, defaultValues }: SessionDataSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Datos de la Sesión</h3>
                <p className="text-sm text-muted-foreground">Complete la información de la sesión psicológica</p>
            </div>

            <PsychologicalSessionForm onSubmit={onNext} defaultValues={defaultValues} submitLabel="Continuar" />
        </div>
    );
}
