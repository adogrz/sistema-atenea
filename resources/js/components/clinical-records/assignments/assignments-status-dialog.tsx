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
import { Textarea } from '@/components/ui/textarea';
import { AssignmentWithRelations } from '@/types/clinical-records';
import { useMemo, useState } from 'react';

interface Props {
    currentAssignment: AssignmentWithRelations;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (justification: string) => Promise<void> | void;
}

export function AssignmentsStatusDialog({ currentAssignment, open, onOpenChange, onConfirm }: Props) {
    const [justification, setJustification] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const goingToDeactivate = useMemo(() => !!currentAssignment.is_active, [currentAssignment.is_active]);
    const actionTitle = goingToDeactivate ? 'Desactivar' : 'Activar';
    const studentName = useMemo(() => {
        if (!currentAssignment.student) return currentAssignment.student_nie;
        const s = currentAssignment.student;
        return [s.primer_nombre, s.segundo_nombre, s.primer_apellido, s.segundo_apellido].filter(Boolean).join(' ');
    }, [currentAssignment]);

    // Validación en vivo (obligatoria para activar o desactivar)
    const trimmed = justification.trim();
    const isInvalidJustification = trimmed.length < 10 || trimmed.length > 1000;

    const handleConfirm = async () => {
        setError(null);
        if (isInvalidJustification) {
            setError('La justificación es obligatoria (mínimo 10 y máximo 1000 caracteres).');
            return;
        }

        try {
            setSubmitting(true);
            await onConfirm(trimmed);
            setJustification('');
            onOpenChange(false);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿{actionTitle} asignación?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción {goingToDeactivate ? 'desactivará' : 'activará'} la asignación del estudiante <strong>{studentName}</strong>.
                        {goingToDeactivate && ' El profesional ya no podrá acceder a este expediente.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-2">
                    <label className="text-sm font-medium">
                        Justificación <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                        placeholder={goingToDeactivate ? 'Explica el motivo de la desactivación...' : 'Explica el motivo de la activación...'}
                        className="min-h-[100px] resize-none text-sm"
                    />
                    {(error || isInvalidJustification) && (
                        <p className="text-xs text-destructive">{error ?? 'La justificación es obligatoria (mínimo 10 y máximo 1000 caracteres).'}</p>
                    )}
                    {!error && !isInvalidJustification && (
                        <p className="text-xs text-muted-foreground/70">Requisito: mínimo 10 caracteres, máximo 1000.</p>
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={submitting || isInvalidJustification}
                        className={goingToDeactivate ? 'bg-destructive text-white hover:bg-destructive/90' : ''}
                    >
                        {actionTitle}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default AssignmentsStatusDialog;
