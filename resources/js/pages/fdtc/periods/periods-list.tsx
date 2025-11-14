import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { InternadoPeriodo } from '@/types/fdtc/internado';

interface Props {
    periodos: InternadoPeriodo[];
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
    { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos' },
];

export default function PeriodsList({ periodos }: Props) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedPeriodo, setSelectedPeriodo] = useState<InternadoPeriodo | null>(null);

    const { flash } = usePage().props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleDelete = () => {
        if (!selectedPeriodo) return;

        router.delete(route('internado-fdtc.periodos.destroy', selectedPeriodo.id), {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedPeriodo(null);
                toast.success('Periodo eliminado exitosamente');
            },
            onError: () => {
                toast.error('Error al eliminar el periodo');
            },
        });
    };

    const handleToggleActivo = (periodo: InternadoPeriodo) => {
        router.patch(route('internado-fdtc.periodos.toggle', periodo.id), {}, {
            preserveScroll: true,
        });
    };

    const openDeleteDialog = (periodo: InternadoPeriodo) => {
        setSelectedPeriodo(periodo);
        setShowDeleteDialog(true);
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Periodos - Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Periodos del Internado</h1>
                            <p className="text-muted-foreground">
                                Gestiona los periodos académicos para asistencia y conducta
                            </p>
                        </div>
                        <Button asChild>
                            <Link href={route('internado-fdtc.periodos.create')}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo Periodo
                            </Link>
                        </Button>
                    </div>

                    {/* Lista de Periodos */}
                    {periodos.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">No hay periodos</h3>
                                <p className="mb-4 text-center text-muted-foreground">
                                    Crea tu primer periodo para comenzar a registrar asistencia y conducta
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {periodos.map((periodo) => (
                                <Card key={periodo.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2">
                                                    {periodo.nombre}
                                                    {periodo.es_vigente && (
                                                        <Badge variant="default">Vigente</Badge>
                                                    )}
                                                    {periodo.activo ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </CardTitle>
                                                {periodo.descripcion && (
                                                    <CardDescription className="mt-1">
                                                        {periodo.descripcion}
                                                    </CardDescription>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                            >
                                                <Link href={route('internado-fdtc.periodos.edit', periodo.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteDialog(periodo)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Fecha inicio:</span>
                                                <span className="font-medium">{periodo.fecha_inicio}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Fecha fin:</span>
                                                <span className="font-medium">{periodo.fecha_fin}</span>
                                            </div>
                                            {periodo.total_asistencias !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Asistencias:</span>
                                                    <span className="font-medium">{periodo.total_asistencias}</span>
                                                </div>
                                            )}
                                            {periodo.total_conductas !== undefined && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Conductas:</span>
                                                    <span className="font-medium">{periodo.total_conductas}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between border-t pt-3">
                                                <span className="text-sm text-muted-foreground">Estado:</span>
                                                <Switch
                                                    checked={periodo.activo}
                                                    onCheckedChange={() => handleToggleActivo(periodo)}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Dialog Eliminar */}
                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar periodo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará el periodo "{selectedPeriodo?.nombre}" y todas sus
                                    asistencias y conductas asociadas. Esta acción no se puede deshacer.
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