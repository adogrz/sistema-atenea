export interface Distrito {
  id: string;
  nombre_distrito: string;
  id_municipio: string;
}

export interface CentroEducativo {
    codigo: string;
    nombre: string;
    departamento: string;
    distrito: string;
    sector: string;
    zona: string;
    direccion: string;
    internacional: string;
}

export interface NivelEducativo {
    codigo: number;
    descripcion: string;
    nivel: string;
    id_sede: string;
}

export interface Estudiante {
    codigo: string;
    user_id: string;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    nombre_completo: string;
    sexo: string;
    fecha_nacimiento: string;
    centro_educativo: string;
    nie: string;
    telefono_casa: string;
    email: string;
    direccion: string;
    distrito: number;
    nivel_educativo: number;
    nivel: string;
    aprobado: boolean;
}

// Updated and new interfaces
export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    created_at: string;
    updated_at: string;
}

export interface Area {
    id: number; // Changed to number for consistency with foreign keys
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface DefinicionEvaluacion {
    id: number;
    nombre: string;
    descripcion: string | null;
    creada_por: number; // Assuming this is a user ID
    estado: string;
    bloqueada: boolean;
    created_at: string;
    updated_at: string;
}

export interface Olimpiada {
    id: number;
    nombre: string;
    descripcion: string | null;
    fecha_inicio: string; // YYYY-MM-DD format
    fecha_fin: string;   // YYYY-MM-DD format
    area_id: number;
    activa: boolean;
    created_at: string;
    updated_at: string;
    area?: Area; // Eager loaded relationship
    fases?: FaseOlimpiada[]; // Eager loaded relationship
}

export interface FaseOlimpiada {
    id: number;
    olimpiada_id: number;
    nombre: string;
    orden: number;
    estado: 'programada' | 'en_proceso' | 'finalizada' | 'anulada';
    fecha_inicio: string | null; // YYYY-MM-DD HH:MM:SS format
    fecha_fin: string | null;   // YYYY-MM-DD HH:MM:SS format
    activa: boolean;
    observaciones: string | null;
    definicion_evaluacion_id: number | null;
    created_at: string;
    updated_at: string;
    definicion_evaluacion?: DefinicionEvaluacion; // Eager loaded relationship
}

export interface Inscripcion {
    id: number;
    estado: any; // Consider defining a more specific type for estado
    codigo_estudiante: string;
    fase_id: number;
    fecha_inscripcion: Date;
}
