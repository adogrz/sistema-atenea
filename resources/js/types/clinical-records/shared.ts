/**
 * Tipos compartidos entre los diferentes submódulos de expediente clínico
 */

/**
 * Tipos de expedientes clinicos
 */
export type RecordType = 'medical' | 'psychological';

/**
 * Información básica del estudiante
 */
export interface StudentBasicInfo {
    nie: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    email: string;
    fecha_nacimiento: string;
    codigo: string;
}

/**
 * Información básica del profesional
 */
export interface ProfessionalBasicInfo {
    id: number;
    name: string;
    email: string;
    sede_name?: string;
}

/**
 * Timestamps comunes
 */
export interface Timestamps {
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}
