'use client';

import DeleteConsultationDialog from '@/components/clinical-records/medical-consultation/delete-consultation-dialog';
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
import { router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = () => {
        router.get(
            route('clinical-records.medical-records.consultations.show', {
                medical_record: consultation.medical_record_id,
                consultation: consultation.id,
            }),
        );
    };

    const handleEdit = () => {
        router.get(
            route('clinical-records.medical-records.consultations.edit', {
                medical_record: consultation.medical_record_id,
                consultation: consultation.id,
            }),
        );
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async (data: { justification: string }) => {
        setIsDeleting(true);
        let consultationId: number | null = null;

        await new Promise<void>((resolve) => {
            router.delete(
                route('clinical-records.medical-records.consultations.destroy', {
                    medical_record: consultation.medical_record_id,
                    consultation: consultation.id,
                }),
                {
                    data: {
                        justification: data.justification,
                    },
                    onSuccess: () => {
                        setIsDeleteDialogOpen(false);
                        consultationId = consultation.id;

                        // Toast con botón de deshacer
                        toast.success('Consulta médica eliminada exitosamente', {
                            duration: 10000, // 10 segundos para deshacer
                            action: {
                                label: 'Deshacer',
                                onClick: () => {
                                    if (consultationId) {
                                        handleUndoDelete(consultationId, consultation.medical_record_id);
                                    }
                                },
                            },
                        });
                    },
                    onError: (errors: Record<string, string>) => {
                        const firstError = Object.values(errors)[0];
                        toast.error(firstError || 'No se pudo eliminar la consulta médica.');
                    },
                    onFinish: () => {
                        setIsDeleting(false);
                        resolve();
                    },
                    preserveScroll: true,
                },
            );
        });
    };

    const handleUndoDelete = (consultationId: number, medicalRecordId: number) => {
        router.post(
            route('clinical-records.medical-records.consultations.restore', {
                medical_record: medicalRecordId,
                consultation: consultationId,
            }),
            {},
            {
                onSuccess: () => {
                    toast.success('Consulta restaurada exitosamente');
                },
                onError: (errors: Record<string, string>) => {
                    const firstError = Object.values(errors)[0];
                    toast.error(firstError || 'No se pudo restaurar la consulta.');
                },
                preserveScroll: true,
            },
        );
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

            <DeleteConsultationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                consultationDate={format(new Date(consultation.consultation_date), 'PPP', { locale: es })}
                diagnosis={consultation.diagnosis}
                onConfirm={handleConfirmDelete}
                isSubmitting={isDeleting}
            />
        </>
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
