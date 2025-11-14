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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableMultiSelect } from '@/components/ui/data-table-multi-select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { CheckCircle, ChevronDown, UserPlus, XCircle, Filter, Trash2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { getParticipantColumns, type Participante } from '@/components/participant-management-columns';

interface FlashMessages {
    success?: string;
    error?: string;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc/seleccion' },
    { title: 'Participantes', href: '/dashboard/internado-fdtc/participantes' },
];

export default function ParticipantsList() {
    const { hasPermission } = usePermissions();
    const { participantes, flash } = usePage<{
        participantes: Participante[];
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

    const canManage = hasPermission('internado:manage');

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showEstadoDialog, setShowEstadoDialog] = useState(false);
    const [showRemoverDialog, setShowRemoverDialog] = useState(false);
    const [nuevoEstado, setNuevoEstado] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [selectedEstados, setSelectedEstados] = useState<string[]>([]);
    const [selectedNiveles, setSelectedNiveles] = useState<string[]>([]);
    const nivelesEducativos = useMemo(() => {
        const niveles = new Set(participantes.map(p => p.nivel_educativo));
        return Array.from(niveles).sort();
    }, [participantes]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCentro, setSearchCentro] = useState('');

    // Filtrar participantes por búsqueda
    const filteredParticipantes = useMemo(() => {
        let filtered = participantes;

        // Filtrar por nombre/código/email
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter((p) => {
                return (
                    p.nombre.toLowerCase().includes(search) ||
                    p.codigo.toLowerCase().includes(search) ||
                    p.email.toLowerCase().includes(search)
                );
            });
        }

        // Filtrar por centro educativo
        if (searchCentro.trim()) {
            const searchCentroLower = searchCentro.toLowerCase();
            filtered = filtered.filter((p) => {
                return p.centro_educativo.toLowerCase().includes(searchCentroLower);
            });
        }

        return filtered;
    }, [participantes, searchTerm, searchCentro]);

    const columns = useMemo(() => getParticipantColumns(), []);

    useEffect(() => {
        const newFilters: ColumnFiltersState = [];

        if (selectedEstados.length > 0) {
            newFilters.push({ id: 'estado', value: selectedEstados });
        }
        if (selectedNiveles.length > 0) {
            newFilters.push({ id: 'nivel_educativo', value: selectedNiveles });
        }

        setColumnFilters(newFilters);
    }, [selectedEstados, selectedNiveles]);

    const handleCambiarEstado = (estado: string) => {
        setNuevoEstado(estado);
        setShowEstadoDialog(true);
    };

    const handleRemoverDelInternado = () => {
        if (selectedIds.length === 0) {
            toast.error('Debe seleccionar al menos un participante');
            return;
        }
        setShowRemoverDialog(true);
    };

    const confirmarCambioEstado = () => {
        router.post(
            route('internado-fdtc.participantes.cambiar-estado'),
            {
                participantes_ids: selectedIds,
                nuevo_estado: nuevoEstado,
            },
            {
                onSuccess: () => {
                    setShowEstadoDialog(false);
                    setSelectedIds([]);
                },
            },
        );
    };

    const confirmarRemover = () => {
        router.post(
            route('internado-fdtc.participantes.remover'),
            {
                participantes_ids: selectedIds,
            },
            {
                onSuccess: () => {
                    setShowRemoverDialog(false);
                    setSelectedIds([]);
                }
            },
        );
    }

    const handleLimpiarFiltros = () => {
        setSelectedEstados([]);
        setSelectedNiveles([]);
        setSearchTerm('');
        setSearchCentro('');
    }

    const activosCount = participantes.filter((p) => p.estado === 'activo').length;
    const inactivosCount = participantes.filter((p) => p.estado === 'inactivo').length;
    const completadosCount = participantes.filter((p) => p.estado === 'completado').length;
    const suspendidosCount = participantes.filter((p) => p.estado === 'suspendido').length;

    const selectedCount = selectedIds.length;
    const hasActiveFilters = 
        selectedEstados.length > 0 || 
        selectedNiveles.length > 0 || 
        searchTerm.trim() !== '' ||
        searchCentro.trim() !== '';

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Participantes - Internado FDTC" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Participantes del Internado</h1>
                            <p className="text-muted-foreground">Gestiona los estudiantes del programa FDTC</p>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Total Participantes</p>
                            <p className="mt-2 text-3xl font-bold">{participantes.length}</p>
                        </div>

                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Activos</p>
                            <p className="mt-2 text-3xl font-bold text-green-600">{activosCount}</p>
                        </div>

                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
                            <p className="mt-2 text-3xl font-bold text-gray-700">{inactivosCount}</p>
                        </div>

                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Completados</p>
                            <p className="mt-2 text-3xl font-bold text-blue-600">{completadosCount}</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4 shadow-sm">
                            <p className="text-sm font-medium text-muted-foreground">Suspendidos</p>
                            <p className="mt-2 text-3xl font-bold text-red-600">{suspendidosCount}</p>
                        </div>
                    </div>

                    {/* Barra de herramientas */}
                    {canManage && (
                        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" disabled={selectedCount === 0}>
                                        Cambiar Estado ({selectedCount})
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleCambiarEstado('activo')}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                        Marcar como Activo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCambiarEstado('inactivo')}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-gray-700" />
                                        Marcar como Inactivo
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCambiarEstado('completado')}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-blue-600" />
                                        Marcar como Completado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleCambiarEstado('suspendido')}>
                                        <XCircle className="mr-2 h-4 w-4 text-yellow-600" />
                                        Suspender
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleRemoverDelInternado}
                                disabled={selectedCount === 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover del Internado ({selectedCount})
                            </Button>

                            <div className="h-6 w-px bg-border" />

                            <div className="relative w-80">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre, código o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                                {searchTerm && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 h-7 -translate-y-1/2"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={selectedEstados.length > 0 ? 'default' : 'outline'} size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Estado Internado
                                        {selectedEstados.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedEstados.length}
                                            </Badge>
                                        )}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSelectedEstados([])}>
                                        Todos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedEstados(['activo'])}>
                                        Solo Activos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedEstados(['inactivo'])}>
                                        Solo Inactivos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedEstados(['completado'])}>
                                        Solo Completados
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSelectedEstados(['suspendido'])}>
                                        Solo Suspendidos
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={selectedNiveles.length > 0 ? 'default' : 'outline'} size="sm">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Nivel Educativo
                                        {selectedNiveles.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {selectedNiveles.length}
                                            </Badge>
                                        )}
                                        <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setSelectedNiveles([])}>
                                        Todos los niveles
                                    </DropdownMenuItem>
                                    {nivelesEducativos.map((nivel) => (
                                        <DropdownMenuItem key={nivel} onClick={() => setSelectedNiveles([nivel])}>
                                            {nivel}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={handleLimpiarFiltros}>
                                    Limpiar filtros
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Tabla */}
                    {participantes.length === 0 ? (
                        <div className="rounded-lg border bg-card p-12 text-center">
                            <UserPlus className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No hay participantes registrados</h3>
                            <p className="mb-4 text-muted-foreground">
                                Ve a la vista de selección para agregar estudiantes al internado FDTC.
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border bg-card">
                            <DataTableMultiSelect
                                columns={columns}
                                data={filteredParticipantes}
                                selectedRowIds={selectedIds}
                                onRowSelectionChange={setSelectedIds}
                                getRowId={(participante) => participante.id}
                                columnFilters={columnFilters}
                                setColumnFilters={setColumnFilters}
                            />
                        </div>
                    )}

                    {/* Modal cambiar estado */}
                    <AlertDialog open={showEstadoDialog} onOpenChange={setShowEstadoDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Cambiar estado de participantes?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de cambiar el estado de {selectedCount} participante(s) a:{' '}
                                    <strong className="capitalize">{nuevoEstado}</strong>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarCambioEstado}>Confirmar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Modal remover del internado */}
                    <AlertDialog open={showRemoverDialog} onOpenChange={setShowRemoverDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Remover participantes del internado?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Está a punto de remover permanentemente {selectedCount} participante(s) del
                                    programa. Si desea agregarlos nuevamente, deberá hacerlo desde la vista de
                                    selección.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarRemover} className="bg-destructive">
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