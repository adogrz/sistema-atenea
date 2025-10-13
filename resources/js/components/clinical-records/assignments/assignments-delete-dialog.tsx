'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AssignmentWithRelations } from '@/types/clinical-records';

interface Props {
    currentAssignment?: AssignmentWithRelations;
    open: boolean;
    onOpenChange: () => void;
    onRefresh?: () => void;
}

export function AssignmentsDeleteDialog({ currentAssignment, open, onOpenChange, onRefresh }: Props) {
    const handleDelete = () => {
        console.log('Desactivar asignación:', currentAssignment?.id);
        // TODO: Hacer lógica de desactivación usando Inertia
        // router.post('/dashboard/clinical-records/assignments/toggle-status', { id: currentAssignment?.id })
        onOpenChange();
        onRefresh?.();
    };

    if (!currentAssignment) return null;

    const studentName = currentAssignment.student
        ? `${currentAssignment.student.primer_nombre} ${currentAssignment.student.primer_apellido}`
        : currentAssignment.student_nie;

    const action = currentAssignment.is_active ? 'desactivar' : 'activar';
    const actionTitle = currentAssignment.is_active ? 'Desactivar' : 'Activar';

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción {action}á la asignación del estudiante <strong>{studentName}</strong>.
                        {currentAssignment.is_active && ' El profesional ya no podrá acceder a este expediente.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        className={
                            currentAssignment.is_active
                                ? 'bg-destructive text-white hover:bg-destructive/90'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }
                    >
                        {actionTitle}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
