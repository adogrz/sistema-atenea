export interface InternadoMateria {
    id: number;
    codigo: string;
    nombre: string;
    created_at?: string;
}

export interface Estudiante {
    id: string;
    codigo: string;
    nombre: string;
    nombres?: string;
    apellidos?: string;
    email: string;
    sede_name: string;
    sede_description?: string;
    promedio_general: number;
    materias: InternadoMateria[];
    status: string;
    en_internado: boolean;
    estado_internado?: string;
    fecha_ingreso?: string;
}

export interface InternadoPeriodo {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    descripcion?: string;
    activo: boolean;
    es_vigente: boolean;
    total_asistencias?: number;
    total_conductas?: number;
    created_at?: string;
}

export interface InternadoParticipante {
    id: number;
    estudiante_id: number;
    estudiante?: Estudiante;
    fecha_inicio: string;
    fecha_fin?: string;
    estado: 'activo' | 'inactivo' | 'graduado' | 'retirado';
    motivo_retiro?: string;
    created_at?: string;
}

export interface InternadoEvaluacion {
    id: number;
    periodo_id?: number;
    materia_id?: number;
    materia_codigo?: string;
    materia?: string;
    nombre: string;
    descripcion?: string;
    peso_porcentual: number;
    nota_maxima: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    permite_credito_extra: boolean;
    credito_extra_max: number;
    total_estudiantes: number;
    estudiantes_calificados: number;
    promedio: number;
    niveles_aplicables?: number[];
    niveles_text?: string;
    created_at?: string;
}

export interface InternadoCalificacion {
    id: number;
    evaluacion_id: number;
    participante_id: number;
    nota?: number;
    credito_extra?: number;
    observaciones?: string;
    created_at?: string;
}

export interface InternadoAsistencia {
    id: number;
    participante_id: number;
    periodo_id: number;
    fecha: string;
    presente: boolean;
    observaciones?: string;
    created_at?: string;
}

export interface InternadoConducta {
    id: number;
    participante_id: number;
    periodo_id: number;
    fecha: string;
    tipo: 'positiva' | 'negativa';
    categoria: string;
    descripcion: string;
    puntos: number;
    reportado_por?: string;
    created_at?: string;
}

export interface InternadoProgreso {
    participante: InternadoParticipante;
    estadisticas: {
        asistencias: {
            total: number;
            presentes: number;
            ausentes: number;
            porcentaje: number;
        };
        conductas: {
            total: number;
            positivas: number;
            negativas: number;
            puntos_totales: number;
        };
        evaluaciones: {
            total: number;
            completadas: number;
            promedio: number;
        };
    };
    asistencias_recientes: InternadoAsistencia[];
    conductas_recientes: InternadoConducta[];
    calificaciones: Array<{
        evaluacion: InternadoEvaluacion;
        calificacion: InternadoCalificacion;
    }>;
}