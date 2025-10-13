import { useAssignments } from '@/contexts/clinical-records/assignments/assignmets-context';
import { RecordType } from '@/types/clinical-records';
import { AssignmentsActionDialog } from './assignments-action-dialog';
import { AssignmentsDeleteDialog } from './assignments-delete-dialog';

interface AssignmentsDialogProps {
    onRefresh?: () => void;
    assignmentType?: RecordType;
}

export function AssignmentsDialogs({ onRefresh, assignmentType = 'medical' }: AssignmentsDialogProps) {
    const { open, setOpen, currentAssignment, setCurrentAssignment } = useAssignments();

    const handleCloseWithReset = () => {
        setOpen(null);
        setTimeout(() => setCurrentAssignment(undefined), 300);
    };

    return (
        <>
            {/* Dialog para ADD */}
            <AssignmentsActionDialog
                key="assignments-add"
                open={open === 'add'}
                onOpenChange={() => setOpen(null)}
                onRefresh={onRefresh}
                assignmentType={assignmentType}
            />

            {currentAssignment && (
                <>
                    {/* Dialog para EDIT */}
                    <AssignmentsActionDialog
                        key={`assignments-edit-${currentAssignment.id}`}
                        open={open === 'edit'}
                        onOpenChange={handleCloseWithReset}
                        onRefresh={onRefresh}
                        currentAssignment={currentAssignment}
                        assignmentType={assignmentType}
                    />

                    {/* Dialog para DELETE/DEACTIVATE */}
                    <AssignmentsDeleteDialog
                        key={`assignments-delete-${currentAssignment.id}`}
                        open={open === 'delete'}
                        onOpenChange={handleCloseWithReset}
                        onRefresh={onRefresh}
                        currentAssignment={currentAssignment}
                    />
                </>
            )}
        </>
    );
}
