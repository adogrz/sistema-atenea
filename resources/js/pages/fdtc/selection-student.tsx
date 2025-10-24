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
import { Input } from '@/components/ui/input';
import { DataTableMultiSelect } from '@/components/ui/data-table-multi-select';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { UserPlus, X, Download, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getInternadoColumns } from '@/components/selection-student-columns';
import { fi } from 'date-fns/locale';

interface Materia {
    id: number;
    nombre: string;
    nota: number;
}

export interface Estudiante {
    id: string;
    codigo: string;
    nombre: string;
    email: string;
    sede_name: string;
    sede_description?: string;
    promedio_general: number;
    materias: Materia[];
    status: string;
    en_internado: boolean;
    estado_internado?: string;
    fecha_ingreso?: string;
}

interface FlashMessages {
    success?: string;
    error?: string;
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
    const [selectedEstudiantesIds, setSelectedEstudiantesIds] = useState<string[]>([]);
    const [showAddConfirm, setShowAddConfirm] = useState(false);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedSedes, setSelectedSedes] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [notaFilters, setNotaFilters] = useState<Record<string, number[]>>({});
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar estudiantes por búsqueda
    const filteredEstudiantes = useMemo(() => {
        if (!searchTerm.trim()) return estudiantes;
        
        const search = searchTerm.toLowerCase();
        return estudiantes.filter((estudiante) => {
            return (
                estudiante.nombre.toLowerCase().includes(search) ||
                estudiante.codigo.toLowerCase().includes(search) ||
                estudiante.email.toLowerCase().includes(search)
            );
        });
    }, [estudiantes, searchTerm]);

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
            filteredEstudiantes,
            selectedSedes,
            setSelectedSedes,
            selectedStatus,
            setSelectedStatus,
            materiasUnicas,
            notaFilters,
            setNotaFilters,
        ),
    [filteredEstudiantes, selectedSedes, selectedStatus, materiasUnicas, notaFilters],
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

        const yaenInternado = selectedEstudiantesIds.filter((id) => {
            const estudiante = estudiantes.find((e) => e.id === id);
            return estudiante?.en_internado;
        });

        if (yaenInternado.length > 0) {
            toast.info(`${yaenInternado.length} estudiante(s) ya están en el internado`);
            return;
        }

        if (yaenInternado.length === selectedEstudiantesIds.length) {
            toast.error('Todos los estudiantes seleccionados ya están en el internado');
            return;
        }

        setShowAddConfirm(true);
    };

    const confirmarAgregar = () => {
        router.post(
            route('internado-fdtc.add'),
            { estudiantes_ids: selectedEstudiantesIds },
            {
                onSuccess: () => {
                    setShowAddConfirm(false);
                    setSelectedEstudiantesIds([]);
                }
            }
        )
    }

    const validosParaAgregar = useMemo(() => {
        return selectedEstudiantesIds.filter((id) => {
            const estudiante = estudiantes.find((e) => e.id === id);
            return !estudiante?.en_internado;
        }).length;
    }, [selectedEstudiantesIds, estudiantes]);

    const handleClearAllFilters = () => {
        setSelectedSedes([]);
        setSelectedStatus([]);
        setNotaFilters({});
        setColumnFilters([]);
        setSearchTerm('');
    };

    const handleExportSelected = () => {
        if (selectedEstudiantesIds.length === 0) {
            toast.error('Debe seleccionar al menos un estudiante');
            return;
        }
        router.get(route('internado-fdtc.export', { estudiantes_ids: selectedEstudiantesIds }));
    };

    // Actualizar las estadísticas basadas en estudiantes filtrados
    const enInternadoCount = filteredEstudiantes.filter((e) => e.en_internado).length;
    const selectedCount = selectedEstudiantesIds.length;
    const hasActiveFilters = 
        selectedSedes.length > 0 || 
        selectedStatus.length > 0 || 
        Object.keys(notaFilters).length > 0 ||
        searchTerm.trim() !== '';

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Selección de Estudiantes - Internado FDTC</h1>
                        <p className="text-muted-foreground">
                            Selecciona estudiantes para agregar al programa de internado
                        </p>
                    </div>
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
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
                        <div className="relative w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, código o correo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 text-base"
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 h-7 -translate-y-1/2"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleAddToInternado}
                            disabled={!canManageInternado || selectedCount === 0}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Agregar al Internado ({selectedCount})
                        </Button>

                        <div className='h-6 w-px bg-border'/>

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
                                onClick={handleClearAllFilters}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Limpiar Filtros
                            </Button>
                        )}
                    </div>

                    {/* Tabla de estudiantes */}
                    <div className='rounded-lg border bg-card'>
                        <DataTableMultiSelect
                            columns={columns}
                            data={filteredEstudiantes}
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
                                <AlertDialogTitle>¿Agregar estudiantes al internado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de agregar {validosParaAgregar} estudiante(s) al programa de
                                    internado FDTC.
                                    {selectedCount !== validosParaAgregar && (
                                        <span className="mt-2 block text-yellow-600">
                                            Nota: {selectedCount - validosParaAgregar} estudiante(s) ya está(n) registrado(s).
                                        </span>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarAgregar} disabled={validosParaAgregar === 0}>
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}