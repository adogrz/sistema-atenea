import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import EvaluationShow from '@/pages/Evaluaciones/Show';
import { Evaluacion } from '@/types';

interface EvaluationModalContentProps {
    evaluationId: number;
}

const EvaluationModalContent: React.FC<EvaluationModalContentProps> = ({ evaluationId }) => {
    const [evaluation, setEvaluation] = useState<Evaluacion | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (evaluationId) {
            setIsLoading(true);
            axios.get(route('evaluaciones.show', evaluationId))
                .then(response => {
                    setEvaluation(response.data.evaluacion);
                })
                .catch(error => {
                    toast.error('Error al cargar la evaluación.');
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [evaluationId]);

    if (isLoading) {
        return <div className="text-center p-4">Cargando evaluación...</div>;
    }

    if (!evaluation) {
        return <div className="text-center p-4 text-red-500">No se pudo cargar la evaluación.</div>;
    }

    return <EvaluationShow evaluacion={evaluation} />;
};

export default EvaluationModalContent;
