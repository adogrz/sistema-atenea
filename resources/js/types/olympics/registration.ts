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
    sexo: string;
    fecha_nacimiento: string;
    centro_educativo: string;
    nie: string;
    telefono_casa: string;
    email: string;
    direccion: string;
    distrito: number;
    nivel_educativo: number;
    aprobado: boolean;
}

export interface FaseOlimpiada {
    id: number
    nombre: string
    fecha_inicio: string
    fecha_fin: string
    modalidad: string
    nota_minima: string
    olimpiada: {
        nombre: string
        area_academica: string
    }
}

export interface Inscripcion {
    fase_id: number
    estado: string
}