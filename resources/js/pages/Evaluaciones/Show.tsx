import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PageProps, Evaluacion } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EvaluacionShowProps extends PageProps {
    evaluacion: Evaluacion;
}

const Show: React.FC<EvaluacionShowProps> = ({ evaluacion }) => {
    const totalScore = evaluacion.items_evaluados.reduce((acc, item) => acc + (item.puntaje || 0), 0);
    const maxScore = evaluacion.items_evaluados.reduce((acc, item) => acc + (item.item_definido.puntos_maximos || 0), 0);
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const estudiante = evaluacion.inscripcion.estudiante;
    const notaMinimaAprobacion = evaluacion.faseOlimpiada.nota_minima_aprobacion || 0;
    const aprobado = totalScore >= notaMinimaAprobacion;

    return (
        <AppLayout>
            <Head title={`Evaluación de ${estudiante.nombre_completo}`} />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Detalle de Evaluación</h1>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" onClick={() => window.history.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Button>
                        <Badge variant="secondary">{evaluacion.faseOlimpiada.olimpiada.nombre}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                                <p className="font-semibold">{estudiante.nombre_completo}</p>
                                <p className="text-sm text-muted-foreground">Código: {estudiante.codigo}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fase</p>
                                <p className="font-semibold">{evaluacion.faseOlimpiada.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Fecha de Finalización</p>
                                <p className="font-semibold">{evaluacion.finalizada_at ? new Date(evaluacion.finalizada_at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                                <p className="font-semibold">{evaluacion.estado}</p>
                            </div>
                            {evaluacion.observaciones_generales && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Observaciones Generales</p>
                                    <p className="text-sm text-muted-foreground">{evaluacion.observaciones_generales}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

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
                                    {evaluacion.items_evaluados.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <p className="font-medium">{item.item_definido.nombre}</p>
                                                {item.observacion && (
                                                    <p className="text-sm text-muted-foreground mt-1">Observación: {item.observacion}</p>
                                                )}
                                            </TableCell>
                                            <TableCell>{item.calificador?.name || 'N/A'}</TableCell>
                                            <TableCell className="text-right font-mono">{item.puntaje} / {item.item_definido.puntos_maximos}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
