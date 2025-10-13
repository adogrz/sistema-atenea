import { ProfessionalBasicInfo, RecordType, StudentBasicInfo, Timestamps } from "./shared";

/**
 * Modelo de Asignación
 */
export interface Assignment extends Timestamps {
    id: number;
    student_nie: string;
    professional_id: number;
    type: RecordType;
    is_active: boolean;
    change_justification?: string;
}

/**
 * Asignación con relaciones cargadas
 */
export interface AssignmentWithRelations extends Assignment {
    student?: StudentBasicInfo;
    professional?: ProfessionalBasicInfo;
}

/**
 * Filtros para listado de asignaciones
 */
export interface AssignmentFilters {
    student_nie?: string;
    professional_id?: number;
    type?: RecordType;
    is_active?: boolean;
    search?: string;
}

/**
 * Datos para crear una asignación
 */
export interface CreateAssignmentData {
    student_nie: string;
    professional_id: number;
    type: RecordType;
    change_justification?: string;
}

/**
 * Datos para actualizar una asignación
 */
export interface UpdateAssignmentData {
    professional_id?: number;
    is_active?: boolean;
    change_justification?: string;
}