export interface ItemDefinido {
    id?: number;
    local_id?: string; // Used for frontend keying and DND
    definicion_evaluacion_id?: number;
    nombre: string;
    descripcion?: string;
    orden: number;
    obligatorio: boolean;
    ponderacion: number;
    puntaje_maximo: number;
    created_at?: string;
    updated_at?: string;
}

export interface DefinicionEvaluacion {
    id?: number;
    nombre: string;
    descripcion?: string;
    creada_por?: number;
    estado: boolean;
    bloqueada: boolean;
    items_definidos?: ItemDefinido[];
    created_at?: string;
    updated_at?: string;
}
