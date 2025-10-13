import { AssignmentWithRelations } from '@/types/clinical-records';
import { createContext, ReactNode, useContext, useState } from 'react';

type DialogMode = 'add' | 'edit' | 'delete' | null;

interface AssignmentsContextType {
    open: DialogMode;
    setOpen: (mode: DialogMode) => void;
    currentAssignment?: AssignmentWithRelations;
    setCurrentAssignment: (assignment?: AssignmentWithRelations) => void;
}

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState<DialogMode>(null);
    const [currentAssignment, setCurrentAssignment] = useState<AssignmentWithRelations | undefined>();

    return <AssignmentsContext.Provider value={{ open, setOpen, currentAssignment, setCurrentAssignment }}>{children}</AssignmentsContext.Provider>;
}

export function useAssignments() {
    const context = useContext(AssignmentsContext);
    if (!context) {
        throw new Error('useAssignments must be used within an AssignmentsProvider');
    }
    return context;
}
