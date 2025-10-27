import React from 'react';
import { FaseOlimpiada } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FasesListProps {
    fases: FaseOlimpiada[];
}

export const FasesList: React.FC<FasesListProps> = ({ fases }) => {
    if (!fases || fases.length === 0) {
        return <p className="text-sm text-muted-foreground">No hay fases para esta olimpiada.</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fases de la Olimpiada</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {fases.map(fase => (
                        <li key={fase.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                                <p className="font-semibold">{fase.nombre}</p>
                                <p className="text-sm text-muted-foreground">Orden: {fase.orden}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Inscripción: {fase.fecha_inicio ? new Date(fase.fecha_inicio).toLocaleDateString() : 'N/A'} - {fase.fecha_fin ? new Date(fase.fecha_fin).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};


