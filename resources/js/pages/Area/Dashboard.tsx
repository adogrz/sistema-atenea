import React, { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PhaseStat {
    id: number;
    nombre: string;
    total_inscripciones: number;
    evaluaciones_completadas: number;
    progreso: number;
    resultados_publicados: boolean;
}

interface OlimpiadaWithStats {
    id: number;
    nombre: string;
    year: number;
    fases: PhaseStat[];
}

interface AreaDashboardProps extends PageProps {
    olimpiadasWithStats: OlimpiadaWithStats[];
    availableYears: number[];
}

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const AreaDashboard: React.FC<AreaDashboardProps> = ({ olimpiadasWithStats, availableYears }) => {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedOlimpiadaId, setSelectedOlimpiadaId] = useState<string>('all');

    const filteredOlimpiadas = useMemo(() => {
        if (selectedYear === 'all') {
            return olimpiadasWithStats;
        }
        return olimpiadasWithStats.filter(o => o.year === parseInt(selectedYear));
    }, [selectedYear, olimpiadasWithStats]);

    const filteredPhases = useMemo(() => {
        let phases = filteredOlimpiadas.flatMap(o => o.fases.map(f => ({ ...f, olimpiada_nombre: o.nombre })));

        if (selectedOlimpiadaId !== 'all') {
            const numericOlimpiadaId = parseInt(selectedOlimpiadaId);
            phases = phases.filter(p => {
                const parentOlimpiada = filteredOlimpiadas.find(o => o.fases.some(f => f.id === p.id));
                return parentOlimpiada?.id === numericOlimpiadaId;
            });
        }
        return phases;
    }, [selectedOlimpiadaId, filteredOlimpiadas]);

    const chartData = useMemo(() => {
        return filteredPhases.map(phase => ({
            name: phase.nombre,
            uv: phase.total_inscripciones,
        }));
    }, [filteredPhases]);

    const pieData = useMemo(() => {
        const totalEvaluaciones = filteredPhases.reduce((acc, phase) => acc + phase.total_inscripciones, 0);
        const totalCompletadas = filteredPhases.reduce((acc, phase) => acc + phase.evaluaciones_completadas, 0);
        return [
            { name: 'Completadas', value: totalCompletadas },
            { name: 'Pendientes', value: totalEvaluaciones - totalCompletadas },
        ];
    }, [filteredPhases]);

    const publicarNotas = (phaseId: number) => {
        router.post(`/fases/${phaseId}/publish-results`, {}, {
            onSuccess: () => {
                toast.success('¡Notas publicadas exitosamente!');
            },
            onError: () => {
                toast.error('Error al publicar las notas. Inténtalo de nuevo.');
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard de Área" />
            <div className="p-4 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Resumen del Área</h2>
                    <div className="flex items-center space-x-2">
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filtrar por año..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Años</SelectItem>
                                {availableYears.map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedOlimpiadaId} onValueChange={setSelectedOlimpiadaId}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Filtrar por olimpiada..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Olimpiadas</SelectItem>
                                {filteredOlimpiadas.map(o => (
                                    <SelectItem key={o.id} value={String(o.id)}>{o.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Principal - Lista de Fases */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredPhases.length > 0 ? (
                            filteredPhases.map(phase => (
                                <Card key={phase.id}>
                                    <CardHeader>
                                        <CardTitle>{phase.nombre}</CardTitle>
                                        <CardDescription>Olimpiada: {phase.olimpiada_nombre}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Progreso de Calificación</span>
                                            <span className="text-sm font-bold">{phase.evaluaciones_completadas} / {phase.total_inscripciones}</span>
                                        </div>
                                        <Progress value={phase.progreso} className="mb-4" />

                                        {phase.resultados_publicados ? (
                                            <p className="text-sm font-semibold text-green-600 text-center">Notas publicadas</p>
                                        ) : (
                                            <Button
                                                onClick={() => publicarNotas(phase.id)}
                                                disabled={phase.progreso < 100 || phase.total_inscripciones === 0}
                                                className="w-full"
                                            >
                                                Publicar Notas
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Card className="flex items-center justify-center h-64">
                                <CardContent className="text-center">
                                    <p className="text-muted-foreground">No hay fases para los filtros seleccionados.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Columna Lateral - Gráficos */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="text-xl font-semibold">Estadísticas Clave</h3>
                        <Card>
                            <CardHeader>
                                <CardTitle>Inscripciones por Fase</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="uv" fill="#8884d8" name="Participantes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estado General de Evaluaciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AreaDashboard;
