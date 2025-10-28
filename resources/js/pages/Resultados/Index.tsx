import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps, Olimpiada, Resultado } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { Download, Mail, Eye, Award, CheckCircle2, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultadosToolbar } from './ResultadosToolbar';
import { ColumnDef } from '@tanstack/react-table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import axios from 'axios';
import { StatsCards } from './StatsCards';
import { ScoreDistributionChart } from './ScoreDistributionChart';

const RESULTS_PER_PAGE = 100;

// We define columns here as it's tightly coupled with this component's logic now
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
                    <h4 className="font-medium leading-none">{student.estudiante_nombre}</h4>
                    <p className="text-sm text-muted-foreground">{student.estudiante_email}</p>
                </div>
                <div className="text-sm">
                    <p><span className="font-semibold">Código:</span> {student.estudiante_codigo}</p>
                    <p><span className="font-semibold">Olimpiada:</span> {student.olimpiada_nombre}</p>
                    <p><span className="font-semibold">Fase:</span> {student.fase_nombre}</p>
                </div>
            </div>
        </PopoverContent>
    </Popover>
);

export const columns: ColumnDef<Resultado>[] = [
    {
        accessorKey: "estudiante_codigo",
        header: "Código Estudiante",
        cell: ({ row }) => <StudentInfoPopover student={row.original} />,
    },
    {
        accessorKey: "olimpiada_nombre",
        header: "Olimpiada",
    },
    {
        accessorKey: "fase_nombre",
        header: "Fase",
    },
    {
        accessorKey: "total_score",
        header: "Puntaje",
        cell: ({ row }) => `${row.original.total_score} / ${row.original.max_score}`,
    },
    {
        accessorKey: "aprobado",
        header: "Aprobado",
        cell: ({ row }) => (
            <div className="flex items-center">
                {row.original.aprobado ? <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" /> : <XCircle className="h-4 w-4 text-red-500 mr-1" />}
                {row.original.aprobado ? "Sí" : "No"}
            </div>
        ),
    },
    {
        accessorKey: "pasa_siguiente_fase",
        header: "Clasifica",
        cell: ({ row }) => (
            <div className={`flex items-center font-semibold ${row.original.pasa_siguiente_fase ? "text-green-600" : "text-red-600"}`}>
                {row.original.pasa_siguiente_fase ? <Award className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {row.original.pasa_siguiente_fase ? "Sí" : "No"}
            </div>
        ),
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
            <Button variant="outline" size="icon" onClick={() => router.get(route("evaluaciones.show", row.original.evaluacion_id))}>
                <Eye className="h-4 w-4" />
            </Button>
        ),
    },
];

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

    const fasesForDropdown = useMemo(() => {
        if (selectedOlimpiadaId === 'all') return [];
        const selectedOlimpiada = olimpiadas.find(o => o.id === Number(selectedOlimpiadaId));
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
            filtered = filtered.filter(r => r.olimpiada_id === Number(selectedOlimpiadaId));
        }
        if (selectedFaseId !== 'all') {
            filtered = filtered.filter(r => r.fase_id === Number(selectedFaseId));
        }
        return filtered;
    }, [results, selectedOlimpiadaId, selectedFaseId]);

    const classifiedResults = useMemo(() => {
        return filteredResults.filter(r => r.pasa_siguiente_fase);
    }, [filteredResults]);

    const stats = useMemo(() => {
        if (filteredResults.length === 0) {
            return { participantCount: 0, approvalRate: 0, averageScore: 0, classifiedCount: 0 };
        }

        const participantCount = filteredResults.length;
        const approvedCount = filteredResults.filter(r => r.aprobado).length;
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
        return fasesForDropdown.find(f => f.id === Number(selectedFaseId)) || null;
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

    const generateCodes = () => {
        if (!selectedFase) return;
        router.post(route('resultados.generatePermanentCodes'), { fase_id: selectedFase.id }, {
            onSuccess: () => toast.success('Petición para generar códigos enviada.'),
            onError: () => toast.error('Error al solicitar la generación de códigos.'),
        });
    };

    const getEmails = () => {
        if (!selectedFase) return;
        router.get(route('resultados.getEmailsForPassedStudents'), { fase_id: selectedFase.id }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const emails = page.props.jetstream.flash?.emails || page.props.emails;
                if (emails && emails.length > 0) {
                    copyToClipboard(emails.join(', '));
                    toast.success(`Se copiaron ${emails.length} correos al portapapeles.`)
                } else {
                    toast.info('No se encontraron correos para los estudiantes que pasan.');
                }
            },
            onError: () => toast.error('Error al obtener los correos.'),
        });
    };

    return (
        <AppLayout>
            <Head title="Resultados de Olimpiadas" />
            <div className="p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Resultados de Olimpiadas</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Resultados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 mb-6">
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
                                            maxScore={selectedFase.definicionEvaluacion.itemsDefinidos.reduce((acc, item) => acc + item.puntos_maximos, 0)}
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
                                    emptyStateMessage={results.length === 0 ? "Selecciona una fase para ver los resultados." : "No se encontraron resultados para los filtros seleccionados."}
                                />
                                {visibleResults.length < filteredResults.length && (
                                    <div className="text-center mt-4">
                                        <Button onClick={() => setVisibleCount(prev => prev + RESULTS_PER_PAGE)}>
                                            Ver más resultados
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="classified">
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    {selectedFase && (
                                        <>
                                            <div className="text-sm text-muted-foreground border rounded-md px-3 py-2">
                                                Cupos: <span className="font-bold text-primary">{selectedFase.cupos ?? 0}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={generateCodes}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Generar Códigos
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={getEmails}>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Obtener Correos
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <DataTable
                                    columns={columns}
                                    data={visibleResults}
                                    isLoading={isLoading}
                                    emptyStateMessage="No hay estudiantes clasificados para la fase seleccionada."
                                />
                                {visibleResults.length < classifiedResults.length && (
                                    <div className="text-center mt-4">
                                        <Button onClick={() => setVisibleCount(prev => prev + RESULTS_PER_PAGE)}>
                                            Ver más resultados
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;
