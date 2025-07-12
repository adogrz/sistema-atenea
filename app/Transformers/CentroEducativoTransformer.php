<?php

namespace App\Transformers;

class CentroEducativoTransformer
{

    /*
     * Control de coincidencias de encabezado
     */
    protected array $map = [
        'codigo' => [
            'CÓDIGO',
            'CODIGO',
            'Código',
            'Código CE',
            'Código Centro Educativo',
            'ID',
            'ID CE',
            'ID Centro',
            'Código Institución'
        ],

        'nombre' => [
            'NOMBRE',
            'Nombre CE',
            'Nombre del Centro',
            'Centro Educativo',
            'Nombre Institución',
            'Nombre de la Escuela',
            'Nombre'
        ],

        'departamento' => [
            'DEPARTAMENTO',
            'DPTO',
            'Dpto.',
            'Depto',
            'Departamento CE',
            'Ubicación Dpto.',
            'Depto Geográfico'
        ],

        'distrito' => [
            'MUNICIPIO',
            'MUNIC',
            'Municipio CE',
            'Municipio de Ubicación',
            'Distrito',
            'Distrito Escolar',
            'Código Municipio'
        ],

        'sector' => [
            'SECTOR',
            'Tipo de Institución',
            'Naturaleza',
            'Sector Educativo',
            'Sector CE',
            'Tipo Centro'
        ],

        'zona' => [
            'ZONA',
            'Área',
            'Zona Geográfica',
            'Ubicación',
            'Región Urbana/Rural',
            'Zona CE'
        ],

        'direccion' => [
            'DIRECCIÓN',
            'Dirección',
            'Dirección Física',
            'Dirección del Centro',
            'Ubicación',
            'Domicilio',
            'Dirección CE'
        ],

        'internacional' => [
            'INTERNACIONAL',
            'Internacional SI/NO',
            '¿Es Internacional?',
            'Centro Internacional',
            'Participación Internacional',
            'Clasificación'
        ],
    ];

    /*
     * Función encargada de indexar los nombres de columna : Map -> Revisar coincidencia en la tabla! 
     */
    public function mapHeaders(array $header): array
    {
        $indexes = [];

        foreach ($this->map as $field => $aliases) {
            foreach ($header as $i => $columnName) {
                $normalized = $this->normalize($columnName);

                foreach ($aliases as $alias) {
                    if ($normalized === $this->normalize($alias)) {
                        $indexes[$field] = $i;
                        break 2; // Salta a la siguiente propiedad una vez encontrado
                    }
                }
            }
        }
        return $indexes;
    }

    public function transformRow(array $row, array $indexes): array
    {
        $data = [];

        foreach (array_keys($this->map) as $field) {
            $index = $indexes[$field] ?? null;
            $value = $index !== null ? trim($row[$index]) : '';

            if ($field === 'sector' && !in_array($value, ['PÚBLICO', 'PRIVADO'])) {
                $value = 'PÚBLICO';
            }

            if ($field === 'zona' && !in_array($value, ['Rural', 'Urbana'])) {
                $value = 'Urbana';
            }

            if ($field === 'internacional') {
                $value = strtoupper($value) === 'SI' ? 'SI' : 'NO';
            }

            $data[$field] = $value;
        }

        return $data;
    }

    /*
     * Función encargada de normalizar los encabezados de columan : Map 
     */
    public function normalize($text): string
    {
        // Convertir a mayúsculas
        $text = mb_strtoupper($text, 'UTF-8');

        // Reemplazar caracteres acentuados por equivalentes sin acento
        $text = strtr($text, [
            'Á' => 'A',
            'É' => 'E',
            'Í' => 'I',
            'Ó' => 'O',
            'Ú' => 'U',
            'Ñ' => 'N',
        ]);

        // Eliminar espacios extra y símbolos si es necesario
        $text = preg_replace('/[^A-Z0-9 ]/', '', $text);
        $text = trim($text);

        return $text;
    }
}
