export type Asignada = {
  id: number; // evaluacion_id
  estado: 'en_proceso' | 'finalizado' | string;
  total: number;
  inscripcion: {
    id: number;
    fase_id: number;
    participante?: Participante;
    fase?: Fase;
  };
};

export type Disponible = {
  id: number; // inscripcion_id
  fase_id: number;
  participante?: Participante;
  fase?: Fase;
};


export interface Participante {
  nombre_completo: string;
}

export interface Fase {
  id: number;
  nombre: string;
}

export interface Inscripcion {
  id: number;
  participante: Participante;
  fase: Fase;
}

export interface EvaluacionFase {
  id: number;
  inscripcion: Inscripcion;
  total: number;
}

export interface ItemDefinido {
  id: number;
  nombre: string;
  descripcion: string;
  puntaje_maximo: number;
  orden: number;
  fase_olimpiada_id: number;
}

export type CalificacionesMap = Record<
  number, // item_definido_id
  {
    puntaje: number;
    observacion: string;
  }
>;

export interface ItemEvaluado {
  id: number;
  evaluacion_fase_id: number;
  item_definido_id: number;
  puntaje: number;
  observacion: string | null;
  calificado_por: number;
  calificado_en: string; // ISO date
}
