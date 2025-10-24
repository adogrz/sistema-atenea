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
