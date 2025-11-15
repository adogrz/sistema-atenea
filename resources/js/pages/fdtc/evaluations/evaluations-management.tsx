import { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, FileText, Calendar, Award, GraduationCap } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { InternadoEvaluacion, InternadoMateria } from '@/types/fdtc/internado';
import { NivelEducativo } from '@/types/admission/education';

interface Props {
    evaluaciones: InternadoEvaluacion[];
    materias: InternadoMateria[];
    niveles: NivelEducativo[];
    filtros?: {
        materia_id?: number | null;
        periodo_id?: number | null;
    };
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
    { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones' },
];

export default function EvaluationsList({ evaluaciones, materias, niveles, filtros }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedEvaluacion, setSelectedEvaluacion] = useState<InternadoEvaluacion | null>(null);
    const [materiaId, setMateriaId] = useState<string>(filtros?.materia_id ? String(filtros.materia_id) : '');

    type EvalWithMateria = InternadoEvaluacion & { materia_id?: number };

    const pesosPorMateria = useMemo(() => {
        const map = new Map<number, number>();
        for (const ev of evaluaciones as EvalWithMateria[]) {
            const mid = ev.materia_id ?? -1;
            const peso = Number(ev.peso_porcentual || 0);
            map.set(mid, (map.get(mid) || 0) + peso);
        }
        return map;
    }, [evaluaciones]);

    // Calcular estadísticas por nivel y materia
    const estadisticasPorNivel = useMemo(() => {
        const stats = new Map<number, { nivel: NivelEducativo; porMateria: Map<number, number> }>();
        
        niveles.forEach(nivel => {
            stats.set(nivel.codigo, {
                nivel,
                porMateria: new Map()
            });
        });

        evaluaciones.forEach(ev => {
            const nivelesEv = ev.niveles_aplicables || [];
            nivelesEv.forEach(nivelCodigo => {
                const stat = stats.get(nivelCodigo);
                if (stat && ev.materia_id) {
                    const current = stat.porMateria.get(ev.materia_id) || 0;
                    stat.porMateria.set(ev.materia_id, current + 1);
                }
            });
        });

        return stats;
    }, [evaluaciones, niveles]);

    const totalPesoMateriaSeleccionada = useMemo(() => {
        if (!materiaId) return 0;
        const mid = Number(materiaId);
        return pesosPorMateria.get(mid) || 0;
    }, [materiaId, pesosPorMateria]);

    const handleDelete = () => {
        if (!selectedEvaluacion) return;

        router.delete(route('internado-fdtc.evaluaciones.destroy', selectedEvaluacion.id), {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedEvaluacion(null);
                toast.success('Evaluación eliminada exitosamente');
            },
            onError: () => {
                toast.error('Error al eliminar la evaluación');
            },
        });
    };

    const openDeleteDialog = (evaluacion: InternadoEvaluacion) => {
        setSelectedEvaluacion(evaluacion);
        setShowDeleteDialog(true);
    };

    const handleMateriaChange = (value: string) => {
        setMateriaId(value);
        router.get(
            route('internado-fdtc.evaluaciones'),
            { materia_id: value || undefined },
            { preserveScroll: true, replace: true }
        );
    };

    const promedioGeneral = evaluaciones.length > 0
        ? evaluaciones.reduce((sum, ev) => sum + (Number(ev.promedio) || 0), 0) / evaluaciones.length
        : 0;

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Evaluaciones - Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Evaluaciones del Internado</h1>
                            <p className="text-muted-foreground">
                                Gestiona las evaluaciones y calificaciones del programa FDTC
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route('internado-fdtc.evaluaciones.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva Evaluación
                            </Link>
                        </Button>
                    </div>

                    {/* Filtros */}
                    <Card className="mb-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Filtros</CardTitle>
                            <CardDescription>Filtra las evaluaciones por materia</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-3 md:max-w-md">
                            <div>
                                <label className="mb-1 block text-sm">Materia</label>
                                <select
                                    value={materiaId}
                                    onChange={(e) => handleMateriaChange(e.target.value)}
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                >
                                    <option value="">Todas</option>
                                    {materias.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nombre} ({m.codigo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Estadísticas */}
                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{evaluaciones.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Niveles Activos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {Array.from(estadisticasPorNivel.entries()).filter(([_, stat]) => {
                                        const evaluacionesDelNivel = evaluaciones.filter(ev => 
                                            ev.niveles_aplicables?.includes(_)
                                        );
                                        return evaluacionesDelNivel.length > 0;
                                    }).length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">con evaluaciones</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {promedioGeneral.toFixed(1)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">de todas las evaluaciones</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumen por Nivel */}
                    {estadisticasPorNivel.size > 0 && (
                        <div className="mb-6 space-y-4">
                            <h2 className="text-xl font-semibold">Evaluaciones por Nivel Educativo</h2>
                            {Array.from(estadisticasPorNivel.entries()).map(([codigo, stat]) => {
                                const evaluacionesDelNivel = evaluaciones.filter(ev => 
                                    ev.niveles_aplicables?.includes(codigo)
                                );
                                
                                if (evaluacionesDelNivel.length === 0) return null;

                                return (
                                    <Card key={codigo}>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-5 w-5" />
                                                    <CardTitle>{stat.nivel.descripcion}</CardTitle>
                                                </div>
                                                <Badge variant="secondary">{evaluacionesDelNivel.length} evaluación(es)</Badge>
                                            </div>
                                            <CardDescription>
                                                <div className="space-y-1">
                                                    {Array.from(stat.porMateria.entries()).map(([materiaId, count]) => {
                                                        const materia = materias.find(m => m.id === materiaId);
                                                        if (!materia) return null;
                                                        
                                                        // Calcular peso total de esta materia en este nivel
                                                        const pesoTotal = evaluacionesDelNivel
                                                            .filter(ev => ev.materia_id === materiaId)
                                                            .reduce((sum, ev) => sum + Number(ev.peso_porcentual || 0), 0);
                                                        
                                                        const esCompleto = pesoTotal === 100;
                                                        const colorClase = esCompleto ? 'text-green-600' : pesoTotal > 0 ? 'text-yellow-600' : '';
                                                        
                                                        return (
                                                            <div key={materiaId} className="flex items-center gap-2">
                                                                <span>{materia.nombre}: {count} evaluación(es)</span>
                                                                <Badge variant={esCompleto ? 'secondary' : 'outline'} className={colorClase}>
                                                                    Peso: {pesoTotal.toFixed(1)}%
                                                                </Badge>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                                {evaluacionesDelNivel.map((evaluacion) => (
                                                    <Card key={evaluacion.id} className="border-muted">
                                                        <CardHeader>
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                                        {evaluacion.nombre}
                                                                        <Badge variant="secondary">{evaluacion.peso_porcentual}%</Badge>
                                                                        {evaluacion.permite_credito_extra && (
                                                                            <Badge variant="outline" className="gap-1">
                                                                                <Award className="h-3 w-3" />
                                                                                +{evaluacion.credito_extra_max}
                                                                            </Badge>
                                                                        )}
                                                                    </CardTitle>
                                                                    {evaluacion.materia && (
                                                                        <CardDescription className="mt-1">
                                                                            {evaluacion.materia} {evaluacion.materia_codigo ? `(${evaluacion.materia_codigo})` : ''}
                                                                        </CardDescription>
                                                                    )}
                                                                    {evaluacion.descripcion && (
                                                                        <CardDescription className="mt-1">
                                                                            {evaluacion.descripcion}
                                                                        </CardDescription>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button variant="ghost" size="icon" asChild>
                                                                        <Link href={route('internado-fdtc.evaluaciones.edit', evaluacion.id)}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(evaluacion)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            {(evaluacion.fecha_inicio || evaluacion.fecha_fin) && (
                                                                <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Calendar className="h-4 w-4" />
                                                                    <span>
                                                                        {evaluacion.fecha_inicio} - {evaluacion.fecha_fin}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="mb-4 grid grid-cols-3 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-muted-foreground">Calificados</p>
                                                                    <p className="font-semibold">
                                                                        {evaluacion.estudiantes_calificados} / {evaluacion.total_estudiantes}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Nota Máxima</p>
                                                                    <p className="font-semibold">{evaluacion.nota_maxima}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-muted-foreground">Promedio</p>
                                                                    <p className="font-semibold">{evaluacion.promedio.toFixed(1)}</p>
                                                                </div>
                                                            </div>
                                                            <Button asChild className="w-full" size="sm">
                                                                <Link href={route('internado-fdtc.evaluaciones.show', evaluacion.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Ver Calificaciones
                                                                </Link>
                                                            </Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Lista de Evaluaciones sin agrupar (cuando no hay filtro) */}
                    {evaluaciones.length === 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">No hay evaluaciones</h3>
                                <p className="mb-4 text-center text-muted-foreground">
                                    Crea tu primera evaluación para comenzar a calificar estudiantes
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dialog Eliminar */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará la evaluación "{selectedEvaluacion?.nombre}" y todas sus
                                    calificaciones asociadas. Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive">
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}