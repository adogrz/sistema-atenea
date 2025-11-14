'use client';

import { ConsentFormSection } from '@/components/clinical-records/consent/consent-form-section';
import { CreateMedicalConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';

interface ConsultationConsentSectionProps {
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
 * Sección de consentimiento para el flujo de creación de consulta médica.
 * Simplemente re-exporta ConsentFormSection que es genérico.
 */
export function ConsultationConsentSection(props: ConsultationConsentSectionProps) {
    return <ConsentFormSection {...props} />;
}

