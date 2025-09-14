import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DashboardCalificador = ({ evaluaciones }) => {
    return (
        <AppLayout>
            <Head title="Dashboard del Calificador" />
            <div className="p-4 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Evaluaciones Pendientes</CardTitle>
                        <CardDescription>
                            Aquí se listan las evaluaciones de los estudiantes que tienes asignadas para calificar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Estudiante</TableHead>
                                    <TableHead>Olimpiada</TableHead>
                                    <TableHead>Fase</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {evaluaciones.length > 0 ? (
                                    evaluaciones.map(evaluacion => (
                                        <TableRow key={evaluacion.id}>
                                            <TableCell className="font-medium">{evaluacion.inscripcion.estudiante.nombre_completo}</TableCell>
                                            <TableCell>{evaluacion.fase_olimpiada.olimpiada.nombre}</TableCell>
                                            <TableCell>{evaluacion.fase_olimpiada.nombre}</TableCell>
                                            <TableCell>
                                                <Badge variant={evaluacion.status_text === 'Finalizada' ? 'default' : 'secondary'}>
                                                    {evaluacion.status_text}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('dashboard.calificaciones.olimpiadas.edit', { evaluacion: evaluacion.id })}>
                                                    <Button variant="outline">Calificar</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">
                                            No tienes evaluaciones pendientes asignadas.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default DashboardCalificador;