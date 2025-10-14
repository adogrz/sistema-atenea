import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DefinicionEvaluacion } from '@/types/olympics';
import { BreadcrumbItem } from '@/types';

interface DefinicionesEvaluacionIndexProps {
    definiciones: DefinicionEvaluacion[];
}

const Index: React.FC<DefinicionesEvaluacionIndexProps> = ({ definiciones }) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Olimpiadas', href: route('olimpiadas.index') }, // Placeholder route
        { title: 'Definiciones de Evaluación', href: route('definiciones-evaluacion.index') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Definiciones de Evaluación" />
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-6 mt-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Definiciones de Evaluación</h2>
                        <p className="text-muted-foreground">
                            Gestiona las plantillas de evaluación para las fases de las olimpiadas.
                        </p>
                    </div>
                    <Link href={route('definiciones-evaluacion.create')}>
                        <Button>Crear Nueva Definición</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Listado de Definiciones</CardTitle>
                        <CardDescription>Definiciones de evaluación existentes en el sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {definiciones.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Versión</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Bloqueada</TableHead>
                                        <TableHead>Ítems</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {definiciones.map((def) => (
                                        <TableRow key={def.id}>
                                            <TableCell className="font-medium">{def.nombre}</TableCell>
                                            <TableCell>{def.version}</TableCell>
                                            <TableCell>{def.descripcion}</TableCell>
                                            <TableCell>
                                                <Badge variant={def.estado === 'publicada' ? 'default' : (def.estado === 'borrador' ? 'secondary' : 'destructive')}>
                                                    {def.estado}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={def.bloqueada ? 'default' : 'outline'}>
                                                    {def.bloqueada ? 'Sí' : 'No'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{def.items_definidos?.length || 0}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('definiciones-evaluacion.edit', def.id)}>
                                                    <Button variant="outline" size="sm">Editar</Button>
                                                </Link>
                                                {/* TODO: Add Delete functionality */}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground">No hay definiciones de evaluación creadas aún.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;
