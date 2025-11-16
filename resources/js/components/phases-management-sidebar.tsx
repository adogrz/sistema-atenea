import React from 'react';
import { Olimpiada, FaseOlimpiada, DefinicionEvaluacion } from '@/types';
import { Button } from '@/components/ui/button';
import { FaTimes } from 'react-icons/fa';
import PhasesIndex from '@/pages/phases/index'; // Assuming this is the component to render inside the sidebar

interface PhasesManagementSidebarProps {
    olimpiada: Olimpiada | null;
    definiciones_evaluacion: DefinicionEvaluacion[];
    isOpen: boolean;
    onClose: () => void;
}

const PhasesManagementSidebar: React.FC<PhasesManagementSidebarProps> = ({
    olimpiada,
    definiciones_evaluacion,
    isOpen,
    onClose,
}) => {
    return (
        <div
            className={`fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">
                    {olimpiada ? `Fases de ${olimpiada.nombre}` : 'Gestión de Fases'}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <FaTimes className="h-4 w-4" />
                </Button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                {olimpiada ? (
                    <PhasesIndex
                        auth={{ user: null }} // Pass a dummy auth object, as it's not directly used in PhasesIndex when rendered inside sidebar
                        olimpiada={olimpiada}
                        definiciones_evaluacion={definiciones_evaluacion}
                    />
                ) : (
                    <p>Selecciona una olimpiada para gestionar sus fases.</p>
                )}
            </div>
        </div>
    );
};

export default PhasesManagementSidebar;
