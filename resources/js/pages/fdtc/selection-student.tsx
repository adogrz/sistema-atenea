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
import { Button } from '@/components/ui/button';
import { DataTableMultiSelect } from '@/components/ui/data-table-multi-select';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { UserPlus, X, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getInternadoColumns } from '@/components/selection-student-columns';

interface Materia {
    id: number;
    nombre: string;
    nota: number;
}

interface Estudiante {
    id: number;
    nombre: string;
    email: string;
    sede_name: string;
    sede_description?: string;
    promedio_general: number;
    materias: Materia[];
    status: string;
    en_internado: boolean;
}

interface FlashMessages {
    success?: string;
    error?: string;
}

interface NotaFilter {
    min: number | null;
    max: number | null;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
];

export default function DashboardInternadoFDTC() {
    const { hasPermission } = usePermissions();
    const { estudiantes, flash } = usePage<{
        estudiantes: Array<Estudiante>;
        flash: FlashMessages;
    }>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success as string);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Verificación de permisos
    const canManageInternado = hasPermission('internado:manage');

    // Estados
    const [selectedEstudiantesIds, setSelectedEstudiantesIds] = useState<number[]>([]);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedSedes, setSelectedSedes] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [notaFilters, setNotaFilters] = useState<Record<string, number[]>>({});

    // Obtener lista única de materias
    const materiasUnicas = useMemo(() => {
        const materiasSet = new Set<string>();
        estudiantes.forEach((est) => {
            est.materias.forEach((mat) => materiasSet.add(mat.nombre));
        });
        return Array.from(materiasSet).sort();
    }, [estudiantes]);

    const columns = useMemo(
    () =>
        getInternadoColumns(
            estudiantes,
            selectedSedes,
            setSelectedSedes,
            selectedStatus,
            setSelectedStatus,
            materiasUnicas,
            notaFilters,
            setNotaFilters,
        ),
    [estudiantes, selectedSedes, selectedStatus, materiasUnicas, notaFilters],
);

    // Aplicar filtros automáticamente cuando cambien las selecciones
    useEffect(() => {
        const newFilters: ColumnFiltersState = [];
        
        if (selectedSedes.length > 0) {
            newFilters.push({ id: 'sede', value: selectedSedes });
        }
        
        if (selectedStatus.length > 0) {
            newFilters.push({ id: 'status', value: selectedStatus });
        }

        // Agregar filtros de notas
        Object.entries(notaFilters).forEach(([materia, notas]) => {
            if (notas.length > 0) {
                const columnId = materia === 'promedio_general' ? 'promedio_general' : `materia_${materia}`;
                newFilters.push({ id: columnId, value: notas });
            }
        });
        
        setColumnFilters(newFilters);
    }, [selectedSedes, selectedStatus, notaFilters]);

    const handleAddToInternado = () => {
        if (selectedEstudiantesIds.length === 0) {
            toast.error('Debe seleccionar al menos un estudiante');
            return;
        }

        router.post(
            route('internado-fdtc.add'),
            { estudiantes_ids: selectedEstudiantesIds },
            {
                onSuccess: () => {
                    setShowAddConfirm(false);
                    setSelectedEstudiantesIds([]);
                },
                onError: (errors) => {
                    console.error('Error al agregar:', errors);
                },
            },
        );
    };

    const handleRemoveFromInternado = () => {
        if (selectedEstudiantesIds.length === 0) {
            toast.error('Debe seleccionar al menos un estudiante');
            return;
        }

        router.post(
            route('internado-fdtc.remove'),
            { estudiantes_ids: selectedEstudiantesIds },
            {
                onSuccess: () => {
                    setShowRemoveConfirm(false);
                    setSelectedEstudiantesIds([]);
                },
                onError: (errors) => {
                    console.error('Error al remover:', errors);
                },
            },
        );
    };

    const handleClearAllFilters = () => {
        setSelectedSedes([]);
        setSelectedStatus([]);
        setNotaFilters({});
        setColumnFilters([]);
    };

    const handleExportSelected = () => {
        if (selectedEstudiantesIds.length === 0) {
            toast.error('Debe seleccionar al menos un estudiante');
            return;
        }
        router.get(route('internado-fdtc.export', { estudiantes_ids: selectedEstudiantesIds }));
    };

    const selectedCount = selectedEstudiantesIds.length;
    const enInternadoCount = estudiantes.filter((e) => e.en_internado).length;
    const hasActiveFilters = selectedSedes.length > 0 || selectedStatus.length > 0 || Object.keys(notaFilters).length > 0;

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Información general */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                            <p className="text-2xl font-bold">{estudiantes.length}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <p className="text-sm text-muted-foreground">En Internado</p>
                            <p className="text-2xl font-bold text-green-600">{enInternadoCount}</p>
                        </div>
                    </div>

                    {/* Barra de herramientas */}
                    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setShowAddConfirm(true)}
                            disabled={!canManageInternado || selectedCount === 0}
                        >
                            <UserPlus className="size-4" />
                            <span>Agregar al Internado ({selectedCount})</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-red-600 hover:text-red-600"
                            onClick={() => setShowRemoveConfirm(true)}
                            disabled={!canManageInternado || selectedCount === 0}
                        >
                            <X className="size-4" />
                            <span>Remover del Internado ({selectedCount})</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={handleExportSelected}
                            disabled={selectedCount === 0}
                        >
                            <Download className="size-4" />
                            <span>Exportar Seleccionados</span>
                        </Button>
                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center gap-2" 
                                onClick={handleClearAllFilters}
                            >
                                <X className="size-4" />
                                <span>Limpiar Filtros</span>
                            </Button>
                        )}
                    </div>

                    {/* Tabla de estudiantes */}
                    <div>
                        <DataTableMultiSelect
                            columns={columns}
                            data={estudiantes}
                            selectedRowIds={selectedEstudiantesIds}
                            onRowSelectionChange={setSelectedEstudiantesIds}
                            getRowId={(estudiante) => estudiante.id}
                            columnFilters={columnFilters}
                            setColumnFilters={setColumnFilters}
                        />
                    </div>

                    {/* Modal de confirmación para agregar */}
                    <AlertDialog open={showAddConfirm} onOpenChange={setShowAddConfirm}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Agregar estudiantes al Internado FDTC?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de agregar {selectedCount} estudiante(s) al programa de Internado FDTC.
                                    Esta acción se puede revertir posteriormente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAddToInternado}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Modal de confirmación para remover */}
                    <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Remover estudiantes del Internado FDTC?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de remover {selectedCount} estudiante(s) del programa de Internado FDTC.
                                    Esta acción se puede revertir posteriormente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleRemoveFromInternado}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Remover
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}