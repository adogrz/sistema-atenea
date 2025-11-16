import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps, Evaluacion, ItemEvaluado } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvaluacionShowProps {
    evaluacion: Evaluacion;
}

const Show: React.FC<EvaluacionShowProps> = ({ evaluacion }) => {
    // Verificar que evaluacion existe
    if (!evaluacion) {
        return (
            <AppLayout>
                <Head title="Error" />
                <div className="p-4 md:p-6">
                    <div className="text-center text-red-500">
                        <p className="text-xl font-semibold">No se pudo cargar la evaluación.</p>
                        <p className="text-sm mt-2">La evaluación no existe o no tienes permisos para verla.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // Destructure for easier access and provide default values
    const { estudiante, faseOlimpiada, observaciones_generales, finalizada_at, estado, items_evaluados } = evaluacion;

    // Calculate scores
    const totalScore = items_evaluados?.reduce((acc, item) => acc + (item.puntaje || 0), 0) || 0;
    const maxScore = items_evaluados?.reduce((acc, item) => acc + (item.item_definido?.puntos_maximos || 0), 0) || 0;
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Safely access nota_minima_aprobacion
    const notaMinimaAprobacion = faseOlimpiada?.nota_minima_aprobacion ?? 0;
    const aprobado = totalScore >= notaMinimaAprobacion;

    return (
        <>
            <Head title={`Evaluación de ${estudiante?.nombre_completo || 'Estudiante'}`} />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Detalle de Evaluación</h1>
                    <Badge variant="secondary">{faseOlimpiada?.olimpiada?.nombre || 'Olimpiada Desconocida'}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* General Information Card */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                                <p className="font-semibold">{estudiante?.nombre_completo || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Código: {estudiante?.codigo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fase</p>
                                <p className="font-semibold">{faseOlimpiada?.nombre || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de Finalización</p>
                                <p className="font-semibold">{finalizada_at ? new Date(finalizada_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado de Evaluación</p>
                                <p className="font-semibold">{estado || 'N/A'}</p>
                            </div>
                            {observaciones_generales && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Observaciones Generales</p>
                                    <p className="text-sm text-muted-foreground">{observaciones_generales}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Resultados</CardTitle>
                            <CardDescription>
                                <div className="flex items-center justify-between">
                                    <span>Puntaje Total: <span className="font-bold text-primary">{totalScore}</span> / {maxScore}</span>
                                    <span>Porcentaje: <span className="font-bold text-primary">{percentageScore.toFixed(2)}%</span></span>
                                </div>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center">
                                <span className="mr-2">Estado:</span>
                                {aprobado ? (
                                    <Badge className="bg-green-500 hover:bg-green-600">
                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Aprobado
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-500 hover:bg-red-600">
                                        <XCircle className="h-4 w-4 mr-1" /> Reprobado
                                    </Badge>
                                )}
                                {notaMinimaAprobacion > 0 && (
                                    <span className="ml-4 text-sm text-muted-foreground">Nota Mínima: {notaMinimaAprobacion}</span>
                                )}
                            </div>
                            <Progress value={percentageScore} className="mt-2" />
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ítem Evaluado</TableHead>
                                        <TableHead>Calificador</TableHead>
                                        <TableHead className="text-right">Puntaje</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items_evaluados && items_evaluados.length > 0 ? (items_evaluados.map((item: ItemEvaluado) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <p className="font-medium">{item.item_definido?.nombre || 'N/A'}</p>
                                                {item.observacion && (
                                                    <p className="text-sm text-muted-foreground mt-1">Observación: {item.observacion}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.calificador?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-mono">{item.puntaje ?? 'N/A'} / {item.item_definido?.puntos_maximos ?? 'N/A'}</TableCell>
                                        </TableRow>
                                    ))) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                                                No hay ítems evaluados para mostrar.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default Show;