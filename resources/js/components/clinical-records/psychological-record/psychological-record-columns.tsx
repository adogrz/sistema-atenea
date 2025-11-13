'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PsychologicalRecordWithRelations } from '@/types/clinical-records';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowUpDown, Eye, MoreHorizontal } from 'lucide-react';

export function getPsychologicalRecordColumns(): ColumnDef<PsychologicalRecordWithRelations>[] {
    return [
        {
            accessorKey: 'student_nie',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        NIE
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const nie = row.getValue('student_nie') as string;
                return <div className="font-medium">{nie}</div>;
            },
        },
        {
            id: 'student_name',
            accessorFn: (row) => {
                const student = row.student;
                if (!student) return 'N/A';
                return `${[student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ')} ${[student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ')}`;
            },
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Estudiante
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const name = row.getValue('student_name') as string;
                return <div className="font-medium">{name}</div>;
            },
        },
        {
            id: 'student_age',
            accessorFn: (row) => {
                const student = row.student;
                if (!student?.fecha_nacimiento) return null;
                return new Date().getFullYear() - new Date(student.fecha_nacimiento).getFullYear();
            },
            header: 'Edad',
            cell: ({ row }) => {
                const age = row.getValue('student_age') as number | null;
                return <div className="text-center">{age ? `${age} años` : 'N/A'}</div>;
            },
        },
        {
            id: 'has_assessment',
            accessorFn: (row) => !!row.initial_assessment,
            header: 'Evaluación Inicial',
            cell: ({ row }) => {
                const hasAssessment = row.getValue('has_assessment') as boolean;
                return (
                    <div className="flex justify-center">
                        <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                hasAssessment ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                            {hasAssessment ? 'Sí' : 'No'}
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'sessions_count',
            accessorFn: (row) => row.psychological_sessions?.length || 0,
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Sesiones
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const count = row.getValue('sessions_count') as number;
                return (
                    <div className="text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                            {count}
                        </span>
                    </div>
                );
            },
        },
        {
            id: 'creator_name',
            accessorFn: (row) => row.creator?.name || 'N/A',
            header: 'Creado por',
            cell: ({ row }) => {
                const creator = row.getValue('creator_name') as string;
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="max-w-[150px] truncate text-sm text-muted-foreground">{creator}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{creator}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Fecha de Creación
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const date = row.getValue('created_at') as string;
                return (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-sm">{format(new Date(date), 'dd/MM/yyyy', { locale: es })}</div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{format(new Date(date), 'PPP p', { locale: es })}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            },
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => {
                const record = row.original;

                const handleView = () => {
                    router.visit(
                        route('clinical-records.psychological-records.show', { psychological_record: record.id, source: 'psychological-records' }),
                    );
                };

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Expediente
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
