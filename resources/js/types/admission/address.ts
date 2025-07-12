// Tipo de datos para el formulario de admisión
export interface Departamento {
  id: string;
  nombre_departamento: string;
}

export interface Municipio {
  id: string;
  nombre_municipio: string;
  id_departamento: string;
}

export interface Distrito {
  id: string;
  nombre_distrito: string;
  id_municipio: string;
}