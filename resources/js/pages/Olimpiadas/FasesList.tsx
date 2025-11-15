import React, { useState, useEffect, useMemo } from 'react';
import { FaseOlimpiada } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// --- Subcomponente para cada fila de la fase ---
interface FaseItemProps {
    fase: FaseOlimpiada;
}

const FaseItem: React.FC<FaseItemProps> = ({ fase }) => {
    const { data, setData, patch, processing, errors, wasSuccessful, recentlySuccessful } = useForm({
        cupos: fase.cupos ?? 0,
    });

    useEffect(() => {
        if (recentlySuccessful) {
            toast.success('Fase actualizada.');
        }
    }, [recentlySuccessful]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('fases.updateDetails', fase.id), {
            preserveScroll: true,
            onError: () => {
                toast.error('Error al actualizar la fase.');
            }
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString();
    };

    return (
        <li className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-md space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-medium">{fase.nombre}</h3>
                <Badge variant="secondary">Orden: {fase.orden}</Badge>
                <Badge variant="outline">Inicio: {formatDate(fase.fecha_inicio)}</Badge>
                <Badge variant="outline">Fin: {formatDate(fase.fecha_fin)}</Badge>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="w-full sm:w-auto">
                    <label htmlFor={`cupos-${fase.id}`} className="text-sm font-medium sr-only">Cupos</label>
                    <Input
                        id={`cupos-${fase.id}`}
                        type="number"
                        value={data.cupos}
                        onChange={(e) => setData('cupos', parseInt(e.target.value))}
                        className="w-full sm:w-24"
                        min="0"
                        placeholder="Cupos"
                    />
                    {errors.cupos && <p className="text-xs text-red-500 mt-1">{errors.cupos}</p>}
                </div>
                <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                    Actualizar
                </Button>
            </form>
        </li>
    );
};


// --- Componente Principal ---
interface FasesListProps {
    fases: FaseOlimpiada[];
}

export const FasesList: React.FC<FasesListProps> = ({ fases }) => {
    if (!fases || fases.length === 0) {
        return <p className="text-sm text-muted-foreground">No hay fases para esta olimpiada.</p>;
    }

    const sortedFases = [...fases].sort((a, b) => a.orden - b.orden);

    const hasDateContinuityError = useMemo(() => {
        for (let i = 0; i < sortedFases.length - 1; i++) {
            const current = sortedFases[i];
            const next = sortedFases[i + 1];
            if (!current.fecha_fin || !next.fecha_inicio) {
                return true; // Error if dates are missing
            }
            if (new Date(current.fecha_fin) > new Date(next.fecha_inicio)) {
                return true; // Error if dates overlap
            }
        }
        return false;
    }, [sortedFases]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fases de la Olimpiada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasDateContinuityError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Advertencia</AlertTitle>
                        <AlertDescription>
                            Se ha detectado un problema de continuidad en las fechas de las fases. Por favor, revise que las fechas de fin no se solapen con las fechas de inicio de las fases siguientes.
                        </AlertDescription>
                    </Alert>
                )}
                <ul className="space-y-4">
                    {sortedFases.map((fase) => (
                        <FaseItem key={fase.id} fase={fase} />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
