import { ProfessionalBasicInfo, StudentBasicInfo, Timestamps } from './shared';

/**
 * Modelo de Expediente Médico
 */
export interface MedicalRecord extends Timestamps {
    id: number;
    student_nie: string;
    general_background?: string;
    created_by: number;
    change_justification?: string;
}

/**
 * Información básica del expediente médico (para props y listados)
 */
export interface MedicalRecordBasicInfo {
    id: number;
    student_nie: string;
    general_background?: string;
    created_at: string;
}

/**
 * Expediente médico con relaciones
 */
export interface MedicalRecordWithRelations extends MedicalRecord {
    student?: StudentBasicInfo;
    creator?: ProfessionalBasicInfo;
    medical_consultations?: MedicalConsultationWithRelations[];
}

/**
 * Modelo de Consulta Médica
 */
export interface MedicalConsultation extends Timestamps {
    id: number;
    medical_record_id: number;
    doctor_id: number;
    consent_form_id?: number;
    consultation_date: string;
    diagnosis: string;
    treatment?: string;
    observations?: string;
    change_justification?: string;
}

/**
 * Consulta médica con relaciones
 */
export interface MedicalConsultationWithRelations extends MedicalConsultation {
    doctor?: ProfessionalBasicInfo;
    medical_record?: MedicalRecord;
    consent_form?: ConsentFormWithRelations;
}

/**
 * Modelo de Consentimiento Informado
 */
export interface ConsentForm extends Timestamps {
    id: number;
    student_nie: string;
    responsible_id: number;
    professional_id: number;
    type: 'medical' | 'psychological';
    granted_at: string;
    file_path: string;
    observations?: string;
    change_justification?: string;
}

/**
 * Información básica del responsable
 */
export interface ResponsibleBasicInfo {
    id: number;
    dui: string;
    nombres_responsable: string;
    apellidos_responsable: string;
    email_responsable?: string;
    telefono_responsable?: string;
}

/**
 * Consentimiento con relaciones
 */
export interface ConsentFormWithRelations extends ConsentForm {
    student?: StudentBasicInfo;
    responsible?: ResponsibleBasicInfo;
    professional?: ProfessionalBasicInfo;
}

/**
 * Datos para crear un consentimiento informado médico (específico para medical records)
 */
export interface CreateMedicalConsentData {
    responsible_id: number;
    type: 'medical';
    granted_at: string;
    file: File;
    observations?: string;
}

/**
 * Datos para crear un expediente médico (multistep form)
 */
export interface CreateMedicalRecordData {
    student_nie: string;
    general_background?: string;
    consultation: {
        consultation_date: string;
        diagnosis: string;
        treatment?: string;
        observations?: string;
    };
    consent?: CreateMedicalConsentData;
    consent_form_id?: number;
    is_minor: boolean;
}

/**
 * Datos para crear una consulta médica
 */
export interface CreateMedicalConsultationData {
    consultation_date: string;
    diagnosis: string;
    treatment?: string;
    observations?: string;
}

/**
 * Datos para actualizar una consulta médica
 */
export interface UpdateMedicalConsultationData {
    consultation_date: string;
    diagnosis: string;
    treatment?: string;
    observations?: string;
    change_justification: string;
}

/**
 * Datos para crear un consentimiento informado
 */
export interface CreateConsentFormData {
    responsible_id: number;
    type: 'medical' | 'psychological';
    granted_at: string;
    file: File;
    observations?: string;
}
