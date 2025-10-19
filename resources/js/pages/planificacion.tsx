import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { AlertTriangle, ListTodo, ClipboardList, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '../components/academia/columnas-meses';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface para el modelo Mes
interface Mes {
    idMes: number;
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    fechaCierre: string;
    idNivelEducativo: number;
}

// Interface para el modelo Evaluacion
interface Evaluacion {
    id: number;
    nombre: string;
    creditoExtra: boolean;
    porcentaje: number;
    idMes: number;
    mes: Mes;
}

interface Props {
    meses: Mes[];
    evaluaciones: Evaluacion[];
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Planificación', href: '/planificacion/academia-sabatina' },
];

const Planificacion: React.FC<Props> = ({ meses, evaluaciones }) => {
    const anioActual = new Date().getFullYear();
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [mesSeleccionado, setMesSeleccionado] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <div className="space-y-8 p-6">
                {/* Banner de advertencia */}
                <div className="flex items-center gap-3 rounded-lg border-l-4 border-yellow-500 bg-muted/60 p-4 shadow-sm">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm font-medium text-muted-foreground">
                        <span className="font-bold uppercase text-yellow-700 dark:text-yellow-300">Atención:</span>{' '}
                        Luego de cumplida la <span className="font-semibold">fecha de cierre</span> no se podrán editar las calificaciones ni evaluaciones del periodo.
                    </p>
                </div>

                {/* Sección de planificación */}
                <div className="space-y-4">
                    <h1 className="flex items-center text-2xl font-bold text-foreground">
                        <ListTodo className="mr-3 h-7 w-7 text-blue-600 dark:text-blue-400" />
                        Planificación Programa Jóvenes Talento {anioActual}
                    </h1>
                    <div className="bg-card shadow-md rounded-2xl p-4">
                        <DataTable
                            columns={columns}
                            data={meses}
                            columnFilters={columnFilters}
                            setColumnFilters={setColumnFilters}
                        />
                    </div>
                </div>

                {/* Sección de evaluaciones */}
                <div className="space-y-4">
                    <h1 className="flex items-center text-2xl font-bold text-foreground">
                        <ClipboardList className="mr-3 h-7 w-7 text-green-600 dark:text-green-400" />
                        Evaluaciones
                    </h1>
                    <div className="bg-card shadow-md rounded-2xl p-4 space-y-4">
                        
                        {/* Selector de mes */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Mes:</span>
                            <Select onValueChange={(value) => setMesSeleccionado(Number(value))}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Selecciona un mes" />
                                </SelectTrigger>
                                <SelectContent>
                                    {meses.map((mes) => (
                                        <SelectItem key={mes.idMes} value={mes.idMes.toString()}>
                                            {mes.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Botones de acciones */}
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 p-2">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <PlusCircle className="size-4" />
                                <span>Agregar</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <Pencil className="size-4" />
                                <span>Editar</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Trash2 className="size-4" />
                                <span>Eliminar</span>
                            </Button>
                        </div>

                        {/* Aquí irá la tabla de evaluaciones */}
                        <p className="text-muted-foreground italic">
                            Próximamente listado de evaluaciones...
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Planificacion;
