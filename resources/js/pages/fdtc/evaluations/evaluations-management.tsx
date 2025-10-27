import { useState } from 'react';
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
import { Plus, Edit, Trash2, Eye, FileText, Calendar, Award } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { InternadoEvaluacion } from '@/types/fdtc/internado';

interface Props {
    evaluaciones: InternadoEvaluacion[];
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
    { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones' },
];

export default function EvaluationsList({ evaluaciones }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedEvaluacion, setSelectedEvaluacion] = useState<InternadoEvaluacion | null>(null);

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

    const totalPeso = evaluaciones.reduce((sum, ev) => sum + (Number(ev.peso_porcentual) || 0), 0);
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
                                <CardTitle className="text-sm font-medium">Peso Total</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl font-bold">{totalPeso.toFixed(1)}%</div>
                                    {totalPeso !== 100 && totalPeso > 0 && (
                                        <Badge variant="outline" className="text-yellow-600">
                                            No suma 100%
                                        </Badge>
                                    )}
                                </div>
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
                            </CardContent>
                        </Card>
                    </div>

                    {/* Lista de Evaluaciones */}
                    {evaluaciones.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">No hay evaluaciones</h3>
                                <p className="mb-4 text-center text-muted-foreground">
                                    Crea tu primera evaluación para comenzar a calificar estudiantes
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {evaluaciones.map((evaluacion) => (
                                <Card key={evaluacion.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    {evaluacion.nombre}
                                                    <Badge variant="secondary">{evaluacion.peso_porcentual}%</Badge>
                                                    {evaluacion.permite_credito_extra && (
                                                        <Badge variant="outline" className="gap-1">
                                                            <Award className="h-3 w-3" />
                                                            +{evaluacion.credito_extra_max}
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                {evaluacion.descripcion && (
                                                    <CardDescription className="mt-1">
                                                        {evaluacion.descripcion}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                >
                                                    <Link href={route('internado-fdtc.evaluaciones.edit', evaluacion.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(evaluacion)}
                                                >
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
                                                    {evaluacion.estudiantes_calificados} /{' '}
                                                    {evaluacion.total_estudiantes}
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
                                        <Button asChild className="w-full">
                                            <Link
                                                href={route('internado-fdtc.evaluaciones', evaluacion.id)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver Calificaciones
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
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