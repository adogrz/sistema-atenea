import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Permission {
    id: number;
    name: string;
}

export interface RolePivot {
    is_primary: boolean;
    expires_at: string | null;
}

export interface Role {
    pivot?: RolePivot;
    id: number;
    name: string;
    description: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    status: string;
    permissions?: Permission[];
    roles?: Role[];

    [key: string]: unknown;
}

export interface Auth {
    user: User | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href?: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    isOpen?: boolean;
    items?: NavItem[];
}

export interface SelectItem {
    name: string;
    description: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;

    [key: string]: unknown;
}

export interface ItemDefinido {
    id: number;
    definicion_evaluacion_id: number;
    nombre: string;
    descripcion: string | null;
    orden: number;
    puntos_maximos: number;
    created_at: string;
    updated_at: string;
    // Frontend-only property for DND
    local_id?: string;
}

export interface DefinicionEvaluacion {
    id: number;
    nombre: string;
    descripcion: string | null;
    version: number;
    estado: 'borrador' | 'publicada' | 'archivada';
    bloqueada: boolean;
    creada_por: number;
    created_at: string;
    updated_at: string;
    items_definidos: ItemDefinido[];
}

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

export interface Area {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface Olimpiada {
    id: number;
    nombre: string;
    descripcion: string | null;
    area_id: number;
    activa: boolean;
    created_at: string;
    updated_at: string;
    nivel_educativo_id: number;
    tipo: 'nivel' | 'olimpico';
    anio: number; // Add this line
    area?: Area; // Eager loaded relationship
    fases?: FaseOlimpiada[]; // Eager loaded relationship
    nivelEducativo?: NivelEducativo; // Eager loaded relationship
}

export interface FaseOlimpiada {
    id: number;
    nombre: string;
    orden: number;
    cupos: number;
    fecha_inicio: string;
    fecha_fin: string;
    activa: boolean;
    observaciones?: string | null;
    descripcion?: string | null;
    resultados_publicados?: boolean;
    nota_minima_aprobacion?: number | null;
    definicion_evaluacion?: DefinicionEvaluacion;
    olimpiada?: Olimpiada; // Add this
}

export interface Inscripcion {
    id: number;
    estado: any; // Consider defining a more specific type for estado
    codigo_estudiante: string;
    fase_id: number;
    fecha_inscripcion: Date;
}

export interface Resultado {
    evaluacion_id: number;
    olimpiada_id: number; // Add this
    fase_id: number;
    fase_nombre: string;
    olimpiada_nombre: string;
    estudiante_id: number;
    estudiante_codigo: string; // Add this
    estudiante_nombre: string;
    estudiante_email: string;
    total_score: number;
    max_score: number;
    percentage_score: number;
    aprobado: boolean;
    nota_minima: number;
    pasa_siguiente_fase: boolean;
}

export interface ItemEvaluado {
    id: number;
    evaluacion_id: number;
    item_definido_id: number;
    puntaje: number | null;
    observacion: string | null;
    calificador_id: number | null; // Added
    item_definido: ItemDefinido; // Eager loaded
    calificador?: User; // Eager loaded
}

export interface Evaluacion {
    id: number;
    estudiante_id: number;
    fase_id: number;
    finalizada_at: string | null; // Changed from fecha_evaluacion
    estado: string;
    observaciones_generales: string | null;
    estudiante: Estudiante & { user: User }; // Eager loaded
    faseOlimpiada: FaseOlimpiada; // Eager loaded
    items_evaluados: ItemEvaluado[]; // Eager loaded
}

export interface CalificadorItemAsignado {
    id: number;
    calificador_id: number;
    calificador_name: string;
    item_definido_id: number;
    item_definido_nombre: string;
    fase_olimpiada_id: number;
    fase_olimpiada_nombre: string;
    olimpiada_id: number;
    olimpiada_nombre: string;
    area_id: number;
    area_name: string;
    year: number;
    created_at: string;
}

export interface ChartData {
    assignmentsByYearAndArea: { [year: string]: { [areaName: string]: number } };
    assignmentsByYearAndCalificador: { [year: string]: { [calificadorName: string]: number } };
    totalAssignmentsByYear: { [year: string]: number };
}

export type PageProps = SharedData & {
    definicionEvaluacion?: DefinicionEvaluacion;
    definiciones?: DefinicionEvaluacion[];
    itemDefinido?: ItemDefinido;
    resultados?: Resultado[];
    evaluacion?: Evaluacion;
};