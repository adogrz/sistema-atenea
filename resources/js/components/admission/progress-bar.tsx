'use client';

import { Progress } from '@/components/ui/progress';

interface BarraProgresoProps {
    progress: number;
}

export default function BarraProgreso({ progress }: BarraProgresoProps) {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                <span>Progreso del formulario</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
        </div>
    );
}
