import EvaluationModalContent from '@/components/EvaluationModalContent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, Olimpiada, PageProps, Resultado } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import axios from 'axios';
import { Award, CheckCircle2, Eye, XCircle } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ResultadosToolbar } from './ResultadosToolbar';
import { ScoreDistributionChart } from './ScoreDistributionChart';
import { StatsCards } from './StatsCards';

const RESULTS_PER_PAGE = 100;

interface ResultadosIndexProps extends PageProps {
    olimpiadas: Olimpiada[];
}

const Index: React.FC<ResultadosIndexProps> = ({ olimpiadas }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<string>('all');
    const [selectedFaseId, setSelectedFaseId] = useState<string>('all');
    const [results, setResults] = useState<Resultado[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);

    const StudentInfoPopover: React.FC<{ student: Resultado }> = ({ student }) => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="link" className="h-auto p-0 font-mono">
                    {student.estudiante_codigo}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="leading-none font-medium">{student.estudiante_nombre}</h4>
                        <p className="text-sm text-muted-foreground">{student.estudiante_email}</p>
                    </div>
                    <div className="text-sm">
                        <p>
                            <span className="font-semibold">Código:</span> {student.estudiante_codigo}
                        </p>
                        <p>
                            <span className="font-semibold">Olimpiada:</span> {student.olimpiada_nombre}
                        </p>
                        <p>
                            <span className="font-semibold">Fase:</span> {student.fase_nombre}
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );

    const columns: ColumnDef<Resultado>[] = [
        {
            accessorKey: 'estudiante_codigo',
            header: 'Código Estudiante',
            cell: ({ row }) => <StudentInfoPopover student={row.original} />,
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
            header: 'Puntaje',
            cell: ({ row }) => `${row.original.total_score} / ${row.original.max_score}`,
        },
        {
            accessorKey: 'aprobado',
            header: 'Aprobado',
            cell: ({ row }) => (
                <div className="flex items-center">
                    {row.original.aprobado ? (
                        <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                    ) : (
                        <XCircle className="mr-1 h-4 w-4 text-red-500" />
                    )}
                    {row.original.aprobado ? 'Sí' : 'No'}
                </div>
            ),
        },
        {
            accessorKey: 'pasa_siguiente_fase',
            header: 'Clasifica',
            cell: ({ row }) => (
                <div className={`flex items-center font-semibold ${row.original.pasa_siguiente_fase ? 'text-green-600' : 'text-red-600'}`}>
                    {row.original.pasa_siguiente_fase ? <Award className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                    {row.original.pasa_siguiente_fase ? 'Sí' : 'No'}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            cell: ({ row }) => (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelectedEvaluationId(row.original.evaluacion_id);
                        setShowEvaluationModal(true);
                    }}
                >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Resultados
                </Button>
            ),
        },
    ];

    const fasesForDropdown = useMemo(() => {
        if (selectedOlimpiadaId === 'all') return [];
        const selectedOlimpiada = olimpiadas.find((o) => o.id === Number(selectedOlimpiadaId));
        return selectedOlimpiada?.fases || [];
    }, [selectedOlimpiadaId, olimpiadas]);

    const fetchResults = async (faseId: string) => {
        if (faseId === 'all') {
            setResults([]);
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.get(route('resultados.fase', faseId));
            setResults(response.data);
        } catch (error) {
            toast.error('Error al cargar los resultados.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredResults = useMemo(() => {
        let filtered = results;
        if (selectedOlimpiadaId !== 'all') {
            filtered = filtered.filter((r) => r.olimpiada_id === Number(selectedOlimpiadaId));
        }
        if (selectedFaseId !== 'all') {
            filtered = filtered.filter((r) => r.fase_id === Number(selectedFaseId));
        }
        return filtered;
    }, [results, selectedOlimpiadaId, selectedFaseId]);

    const classifiedResults = useMemo(() => {
        return filteredResults.filter((r) => r.pasa_siguiente_fase);
    }, [filteredResults]);

    const stats = useMemo(() => {
        if (filteredResults.length === 0) {
            return { participantCount: 0, approvalRate: 0, averageScore: 0, classifiedCount: 0 };
        }

        const participantCount = filteredResults.length;
        const approvedCount = filteredResults.filter((r) => r.aprobado).length;
        const approvalRate = (approvedCount / participantCount) * 100;
        const totalScoreSum = filteredResults.reduce((sum, r) => sum + r.total_score, 0);
        const averageScore = totalScoreSum / participantCount;
        const classifiedCount = classifiedResults.length;

        return {
            participantCount,
            approvalRate,
            averageScore,
            classifiedCount,
        };
    }, [filteredResults, classifiedResults]);

    const resultsToShow = activeTab === 'classified' ? classifiedResults : filteredResults;
    const visibleResults = resultsToShow.slice(0, visibleCount);

    const selectedFase = useMemo(() => {
        if (selectedFaseId === 'all' || fasesForDropdown.length === 0) return null;
        return fasesForDropdown.find((f) => f.id === Number(selectedFaseId)) || null;
    }, [selectedFaseId, fasesForDropdown]);

    const handleOlimpiadaChange = (value: string) => {
        setSelectedOlimpiadaId(value);
        setSelectedFaseId('all');
        setResults([]);
        setVisibleCount(RESULTS_PER_PAGE);
    };

    const handleFaseChange = (value: string) => {
        setSelectedFaseId(value);
        setVisibleCount(RESULTS_PER_PAGE);
        fetchResults(value);
    };

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inicio', href: route('dashboard') }, { title: 'Resultados' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Resultados de Olimpiadas" />
            <div className="space-y-6 p-4 md:p-6">
                <h1 className="text-2xl font-bold tracking-tight">Resultados de Olimpiadas</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Resultados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 space-y-4">
                            {isLoading && results.length === 0 ? (
                                <div className="text-center text-muted-foreground">Cargando datos...</div>
                            ) : (
                                <StatsCards {...stats} />
                            )}
                            {filteredResults.length > 0 && selectedFase?.definicionEvaluacion && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Distribución de Puntajes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScoreDistributionChart
                                            data={filteredResults}
                                            maxScore={selectedFase.definicionEvaluacion.itemsDefinidos.reduce(
                                                (acc, item) => acc + item.puntos_maximos,
                                                0,
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <ResultadosToolbar
                            olimpiadas={olimpiadas}
                            fases={fasesForDropdown}
                            selectedOlimpiadaId={selectedOlimpiadaId}
                            selectedFaseId={selectedFaseId}
                            onOlimpiadaChange={handleOlimpiadaChange}
                            onFaseChange={handleFaseChange}
                        />
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="all">Todos los Resultados ({filteredResults.length})</TabsTrigger>
                                <TabsTrigger value="classified">Estudiantes Clasificados ({classifiedResults.length})</TabsTrigger>
                            </TabsList>
                            <TabsContent value="all">
                                <DataTable
                                    columns={columns}
                                    data={visibleResults}
                                    isLoading={isLoading}
                                    emptyStateMessage={
                                        results.length === 0
                                            ? 'Selecciona una fase para ver los resultados.'
                                            : 'No se encontraron resultados para los filtros seleccionados.'
                                    }
                                />
                                {visibleResults.length < filteredResults.length && (
                                    <div className="mt-4 text-center">
                                        <Button onClick={() => setVisibleCount((prev) => prev + RESULTS_PER_PAGE)}>Ver más resultados</Button>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="classified">
                                <DataTable
                                    columns={columns}
                                    data={visibleResults}
                                    isLoading={isLoading}
                                    emptyStateMessage="No hay estudiantes clasificados para la fase seleccionada."
                                />
                                {visibleResults.length < classifiedResults.length && (
                                    <div className="mt-4 text-center">
                                        <Button onClick={() => setVisibleCount((prev) => prev + RESULTS_PER_PAGE)}>Ver más resultados</Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
                <DialogContent className="flex h-[90vh] max-w-4xl flex-col">
                    <DialogHeader>
                        <DialogTitle>Detalle de Evaluación</DialogTitle>
                        <DialogDescription>Resultados detallados de la evaluación seleccionada.</DialogDescription>
                    </DialogHeader>
                    <div className="-mx-4 -mb-4 flex-grow overflow-auto p-4">
                        {selectedEvaluationId && <EvaluationModalContent evaluationId={selectedEvaluationId} />}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Index;
