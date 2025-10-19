

"use client";

import { ColumnDef } from '@tanstack/react-table';

interface Mes {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    fechaCierre: string;
}


export const columns: ColumnDef<Mes>[] = [
    {
        accessorKey: "nombre",
        header: "Mes",
    },
    {
        accessorKey: "fechaInicio",
        header: "Fecha de Inicio",
    },
    {
        accessorKey: "fechaFin",
        header: "Fecha de Fin",
    },
    {
        accessorKey: "fechaCierre",
        header: "Fecha de Cierre",
    },
];