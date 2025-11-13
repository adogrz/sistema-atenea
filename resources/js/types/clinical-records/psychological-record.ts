import { ProfessionalBasicInfo, StudentBasicInfo, Timestamps } from './shared';
import { ConsentFormWithRelations } from './medical-record';

/**
 * Modelo de Expediente Psicológico
 */
export interface PsychologicalRecord extends Timestamps {
    id: number;
    student_nie: string;
    initial_assessment?: string;
    created_by: number;
    change_justification?: string;
}

/**
 * Información básica del expediente psicológico (para props y listados)
 */
export interface PsychologicalRecordBasicInfo {
    id: number;
    student_nie: string;
    initial_assessment?: string;
    created_at: string;
}

/**
 * Expediente psicológico con relaciones
 */
export interface PsychologicalRecordWithRelations extends PsychologicalRecord {
    student?: StudentBasicInfo;
    creator?: ProfessionalBasicInfo;
    psychological_sessions?: PsychologicalSessionWithRelations[];
}

/**
 * Modelo de Sesión Psicológica
 */
export interface PsychologicalSession extends Timestamps {
    id: number;
    psychological_record_id: number;
    psychologist_id: number;
    consent_form_id?: number;
    session_date: string;
    session_content: string;
    interventions?: string;
    conclusions?: string;
    change_justification?: string;
    deleted_at?: string;
}

/**
 * Sesión psicológica con relaciones
 */
export interface PsychologicalSessionWithRelations extends PsychologicalSession {
    psychologist?: ProfessionalBasicInfo;
    psychological_record?: PsychologicalRecord;
    consent_form?: ConsentFormWithRelations;
}

/**
 * Datos para crear un consentimiento informado psicológico
 */
export interface CreatePsychologicalConsentData {
    responsible_id: number;
    type: 'psychological';
    granted_at: string;
    file: File;
    observations?: string;
}

/**
 * Datos para crear un expediente psicológico
 */
export interface CreatePsychologicalRecordData {
    student_nie: string;
    initial_assessment?: string;
    is_minor: boolean;
    // Consentimiento existente
    consent_form_id?: number;
    // O crear nuevo consentimiento
    consent?: CreatePsychologicalConsentData;
    // Sesión inicial (obligatoria)
    session: {
        session_date: string;
        session_content: string;
        interventions?: string;
        conclusions?: string;
    };
}

/**
 * Datos para actualizar un expediente psicológico
 */
export interface UpdatePsychologicalRecordData {
    initial_assessment?: string;
    justification: string;
}

/**
 * Datos para crear una sesión psicológica
 */
export interface CreatePsychologicalSessionData {
    session_date: string;
    session_content: string;
    interventions?: string;
    conclusions?: string;
}

/**
 * Datos completos para crear una sesión psicológica (con consent)
 */
export interface CreatePsychologicalSessionFullData extends CreatePsychologicalSessionData {
    psychological_record_id: number;
    is_minor: boolean;
    // Consentimiento existente
    consent_form_id?: number;
    // O crear nuevo consentimiento
    consent?: CreatePsychologicalConsentData;
}

/**
 * Datos para actualizar una sesión psicológica
 */
export interface UpdatePsychologicalSessionData {
    session_date: string;
    session_content: string;
    interventions?: string;
    conclusions?: string;
    change_justification: string;
}
