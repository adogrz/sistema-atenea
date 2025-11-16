'use client';

import { ConsentFormSelector } from '@/components/clinical-records/consent/consent-form-selector';
import { CreateMedicalConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';

interface ConsentFormSectionProps {
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

/**
 * Sección de consentimiento para el flujo de creación de expediente médico.
 * Wrapper del componente ConsentFormSelector con props específicas del flujo multi-step.
 */
export function ConsentFormSection({ responsables, existingConsents = [], onNext, onBack, defaultValues }: ConsentFormSectionProps) {
    return (
        <ConsentFormSelector
            responsables={responsables}
            existingConsents={existingConsents}
            onSubmit={onNext}
            onCancel={onBack}
            defaultValues={defaultValues}
            submitLabel="Siguiente"
            showCancel={true}
            showAlert={true}
        />
    );
}

