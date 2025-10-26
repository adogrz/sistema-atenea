'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AssignmentWithRelations } from '@/types/clinical-records';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Power, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AssignmentsStatusDialog from './assignments-status-dialog';

/**
 * Formatea el nombre completo del estudiante
 */
const getStudentFullName = (student?: AssignmentWithRelations['student']): string => {
    if (!student) return 'N/A';

    const nombres = [student.primer_nombre, student.segundo_nombre].filter(Boolean).join(' ');
    const apellidos = [student.primer_apellido, student.segundo_apellido].filter(Boolean).join(' ');

    return `${nombres} ${apellidos}`.trim();
};

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
 * Badge de estado de la asignación
 */
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1.5',
                isActive
                    ? 'border-teal-200 text-emerald-900 dark:border-teal-800 dark:text-emerald-200'
                    : 'border-destructive/20 text-red-900 dark:border-destructive/80 dark:text-red-200',
            )}
            title={isActive ? 'Asignación activa' : 'Asignación inactiva'}
        >
            <span className={cn('size-1.5 rounded-full', isActive ? 'bg-emerald-500' : 'bg-red-500')} aria-hidden="true"></span>
            {isActive ? 'Activa' : 'Inactiva'}
        </Badge>
    );
};

/**
 * Componente para las acciones de la asignación
 */
function ActionsCell({ assignment }: { assignment: AssignmentWithRelations }) {
    const [openDialog, setOpenDialog] = useState(false);

    const handleEdit = () => {
        router.visit(route('clinical-records.assignments.edit', assignment.id));
    };

    const handleToggleStatusClick = () => setOpenDialog(true);

    const onConfirm = async (justification: string) => {
        await new Promise<void>((resolve) => {
            router.patch(
                route('clinical-records.assignments.patch', assignment.id),
                {
                    is_active: !assignment.is_active,
                    change_justification: justification,
                    professional_id: assignment.professional_id,
                    type: assignment.type,
                },
                {
                    onSuccess: () => {
                        const msg = !assignment.is_active ? 'Asignación activada correctamente.' : 'Asignación desactivada correctamente.';
                        toast.success(msg);
                    },
                    onError: (errors: Record<string, string>) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(firstError || 'No se pudo actualizar el estado de la asignación.');
                    },
                    onFinish: () => resolve(),
                    preserveState: true,
                    preserveScroll: true,
                    only: ['assignments'],
                },
            );
        });
    };

    return (
        <>
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
                    <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                        <Pencil className="mr-2 size-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleToggleStatusClick} className="cursor-pointer">
                        {assignment.is_active ? (
                            <>
                                <PowerOff className="mr-2 size-4" />
                                Desactivar
                            </>
                        ) : (
                            <>
                                <Power className="mr-2 size-4" />
                                Activar
                            </>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AssignmentsStatusDialog currentAssignment={assignment} open={openDialog} onOpenChange={setOpenDialog} onConfirm={onConfirm} />
        </>
    );
}

/**
 * Columnas para el rol de Jefe (puede gestionar asignaciones)
 */
export const getManagerColumns = (): ColumnDef<AssignmentWithRelations>[] => [
    {
        accessorKey: 'student',
        header: 'Estudiante',
        cell: ({ row }) => {
            const student = row.original.student;
            const fullName = getStudentFullName(student);
            const nie = row.original.student_nie;

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{fullName}</span>
                    <span className="text-xs text-muted-foreground">NIE: {nie}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'professional',
        header: 'Profesional Asignado',
        cell: ({ row }) => {
            const professional = row.original.professional;

            if (!professional) {
                return <span className="text-sm text-muted-foreground">Sin asignar</span>;
            }

            return <span className="text-sm">{professional.name}</span>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha de Asignación',
        cell: ({ row }) => <span className="text-sm">{formatDate(row.original.created_at)}</span>,
    },
    {
        accessorKey: 'is_active',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => <ActionsCell assignment={row.original} />,
    },
];

/**
 * Columnas para el rol de Profesional (doctor o psicólogo)
 */
export const getProfessionalColumns = (): ColumnDef<AssignmentWithRelations>[] => [
    {
        accessorKey: 'student',
        header: 'Estudiante',
        cell: ({ row }) => {
            const student = row.original.student;
            const fullName = getStudentFullName(student);
            const nie = row.original.student_nie;

            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm">{fullName}</span>
                    <span className="text-xs text-muted-foreground">NIE: {nie}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha de Asignación',
        cell: ({ row }) => <span className="text-sm">{formatDate(row.original.created_at)}</span>,
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const assignment = row.original;

            const handleViewRecord = () => {
                // Verificar el tipo de asignación y redirigir apropiadamente
                if (assignment.type === 'medical') {
                    // Redirigir a crear o ver expediente médico
                    router.get(route('clinical-records.medical-records.create'), {
                        student_nie: assignment.student_nie,
                    });
                } else if (assignment.type === 'psychological') {
                    // TODO: Implementar redirección a expediente psicológico
                    toast.info('La funcionalidad de expedientes psicológicos estará disponible próximamente');
                }
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
                        <DropdownMenuItem onClick={handleViewRecord} className="cursor-pointer">
                            <Eye className="mr-2 size-4" />
                            Ver Expediente
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
