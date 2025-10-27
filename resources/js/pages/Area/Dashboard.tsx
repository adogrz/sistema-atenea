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
import { CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PhaseStat {
    id: number;
    nombre: string;
    total_inscripciones: number;
    evaluaciones_completadas: number;
    progreso: number;
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
            participantes: phase.total_inscripciones,
            olimpiada: phase.olimpiada_nombre,
        }));
    }, [filteredPhases]);

    const pieData = useMemo(() => {
        const totalEvaluaciones = filteredPhases.reduce((acc, phase) => acc + phase.total_inscripciones, 0);
        const totalCompletadas = filteredPhases.reduce((acc, phase) => acc + phase.evaluaciones_completadas, 0);
        const totalPendientes = totalEvaluaciones - totalCompletadas;

        return [
            { name: 'Completadas', value: totalCompletadas, percentage: totalEvaluaciones > 0 ? (totalCompletadas / totalEvaluaciones) * 100 : 0 },
            { name: 'Pendientes', value: totalPendientes, percentage: totalEvaluaciones > 0 ? (totalPendientes / totalEvaluaciones) * 100 : 0 },
        ];
    }, [filteredPhases]);

    const publicarNotas = (phaseId: number) => {
        router.post(route('fases.gestion.publishResults', { fase: phaseId }), {}, {
            onSuccess: () => {
                toast.success('¡Notas publicadas exitosamente!');
            },
            onError: () => {
                toast.error('Error al publicar las notas. Inténtalo de nuevo.');
            },
            preserveScroll: true,
        });
    };

    const summaryStats = useMemo(() => {
        const totalOlimpiadas = olimpiadasWithStats.length;
        const totalFases = olimpiadasWithStats.reduce((acc, olimpiada) => acc + olimpiada.fases.length, 0);
        const totalInscripciones = olimpiadasWithStats.reduce((acc, olimpiada) =>
            acc + olimpiada.fases.reduce((phaseAcc, phase) => phaseAcc + phase.total_inscripciones, 0), 0);
        const totalEvaluacionesCompletadas = olimpiadasWithStats.reduce((acc, olimpiada) =>
            acc + olimpiada.fases.reduce((phaseAcc, phase) => phaseAcc + phase.evaluaciones_completadas, 0), 0);

        return {
            totalOlimpiadas,
            totalFases,
            totalInscripciones,
            totalEvaluacionesCompletadas,
        };
    }, [olimpiadasWithStats]);

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
                                {availableYears?.map(y => (
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Olimpiadas</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalOlimpiadas}</div>
                            <p className="text-xs text-muted-foreground">Olimpiadas gestionadas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fases</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalFases}</div>
                            <p className="text-xs text-muted-foreground">Fases en todas las olimpiadas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inscripciones</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalInscripciones}</div>
                            <p className="text-xs text-muted-foreground">Participantes registrados</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Evaluaciones Completadas</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M5 12.5L10 17.5L19 8.5" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summaryStats.totalEvaluacionesCompletadas}</div>
                            <p className="text-xs text-muted-foreground">Evaluaciones finalizadas</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Columna Principal - Lista de Fases */}
                    <div className="lg:col-span-2 space-y-6">
                        {filteredPhases.length > 0 ? (
                            filteredPhases.map(phase => (
                                <Card key={phase.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center space-x-2">
                                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                            <CardTitle className="text-lg font-semibold">{phase.nombre}</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-muted-foreground">Olimpiada: {phase.olimpiada_nombre}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium">Progreso de Calificación</span>
                                            <span className="text-sm font-bold">{phase.evaluaciones_completadas} / {phase.total_inscripciones}</span>
                                        </div>
                                        <Progress value={phase.progreso} className="mb-4" />

                                        {phase.resultados_publicados ? (
                                            <Badge variant="outline" className="flex items-center justify-center space-x-1 text-green-600 bg-green-50/50">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Notas publicadas</span>
                                            </Badge>
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
                                        <YAxis label={{ value: 'Participantes', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value, name, props) => [`${value} participantes`, props.payload.olimpiada]} />
                                        <Legend />
                                        <Bar dataKey="participantes" fill="#8884d8" name="Participantes" />
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
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, name]} />
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
