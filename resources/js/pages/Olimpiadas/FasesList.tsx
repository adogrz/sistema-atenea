import React, { useState, useEffect, useMemo } from 'react';
import { FaseOlimpiada } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// --- Subcomponente para cada fila de la fase ---
interface FaseItemProps {
    fase: FaseOlimpiada;
}

const FaseItem: React.FC<FaseItemProps> = ({ fase }) => {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
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
        try {
            // Manually parse the date string to avoid timezone issues.
            // new Date('2025-12-18') is parsed as UTC, which can lead to off-by-one-day errors.
            const [year, month, day] = dateString.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return format(date, 'PPP', { locale: es });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <li className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 border rounded-md space-y-3 md:space-y-0">
            <div className="flex flex-col gap-2 flex-1">
                <span className="font-medium">{fase.nombre}</span>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">Orden: {fase.orden}</Badge>
                    <Badge variant="outline">Inicio: {formatDate(fase.fecha_inicio)}</Badge>
                    <Badge variant="outline">Fin: {formatDate(fase.fecha_fin)}</Badge>
                    {fase.definicion_evaluacion_id ? (
                        <Badge variant="outline" className="border-green-600 bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Rúbrica Asignada
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="border-yellow-600 bg-yellow-50 text-yellow-700">
                            <XCircle className="mr-1 h-3 w-3" />
                            Sin Rúbrica
                        </Badge>
                    )}
                </div>
            </div>
            <form onSubmit={handleSubmit} className="flex items-end gap-2 w-full md:w-auto">
                <div className="flex-1 md:flex-auto">
                    <label htmlFor={`cupos-${fase.id}`} className="text-sm font-medium text-muted-foreground">Cupos</label>
                    <Input
                        id={`cupos-${fase.id}`}
                        type="number"
                        value={data.cupos}
                        onChange={(e) => setData('cupos', parseInt(e.target.value))}
                        className="w-full sm:w-24 mt-1"
                        min="0"
                        placeholder="Cupos"
                    />
                    {errors.cupos && <p className="text-xs text-red-500 mt-1">{errors.cupos}</p>}
                </div>
                <Button type="submit" disabled={processing} size="sm">
                    Actualizar
                </Button>
            </form>
        </li>
    );
};


// --- Componente Principal ---
interface FasesListProps {
    fases: FaseOlimpiada[];
    olimpiadaId: number;
}

export const FasesList: React.FC<FasesListProps> = ({ fases }) => {
    if (!fases || fases.length === 0) {
        return <p className="text-sm text-muted-foreground p-4">No hay fases para esta olimpiada.</p>;
    }

    const sortedFases = [...fases].sort((a, b) => a.orden - b.orden);

    const hasDateContinuityError = useMemo(() => {
        for (let i = 0; i < sortedFases.length - 1; i++) {
            const current = sortedFases[i];
            const next = sortedFases[i + 1];
            if (!current.fecha_fin || !next.fecha_inicio) {
                return false; // No hay error si faltan fechas
            }
            if (new Date(current.fecha_fin) > new Date(next.fecha_inicio)) {
                return true; // Hay error si una fecha de fin es posterior al inicio de la siguiente
            }
        }
        return false;
    }, [sortedFases]);

    return (
        <Card className="border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-lg">Fases de la Olimpiada</CardTitle>
                <CardDescription>
                    Detalles de las fases, incluyendo fechas, cupos y estado de la rúbrica.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {hasDateContinuityError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Advertencia de Continuidad</AlertTitle>
                        <AlertDescription>
                            Se ha detectado un solapamiento en las fechas de las fases. Por favor, revise que la fecha de fin de una fase no sea posterior a la fecha de inicio de la siguiente.
                        </AlertDescription>
                    </Alert>
                )}
                <ul className="space-y-3">
                    {sortedFases.map((fase) => (
                        <FaseItem key={fase.id} fase={fase} />
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
