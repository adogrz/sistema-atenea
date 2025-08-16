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

export interface FaseOlimpiada {
    numero_fase: number;
    id: number;
    nombre: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    activa: boolean;
    descripcion: string;
    olimpiada: {
        nombre: string;
        area_academica: string;
        descripcion: string;
        fecha_inicio: Date;
        fecha_fin: Date;
        activa: boolean;
    }
}

export interface Inscripcion {
    id: number | null | undefined;
    estado: any;
    codigo_estudiante: string;
    fase_id: number;
    fecha_inscripcion: Date;
}