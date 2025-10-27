import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Olimpiada, FaseOlimpiada, Area, NivelEducativo } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Resultado {
    evaluacion_id: number;
    fase_id: number;
    fase_nombre: string;
    olimpiada_nombre: string;
    estudiante_id: number;
    estudiante_nombre: string;
    total_score: number;
    max_score: number;
    percentage_score: number;
    aprobado: boolean;
    nota_minima: number;
    pasa_siguiente_fase: boolean;
}

interface ResultadosIndexProps extends PageProps {
    olimpiadas: Olimpiada[];
    fases: FaseOlimpiada[];
    areas: Area[];
    nivelesEducativos: NivelEducativo[];
    selectedOlimpiadaId?: string;
    selectedFaseId?: string;
    resultados: Resultado[];
    selectedFaseCupos?: number;
}

const Index: React.FC<ResultadosIndexProps> = ({ olimpiadas, fases, selectedOlimpiadaId, selectedFaseId, resultados, selectedFaseCupos }) => {
    const [currentOlimpiadaId, setCurrentOlimpiadaId] = useState(selectedOlimpiadaId || 'all');
    const [currentFaseId, setCurrentFaseId] = useState(selectedFaseId || 'all');

    useEffect(() => {
        router.get(route('resultados.index'), { olimpiada_id: currentOlimpiadaId, fase_id: currentFaseId }, { preserveState: true, replace: true });
    }, [currentOlimpiadaId, currentFaseId]);

    const columns: ColumnDef<Resultado>[] = [
        {
            accessorKey: 'estudiante_nombre',
            header: 'Estudiante',
        },
        {
            accessorKey: 'olimpiada_nombre',
            header: 'Olimpiada',
        },
        {
            accessorKey: 'fase_nombre',
            header: 'Fase',
        },
        {
            accessorKey: 'total_score',
            header: 'Puntaje Obtenido',
            cell: ({ row }) => `${row.original.total_score} / ${row.original.max_score}`,
        },
        {
            accessorKey: 'percentage_score',
            header: '%',
            cell: ({ row }) => `${row.original.percentage_score}%`,
        },
        {
            accessorKey: 'aprobado',
            header: 'Aprobado',
            cell: ({ row }) => (
                <div className="flex items-center">
                    {row.original.aprobado ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    {row.original.aprobado ? 'Sí' : 'No'}
                </div>
            ),
        },
        {
            accessorKey: 'pasa_siguiente_fase',
            header: 'Pasa Siguiente Fase',
            cell: ({ row }) => (
                <div className="flex items-center">
                    {row.original.pasa_siguiente_fase ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    {row.original.pasa_siguiente_fase ? 'Sí' : 'No'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <Button variant="outline" size="icon" onClick={() => alert(`Consultar evaluación ${row.original.evaluacion_id}`)}>
                    <Eye className="h-4 w-4" />
                </Button>
            ),
        },
    ];

    return (
        <AppLayout>
            <Head title="Resultados de Olimpiadas" />
            <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold tracking-tight mb-6">Resultados de Olimpiadas</h1>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filtros de Resultados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="olimpiada-filter" className="block text-sm font-medium text-gray-700">Olimpiada</label>
                                <Select value={currentOlimpiadaId} onValueChange={setCurrentOlimpiadaId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una Olimpiada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las Olimpiadas</SelectItem>
                                        {olimpiadas.map(olimpiada => (
                                            <SelectItem key={olimpiada.id} value={String(olimpiada.id)}>{olimpiada.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="fase-filter" className="block text-sm font-medium text-gray-700">Fase</label>
                                <Select value={currentFaseId} onValueChange={setCurrentFaseId} disabled={currentOlimpiadaId === 'all'}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una Fase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas las Fases</SelectItem>
                                        {fases.map(fase => (
                                            <SelectItem key={fase.id} value={String(fase.id)}>{fase.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle>Listado de Resultados</CardTitle>
                        <div className="flex items-center space-x-2">
                            {currentFaseId !== 'all' && selectedFaseCupos !== undefined && (
                                <div className="text-sm text-muted-foreground">
                                    Cupos para siguiente fase: <span className="font-bold">{selectedFaseCupos}</span>
                                </div>
                            )}
                            {currentFaseId !== 'all' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.get(route('resultados.index'), { olimpiada_id: currentOlimpiadaId, fase_id: currentFaseId }, { preserveState: true, replace: true })}
                                >
                                    Generar Códigos Permanentes
                                </Button>
                            )}
                            {currentFaseId !== 'all' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        router.get(route('resultados.emailsPassed'), { olimpiada_id: currentOlimpiadaId, fase_id: currentFaseId }, {
                                            onSuccess: (page: any) => {
                                                const emails = page.props.emails;
                                                if (emails && emails.length > 0) {
                                                    alert('Correos de estudiantes que pasan:\n' + emails.join(', '));
                                                } else {
                                                    alert('No se encontraron correos para estudiantes que pasan.');
                                                }
                                            },
                                            onError: (errors: any) => {
                                                alert('Error al obtener los correos: ' + JSON.stringify(errors));
                                            },
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                >
                                    Obtener Correos de Aprobados
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} data={resultados} />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;
