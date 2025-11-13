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
import { PsychologicalSessionWithRelations } from '@/types/clinical-records';
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import DeleteSessionDialog from './delete-session-dialog';

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
 * Componente para las acciones de la sesión
 */
function ActionsCell({ session }: { session: PsychologicalSessionWithRelations }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleView = () => {
        router.get(
            route('clinical-records.psychological-records.sessions.show', {
                psychological_record: session.psychological_record_id,
                session: session.id,
            }),
        );
    };

    const handleEdit = () => {
        router.get(
            route('clinical-records.psychological-records.sessions.edit', {
                psychological_record: session.psychological_record_id,
                session: session.id,
            }),
        );
    };

    const handleDeleteClick = () => {
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async (data: { justification: string }) => {
        setIsDeleting(true);
        let sessionId: number | null = null;

        return new Promise<void>((resolve, reject) => {
            router.delete(
                route('clinical-records.psychological-records.sessions.destroy', {
                    psychological_record: session.psychological_record_id,
                    session: session.id,
                }),
                {
                    data: {
                        justification: data.justification.trim(),
                    },
                    onSuccess: () => {
                        sessionId = session.id;
                        setDeleteDialogOpen(false);

                        // Toast con botón de deshacer
                        toast.success('Sesión psicológica eliminada exitosamente', {
                            duration: 10000, // 10 segundos para deshacer
                            action: {
                                label: 'Deshacer',
                                onClick: () => {
                                    if (sessionId) {
                                        handleUndoDelete(sessionId, session.psychological_record_id);
                                    }
                                },
                            },
                        });
                        resolve();
                    },
                    onError: (errors: Record<string, string>) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(firstError || 'No se pudo eliminar la sesión psicológica.');
                        reject(new Error(firstError));
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                    },
                    preserveScroll: true,
                },
            );
        });
    };

    const handleUndoDelete = (sessionId: number, psychologicalRecordId: number) => {
        router.post(
            route('clinical-records.psychological-records.sessions.restore', {
                psychological_record: psychologicalRecordId,
                session: sessionId,
            }),
            {},
            {
                onSuccess: () => {
                    toast.success('Sesión restaurada exitosamente');
                },
                onError: (errors: Record<string, string>) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'No se pudo restaurar la sesión.');
                },
                preserveScroll: true,
            },
        );
    };

    const sessionDateFormatted = format(new Date(session.session_date), "dd 'de' MMMM 'de' yyyy", { locale: es });

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0" disabled={isDeleting}>
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
                    <DropdownMenuItem onClick={handleDeleteClick} className="cursor-pointer text-destructive">
                        <Trash2 className="mr-2 size-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteSessionDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                sessionDate={sessionDateFormatted}
                sessionContent={session.session_content}
                onConfirm={handleConfirmDelete}
                isSubmitting={isDeleting}
            />
        </>
    );
}

/**
 * Columnas para la tabla de sesiones psicológicas
 */
export const getPsychologicalSessionColumns = (): ColumnDef<PsychologicalSessionWithRelations>[] => [
    {
        accessorKey: 'session_date',
        header: 'Fecha de Sesión',
        cell: ({ row }) => {
            const date = formatDate(row.original.session_date);
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{date}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(row.original.session_date), 'HH:mm', { locale: es })}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'psychologist',
        header: 'Psicólogo',
        cell: ({ row }) => {
            const psychologist = row.original.psychologist;
            return <span className="text-sm">{psychologist?.name || 'N/A'}</span>;
        },
    },
    {
        accessorKey: 'session_content',
        header: 'Contenido de la Sesión',
        cell: ({ row }) => {
            const content = row.original.session_content;
            return (
                <div className="max-w-md">
                    <p className="text-sm" title={content}>
                        {truncateText(content, 80)}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: 'interventions',
        header: 'Intervenciones',
        cell: ({ row }) => {
            const interventions = row.original.interventions;
            if (!interventions) {
                return <span className="text-sm text-muted-foreground italic">Sin intervenciones</span>;
            }
            return (
                <div className="max-w-md">
                    <p className="text-sm" title={interventions}>
                        {truncateText(interventions, 60)}
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
        cell: ({ row }) => <ActionsCell session={row.original} />,
    },
];
