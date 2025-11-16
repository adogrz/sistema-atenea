import React, { useState, useMemo, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { FaseOlimpiada } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { PencilIcon, Trash2Icon, GripVertical, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/use-permissions';

// Helper para formatear fechas correctamente (evita problemas de zona horaria)
const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper para parsear fechas en formato 'yyyy-MM-dd' sin problemas de zona horaria
const parseDateString = (dateString: string): Date => {
    // Si la fecha tiene formato 'yyyy-MM-dd', parsear localmente
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    // Si tiene otro formato (con hora), usar new Date() normal
    return new Date(dateString);
};

// Helper seguro para formatear fecha para mostrar
const formatDateForDisplay = (dateString: string | null | undefined): string | React.ReactElement => {
    if (!dateString) return <span className="text-muted-foreground">Seleccionar fecha</span>;
    try {
        const date = parseDateString(dateString);
        if (isNaN(date.getTime())) throw new Error('Invalid date');
        return format(date, "PPP", { locale: es });
    } catch (e) {
        return <span className="text-muted-foreground">Fecha inválida</span>;
    }
};

// Helper seguro para parsear fecha para el Calendar
const parseDateForCalendar = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    try {
        const date = parseDateString(dateString);
        if (isNaN(date.getTime())) return undefined;
        return date;
    } catch (e) {
        return undefined;
    }
};

interface FasesPanelProps {
    fases: FaseOlimpiada[];
    setFases: (fases: FaseOlimpiada[]) => void;
    processing: boolean;
    olimpiadaId?: number; // ID de la olimpiada si ya existe
}

function SortableFaseItem({ fase, onEdit, onDelete }: { fase: FaseOlimpiada, onEdit: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fase.id });
    const { hasPermission } = usePermissions();
    const canEditFase = hasPermission('fases:edit');
    const canDeleteFase = hasPermission('fases:delete');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP', { locale: es });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 border rounded-md shadow ${isDragging ? 'bg-white opacity-50' : 'opacity-100'}`}
        >
            <div className="flex-grow flex flex-col md:flex-row md:items-center md:space-x-4">
                <div className="flex items-center space-x-2">
                    <Button {...attributes} {...listeners} variant="ghost" size="icon" className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <p className="font-semibold">{fase.nombre}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0 pl-10 md:pl-0">
                    <Badge variant="secondary">Orden: {fase.orden}</Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">Cupos: {fase.cupos ?? 'N/A'}</Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Inicio: {formatDate(fase.fecha_inicio)}</Badge>
                    <Badge variant="outline" className="bg-red-100 text-red-800">Fin: {formatDate(fase.fecha_fin)}</Badge>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {canEditFase && (
                    <Button variant="outline" size="icon" onClick={onEdit}>
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                )}
                {canDeleteFase && (
                    <Button variant="destructive" size="icon" onClick={onDelete}>
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </li>
    );
}

const FasesPanel: React.FC<FasesPanelProps> = ({ fases, setFases, processing, olimpiadaId }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFase, setEditingFase] = useState<FaseOlimpiada | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [faseToDelete, setFaseToDelete] = useState<FaseOlimpiada | null>(null);
    
    // Estados para controlar los popovers de fecha
    const [isStartDateOpen, setIsStartDateOpen] = useState(false);
    const [isEndDateOpen, setIsEndDateOpen] = useState(false);
    const [isEditStartDateOpen, setIsEditStartDateOpen] = useState(false);
    const [isEditEndDateOpen, setIsEditEndDateOpen] = useState(false);

    const { hasPermission } = usePermissions();
    const canCreateFase = hasPermission('fases:create');
    const canEditFase = hasPermission('fases:edit');
    const canDeleteFase = hasPermission('fases:delete');
    const canReorderFase = hasPermission('fases:reorder');
    const canAssignNotaMinimaFase = hasPermission('fases:assign-nota-minima');

    const { data, setData, errors, reset, post: postFase } = useForm({
        nombre: '',
        orden: fases.length + 1,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true as boolean,
        observaciones: '',
        cupos: 0,
    });

    const { data: editData, setData: setEditData, errors: editErrors, put: putFase, delete: deleteFase } = useForm({
        nombre: '',
        orden: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true as boolean,
        observaciones: '',
        cupos: 0,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Actualizar el orden del formulario cuando cambie el número de fases
    useEffect(() => {
        setData('orden', fases.length + 1);
    }, [fases.length]);

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validar que cupos sea mayor a 0
        if (!data.cupos || data.cupos <= 0) {
            toast.error('Los cupos deben ser mayor a 0.');
            return;
        }
        
        // Si la olimpiada ya existe, guardar al servidor
        if (olimpiadaId) {
            postFase(route('fases.store', olimpiadaId), {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    reset();
                    toast.success('Fase creada exitosamente.');
                    // Actualizar las fases con los datos del servidor
                    if (page.props.olimpiada?.fases) {
                        setFases(page.props.olimpiada.fases);
                    }
                },
                onError: (errors) => {
                    console.error('Error al crear fase:', errors);
                    toast.error('Error al crear la fase. Verifica los datos.');
                }
            });
        } else {
            // Si es olimpiada nueva, solo actualizar estado local
            const newFase: FaseOlimpiada = {
                id: Date.now(), // Temporary ID for local management
                ...data,
            };
            setFases([...fases, newFase].map((f, i) => ({ ...f, orden: i + 1 })));
            reset();
            toast.success('Fase agregada (se guardará al crear la olimpiada).');
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFase) return;

        // Validar que cupos sea mayor a 0
        if (!editData.cupos || editData.cupos <= 0) {
            toast.error('Los cupos deben ser mayor a 0.');
            return;
        }

        // Si la olimpiada ya existe Y la fase tiene ID real (no temporal), actualizar en servidor
        if (olimpiadaId && editingFase.id && editingFase.id < 1000000000000) {
            // ID real de base de datos, actualizar en servidor
            putFase(route('fases.update', editingFase.id), {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    setIsEditModalOpen(false);
                    setEditingFase(null);
                    toast.success('Fase actualizada exitosamente.');
                    // Actualizar las fases con los datos del servidor
                    if (page.props.olimpiada?.fases) {
                        setFases(page.props.olimpiada.fases);
                    }
                },
                onError: (errors) => {
                    console.error('Error al actualizar fase:', errors);
                    toast.error('Error al actualizar la fase. Verifica los datos.');
                }
            });
        } else {
            // ID temporal (Date.now()) o sin olimpiadaId, solo actualizar localmente
            setFases(fases.map(fase =>
                fase.id === editingFase.id
                    ? { ...fase, ...editData, id: fase.id }
                    : fase
            ));
            setIsEditModalOpen(false);
            setEditingFase(null);
            toast.success('Fase actualizada (se guardará al crear la olimpiada).');
        }
    };

    const handleDelete = (fase: FaseOlimpiada) => {
        setFaseToDelete(fase);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!faseToDelete) return;

        // Si la fase tiene ID temporal, solo eliminar localmente
        if (faseToDelete.id > 1000000000000) {
            const updatedFases = fases
                .filter(f => f.id !== faseToDelete.id)
                .map((f, index) => ({ ...f, orden: index + 1 })); // Reordenar
            setFases(updatedFases);
            toast.success('Fase eliminada.');
            setIsDeleteModalOpen(false);
            setFaseToDelete(null);
        } else if (olimpiadaId && faseToDelete.id) {
            // ID real, eliminar en servidor
            deleteFase(route('fases.destroy', faseToDelete.id), {
                preserveScroll: true,
                onSuccess: (page: any) => {
                    toast.success('Fase eliminada exitosamente.');
                    // Actualizar las fases con los datos del servidor
                    if (page.props.olimpiada?.fases) {
                        setFases(page.props.olimpiada.fases);
                    }
                    setIsDeleteModalOpen(false);
                    setFaseToDelete(null);
                },
                onError: (errors) => {
                    console.error('Error al eliminar fase:', errors);
                    toast.error('No se puede eliminar la fase porque tiene registros asociados.');
                    setIsDeleteModalOpen(false);
                    setFaseToDelete(null);
                }
            });
        } else {
            const updatedFases = fases
                .filter(f => f.id !== faseToDelete.id)
                .map((f, index) => ({ ...f, orden: index + 1 })); // Reordenar
            setFases(updatedFases);
            toast.success('Fase eliminada.');
            setIsDeleteModalOpen(false);
            setFaseToDelete(null);
        }
    };

    const openEditModal = (fase: FaseOlimpiada) => {
        setEditingFase(fase);
        
        // Procesar fechas de manera segura
        let fecha_inicio_str = '';
        let fecha_fin_str = '';
        
        if (fase.fecha_inicio) {
            try {
                const fecha = parseDateString(fase.fecha_inicio);
                fecha_inicio_str = formatDateToString(fecha);
            } catch (e) {
                console.error('Error al parsear fecha_inicio:', e);
                fecha_inicio_str = '';
            }
        }
        
        if (fase.fecha_fin) {
            try {
                const fecha = parseDateString(fase.fecha_fin);
                fecha_fin_str = formatDateToString(fecha);
            } catch (e) {
                console.error('Error al parsear fecha_fin:', e);
                fecha_fin_str = '';
            }
        }
        
        setEditData({
            nombre: fase.nombre,
            orden: fase.orden,
            fecha_inicio: fecha_inicio_str,
            fecha_fin: fecha_fin_str,
            activa: fase.activa,
            observaciones: fase.observaciones || '',
            cupos: fase.cupos || 0,
        });
        setIsEditModalOpen(true);
    };

    function handleDragStart(event: any) { }

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = fases.findIndex(f => f.id === active.id);
            const newIndex = fases.findIndex(f => f.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrderFases = arrayMove(fases, oldIndex, newIndex);
                // Update order property for all items
                const reorderedFases = newOrderFases.map((f, i) => ({ ...f, orden: i + 1 }));
                setFases(reorderedFases);
                toast.success('Fase reordenada.');
            }
        }
    }

    const hasDateContinuityError = useMemo(() => {
        const sortedFases = [...fases].sort((a, b) => a.orden - b.orden);
        for (let i = 0; i < sortedFases.length - 1; i++) {
            const current = sortedFases[i];
            const next = sortedFases[i + 1];
            if (!current.fecha_fin || !next.fecha_inicio) {
                return true;
            }
            if (new Date(current.fecha_fin) > new Date(next.fecha_inicio)) {
                return true;
            }
        }
        return false;
    }, [fases]);

    return (
        <div className="space-y-6">
            <div>
                {canCreateFase && (
                    <>
                        <h4 className="font-semibold text-lg">Crear Nueva Fase</h4>
                        <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-medium ">Nombre</label>
                                    <Input
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                                </div>
                                <div>
                                    <label htmlFor="orden" className="block text-sm font-medium ">Orden</label>
                                    <Input
                                        id="orden"
                                        type="number"
                                        value={data.orden}
                                        onChange={(e) => setData('orden', parseInt(e.target.value))}
                                        className="mt-1"
                                        readOnly
                                        min="0"
                                    />
                                    {errors.orden && <p className="text-xs text-red-600 mt-1">{errors.orden}</p>}
                                </div>
                                <div>
                                    <label htmlFor="fecha_inicio" className="block text-sm font-medium">Fecha de Inicio</label>
                                    <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal mt-1",
                                                    !data.fecha_inicio && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formatDateForDisplay(data.fecha_inicio)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={parseDateForCalendar(data.fecha_inicio)}
                                                onSelect={(date) => {
                                                    setData('fecha_inicio', date ? formatDateToString(date) : '');
                                                    setIsStartDateOpen(false);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>}
                                </div>
                                <div>
                                    <label htmlFor="fecha_fin" className="block text-sm font-medium">Fecha de Fin</label>
                                    <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal mt-1",
                                                    !data.fecha_fin && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formatDateForDisplay(data.fecha_fin)}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={parseDateForCalendar(data.fecha_fin)}
                                                onSelect={(date) => {
                                                    setData('fecha_fin', date ? formatDateToString(date) : '');
                                                    setIsEndDateOpen(false);
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.fecha_fin && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin}</p>}
                                </div>
                                <div>
                                    <label htmlFor="cupos" className="block text-sm font-medium ">Cupos <span className="text-red-500">*</span></label>
                                    <Input
                                        id="cupos"
                                        type="number"
                                        value={data.cupos === 0 ? '' : data.cupos}
                                        onChange={(e) => setData('cupos', e.target.value ? parseInt(e.target.value) : 0)}
                                        className="mt-1"
                                        min="1"
                                    />                            {errors.cupos && <p className="text-xs text-red-600 mt-1">{errors.cupos}</p>}
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Switch id="activa" checked={data.activa} onCheckedChange={(checked) => setData('activa', checked)} />
                                    <label htmlFor="activa" className={cn("text-sm font-medium", data.activa ? "text-green-600" : "text-red-600")}>Activa</label>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="observaciones" className="block text-sm font-medium ">Observaciones</label>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    className="mt-1"
                                />
                                {errors.observaciones && <p className="text-xs text-red-600 mt-1">{errors.observaciones}</p>}
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>Crear Fase</Button>
                            </div>
                        </form>
                    </>
                )}
            </div>

            <div className="mt-8">
                <h4 className="font-semibold text-lg">Lista de Fases</h4>
                <p className="text-sm text-muted-foreground mb-4">
                    Arrastra y suelta los elementos de la lista para cambiar el orden de las fases.
                    El número de orden se actualizará automáticamente.
                </p>
                {hasDateContinuityError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Advertencia de Continuidad</AlertTitle>
                        <AlertDescription>
                            Las fechas de las fases se solapan o no son consecutivas. Por favor, ajústelas.
                        </AlertDescription>
                    </Alert>
                )}
                {fases && fases.length > 0 ? (
                    canReorderFase ? (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <SortableContext items={fases.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                <ul className="mt-4 space-y-2">
                                    {fases.map(fase => (
                                        <SortableFaseItem key={fase.id} fase={fase} onEdit={() => openEditModal(fase)} onDelete={() => handleDelete(fase)} />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {fases.map(fase => (
                                <SortableFaseItem key={fase.id} fase={fase} onEdit={() => openEditModal(fase)} onDelete={() => handleDelete(fase)} />
                            ))}
                        </ul>
                    )
                ) : (
                    <p className="text-sm text-muted-foreground mt-4">No hay fases para esta olimpiada.</p>
                )}
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Fase</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-nombre" className="block text-sm font-medium ">Nombre</label>
                                <Input
                                    id="edit-nombre"
                                    value={editData.nombre}
                                    onChange={(e) => setEditData('nombre', e.target.value)}
                                    className="mt-1"
                                    disabled={!canEditFase}
                                />
                                {editErrors.nombre && <p className="text-xs text-red-600 mt-1">{editErrors.nombre}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-orden" className="block text-sm font-medium ">Orden</label>
                                <Input
                                    id="edit-orden"
                                    type="number"
                                    value={editData.orden}
                                    onChange={(e) => setEditData('orden', parseInt(e.target.value))}
                                    className="mt-1"
                                    readOnly
                                    min="0"
                                    disabled={!canEditFase}
                                />
                                {editErrors.orden && <p className="text-xs text-red-600 mt-1">{editErrors.orden}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-fecha_inicio" className="block text-sm font-medium">Fecha de Inicio</label>
                                <Popover open={isEditStartDateOpen} onOpenChange={setIsEditStartDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal mt-1",
                                                !editData.fecha_inicio && "text-muted-foreground"
                                            )}
                                            disabled={!canEditFase}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateForDisplay(editData.fecha_inicio)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateForCalendar(editData.fecha_inicio)}
                                            onSelect={(date) => {
                                                setEditData('fecha_inicio', date ? formatDateToString(date) : '');
                                                setIsEditStartDateOpen(false);
                                            }}
                                            initialFocus
                                            disabled={!canEditFase}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {editErrors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{editErrors.fecha_inicio}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-fecha_fin" className="block text-sm font-medium">Fecha de Fin</label>
                                <Popover open={isEditEndDateOpen} onOpenChange={setIsEditEndDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal mt-1",
                                                !editData.fecha_fin && "text-muted-foreground"
                                            )}
                                            disabled={!canEditFase}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDateForDisplay(editData.fecha_fin)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={parseDateForCalendar(editData.fecha_fin)}
                                            onSelect={(date) => {
                                                setEditData('fecha_fin', date ? formatDateToString(date) : '');
                                                setIsEditEndDateOpen(false);
                                            }}
                                            initialFocus
                                            disabled={!canEditFase}
                                        />
                                    </PopoverContent>
                                </Popover>
                                {editErrors.fecha_fin && <p className="text-xs text-red-600 mt-1">{editErrors.fecha_fin}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-cupos" className="block text-sm font-medium ">Cupos <span className="text-red-500">*</span></label>
                                <Input
                                    id="edit-cupos"
                                    type="number"
                                    value={editData.cupos === 0 ? '' : editData.cupos}
                                    onChange={(e) => setEditData('cupos', e.target.value ? parseInt(e.target.value) : 0)}
                                    className="mt-1"
                                    min="1"
                                    disabled={!canEditFase}
                                />
                                {editErrors.cupos && <p className="text-xs text-red-600 mt-1">{editErrors.cupos}</p>}
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch
                                    id="edit-activa"
                                    checked={editData.activa}
                                    onCheckedChange={(checked) => setEditData('activa', checked)}
                                    disabled={!canEditFase}
                                />
                                <label htmlFor="edit-activa" className={cn("text-sm font-medium", editData.activa ? "text-green-600" : "text-red-600")}>Activa</label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="edit-observaciones" className="block text-sm font-medium ">Observaciones</label>
                            <Textarea
                                id="edit-observaciones"
                                value={editData.observaciones}
                                onChange={(e) => setEditData('observaciones', e.target.value)}
                                className="mt-1"
                                disabled={!canEditFase}
                            />
                            {editErrors.observaciones && <p className="text-xs text-red-600 mt-1">{editErrors.observaciones}</p>}
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processing || !canEditFase}>Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal de confirmación de eliminación */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Eliminación</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la fase "{faseToDelete?.nombre}"?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Advertencia</AlertTitle>
                            <AlertDescription>
                                Esta acción no se puede deshacer. {faseToDelete && faseToDelete.id < 1000000000000 && "Si la fase tiene evaluaciones o inscripciones asociadas, no podrá ser eliminada."}
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                                setIsDeleteModalOpen(false);
                                setFaseToDelete(null);
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="button" 
                            variant="destructive" 
                            onClick={confirmDelete}
                            disabled={processing}
                        >
                            Eliminar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FasesPanel;