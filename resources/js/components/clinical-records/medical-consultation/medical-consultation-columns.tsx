'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MedicalConsultationWithRelations } from '@/types/clinical-records';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

/**
 * Formatea la fecha en formato legible
 */
const formatDate = (dateString: string): string => {
    try {
        return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch {
        return dateString;
    }
};

/**
 * Trunca texto largo para mostrar en la tabla
 */
const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Componente para las acciones de la consulta
 */
function ActionsCell({ consultation }: { consultation: MedicalConsultationWithRelations }) {
    const handleView = () => {
        // TODO: Implementar vista de detalle
        console.log('Ver consulta:', consultation.id);
    };

    const handleEdit = () => {
        // TODO: Implementar edición
        console.log('Editar consulta:', consultation.id);
    };

    const handleDelete = () => {
        // TODO: Implementar eliminación
        console.log('Eliminar consulta:', consultation.id);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                    <Eye className="mr-2 size-4" />
                    Ver Detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                    <Pencil className="mr-2 size-4" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive">
                    <Trash2 className="mr-2 size-4" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/**
 * Columnas para la tabla de consultas médicas
 */
export const getMedicalConsultationColumns = (): ColumnDef<MedicalConsultationWithRelations>[] => [
    {
        accessorKey: 'consultation_date',
        header: 'Fecha de Consulta',
        cell: ({ row }) => {
            const date = formatDate(row.original.consultation_date);
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(row.original.consultation_date), 'HH:mm', { locale: es })}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'doctor',
        header: 'Médico',
        cell: ({ row }) => {
            const doctor = row.original.doctor;
            return <span className="text-sm">{doctor?.name || 'N/A'}</span>;
        },
    },
    {
        accessorKey: 'diagnosis',
        header: 'Diagnóstico',
        cell: ({ row }) => {
            const diagnosis = row.original.diagnosis;
            return (
                <div className="max-w-md">
                    <p className="text-sm" title={diagnosis}>
                        {truncateText(diagnosis, 80)}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'treatment',
        header: 'Tratamiento',
        cell: ({ row }) => {
            const treatment = row.original.treatment;
            if (!treatment) {
                return <span className="text-sm text-muted-foreground italic">Sin tratamiento</span>;
            }
            return (
                <div className="max-w-md">
                    <p className="text-sm" title={treatment}>
                        {truncateText(treatment, 60)}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Registrado',
        cell: ({ row }) => {
            const date = formatDate(row.original.created_at);
            return <span className="text-xs text-muted-foreground">{date}</span>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <ActionsCell consultation={row.original} />,
    },
];
