'use client';

import { MedicalConsultationForm } from '@/components/clinical-records/medical-consultation/medical-consultation-form';
import { CreateMedicalConsultationData } from '@/types/clinical-records';

interface ConsultationDataSectionProps {
    onNext: (data: CreateMedicalConsultationData) => void;
    defaultValues?: Partial<CreateMedicalConsultationData>;
}

/**
 * Sección de datos de consulta médica para el flujo multi-step.
 * Wrapper del componente MedicalConsultationForm.
 */
export function ConsultationDataSection({ onNext, defaultValues }: ConsultationDataSectionProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Datos de la Consulta</h3>
            <MedicalConsultationForm
                onSubmit={onNext}
                defaultValues={defaultValues}
                submitLabel="Siguiente"
                showCancel={false}
            />
        </div>
    );
}

