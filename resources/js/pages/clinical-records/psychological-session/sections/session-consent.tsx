'use client';

import { ConsentFormSection } from '@/components/clinical-records/consent/consent-form-section';
import { CreateConsentData, ResponsibleBasicInfo } from '@/types/clinical-records';

interface SessionConsentSectionProps {
    responsables: ResponsibleBasicInfo[];
    existingConsents: Array<{ id: number; granted_at: string; responsible_name: string }>;
    onNext: (data: { consent_form_id?: number; consent?: CreateConsentData }) => void;
    onBack: () => void;
    defaultValues?: {
        consent_form_id?: number;
        consent?: CreateConsentData;
    };
}

export function SessionConsentSection({ responsables, existingConsents, onNext, onBack, defaultValues }: SessionConsentSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Consentimiento Informado</h3>
                <p className="text-sm text-muted-foreground">Seleccione un consentimiento existente o cree uno nuevo</p>
            </div>

            <ConsentFormSection
                responsables={responsables}
                existingConsents={existingConsents}
                onNext={onNext}
                onBack={onBack}
                defaultValues={defaultValues}
                consentType="psychological"
            />
        </div>
    );
}
