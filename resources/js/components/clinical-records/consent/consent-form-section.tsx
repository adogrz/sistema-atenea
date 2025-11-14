'use client';

import { ConsentFormSelector } from '@/components/clinical-records/consent/consent-form-selector';
import { CreateConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';

interface ConsentFormSectionProps {
    responsables: ResponsibleBasicInfo[];
    existingConsents?: Array<{ id: number; granted_at: string; responsible_name: string }>;
    onNext: (data: { consent_form_id?: number; consent?: CreateConsentData }) => void;
    onBack: () => void;
    defaultValues?: {
        use_existing?: 'existing' | 'new';
        consent_form_id?: number;
        consent?: Partial<CreateConsentData>;
    };
    consentType?: 'medical' | 'psychological';
}

/**
 * Sección de consentimiento para flujos multi-step.
 * Wrapper del componente ConsentFormSelector con props específicas del flujo multi-step.
 * Reutilizable en creación de expedientes y consultas.
 */
export function ConsentFormSection({
    responsables,
    existingConsents = [],
    onNext,
    onBack,
    defaultValues,
    consentType = 'medical',
}: ConsentFormSectionProps) {
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
            consentType={consentType}
        />
    );
}
