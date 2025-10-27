import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Olimpiada, FaseOlimpiada } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PencilIcon, Trash2Icon, GripVertical } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


interface FasesPanelProps {
    fases: FaseOlimpiada[];
    setFases: (fases: FaseOlimpiada[]) => void;
    olimpiadaId?: number;
}

function SortableFaseItem({ fase, onEdit, onDelete }: { fase: FaseOlimpiada, onEdit: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: fase.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 1 : 0,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 border rounded-md shadow ${isDragging ? 'bg-white opacity-50' : 'opacity-100'}`}
        >
            <div className="flex items-center space-x-3">
                <Button {...attributes} {...listeners} variant="ghost" size="icon" className="cursor-grab">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </Button>
                <div>
                    <p className="font-semibold">{fase.nombre}</p>
                    <p className="text-sm text-muted-foreground">Orden: {fase.orden}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={onEdit}>
                    <PencilIcon className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={onDelete}>
                    <Trash2Icon className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}

const FasesPanel: React.FC<FasesPanelProps> = ({ fases, setFases, olimpiadaId }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFase, setEditingFase] = useState<FaseOlimpiada | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nombre: '',
        orden: fases.length + 1,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
        observaciones: '',
    });

    const { data: editData, setData: setEditData, put: update, processing: updating, errors: editErrors } = useForm({
        nombre: '',
        orden: 0,
        fecha_inicio: '',
        fecha_fin: '',
        activa: true,
        observaciones: '',
    });

    const { delete: destroy } = useForm();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (olimpiadaId) {
            post(route('fases.store', { olimpiada: olimpiadaId }), {
                onSuccess: () => {
                    reset();
                    toast.success('Fase creada exitosamente.');
                },
                onError: (err) => {
                    toast.error('Error al crear la fase.');
                    console.error(err);
                },
            });
        } else {
            // If no olimpiadaId, add to local state
            const newFase: FaseOlimpiada = {
                id: Date.now(), // Temporary ID for local management
                nombre: data.nombre,
                orden: data.orden,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                activa: data.activa,
                observaciones: data.observaciones,
            };
            setFases([...fases, newFase]);
            reset();
            toast.success('Fase agregada localmente.');
        }
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingFase) return;

        if (olimpiadaId) {
            update(route('fases.update', { fase: editingFase.id }), {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    toast.success('Fase actualizada exitosamente.');
                },
                onError: (err) => {
                    toast.error('Error al actualizar la fase.');
                    console.error(err);
                },
            });
        } else {
            // Update local state
            setFases(fases.map(fase =>
                fase.id === editingFase.id
                    ? { ...fase, ...editData, id: fase.id } // Ensure ID is preserved
                    : fase
            ));
            setIsEditModalOpen(false);
            toast.success('Fase actualizada localmente.');
        }
    };

    const handleDelete = (fase: FaseOlimpiada) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta fase?')) {
            if (olimpiadaId) {
                destroy(route('fases.destroy', { fase: fase.id }), {
                    onSuccess: () => {
                        toast.success('Fase eliminada exitosamente.');
                    },
                    onError: (err) => {
                        toast.error('Error al eliminar la fase.');
                        console.error(err);
                    },
                });
            } else {
                // Remove from local state
                setFases(fases.filter(f => f.id !== fase.id));
                toast.success('Fase eliminada localmente.');
            }
        }
    };

    const openEditModal = (fase: FaseOlimpiada) => {
        setEditingFase(fase);
        setEditData({
            nombre: fase.nombre,
            orden: fase.orden,
            fecha_inicio: fase.fecha_inicio ? new Date(fase.fecha_inicio).toISOString().split('T')[0] : '',
            fecha_fin: fase.fecha_fin ? new Date(fase.fecha_fin).toISOString().split('T')[0] : '',
            activa: fase.activa,
            observaciones: fase.observaciones || '',
        });
        setIsEditModalOpen(true);
    };

    function handleDragStart(event: any) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event: any) {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = fases.findIndex(f => f.id === active.id);
            const newIndex = fases.findIndex(f => f.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newOrderFases = arrayMove(fases, oldIndex, newIndex);

                if (olimpiadaId) {
                    // If olimpiada exists, update backend
                    const direction = newIndex > oldIndex ? 'down' : 'up';
                    post(route('fases.reorder', { fase: active.id }), {
                        direction: direction,
                    }, {
                        onSuccess: () => {
                            setFases(newOrderFases); // Optimistic update after success
                            toast.success('Fase reordenada exitosamente.');
                        },
                        onError: (err) => {
                            toast.error('Error al reordenar la fase.');
                            console.error(err);
                        },
                        preserveScroll: true,
                    });
                } else {
                    // If olimpiada is new, update local state only
                    setFases(newOrderFases);
                    toast.success('Fase reordenada localmente.');
                }
            }
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h4 className="font-semibold text-lg">Crear Nueva Fase</h4>
                <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            />
                            {errors.orden && <p className="text-xs text-red-600 mt-1">{errors.orden}</p>}
                        </div>
                        <div>
                            <label htmlFor="fecha_inicio" className="block text-sm font-medium">Fecha de Inicio</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal mt-1",
                                            !data.fecha_inicio && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.fecha_inicio ? format(new Date(data.fecha_inicio), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.fecha_inicio ? new Date(data.fecha_inicio) : undefined}
                                        onSelect={(date) => setData('fecha_inicio', date ? format(date, 'yyyy-MM-dd') : '')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{errors.fecha_inicio}</p>}
                        </div>
                        <div>
                            <label htmlFor="fecha_fin" className="block text-sm font-medium">Fecha de Fin</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal mt-1",
                                            !data.fecha_fin && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {data.fecha_fin ? format(new Date(data.fecha_fin), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={data.fecha_fin ? new Date(data.fecha_fin) : undefined}
                                        onSelect={(date) => setData('fecha_fin', date ? format(date, 'yyyy-MM-dd') : '')}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_fin && <p className="text-xs text-red-600 mt-1">{errors.fecha_fin}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-6">
                            <Switch id="activa" checked={data.activa} onCheckedChange={(checked) => setData('activa', checked)} />
                            <label htmlFor="activa" className="text-sm font-medium ">Activa</label>
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
            </div>

            <div className="mt-8">
                <h4 className="font-semibold text-lg">Lista de Fases</h4>
                {fases && fases.length > 0 ? (
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
                                />
                                {editErrors.orden && <p className="text-xs text-red-600 mt-1">{editErrors.orden}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-fecha_inicio" className="block text-sm font-medium">Fecha de Inicio</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal mt-1",
                                                !editData.fecha_inicio && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editData.fecha_inicio ? format(new Date(editData.fecha_inicio), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={editData.fecha_inicio ? new Date(editData.fecha_inicio) : undefined}
                                            onSelect={(date) => setEditData('fecha_inicio', date ? format(date, 'yyyy-MM-dd') : '')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {editErrors.fecha_inicio && <p className="text-xs text-red-600 mt-1">{editErrors.fecha_inicio}</p>}
                            </div>
                            <div>
                                <label htmlFor="edit-fecha_fin" className="block text-sm font-medium">Fecha de Fin</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal mt-1",
                                                !editData.fecha_fin && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editData.fecha_fin ? format(new Date(editData.fecha_fin), "PPP") : <span className="text-muted-foreground">Seleccionar fecha</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={editData.fecha_fin ? new Date(editData.fecha_fin) : undefined}
                                            onSelect={(date) => setEditData('fecha_fin', date ? format(date, 'yyyy-MM-dd') : '')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {editErrors.fecha_fin && <p className="text-xs text-red-600 mt-1">{editErrors.fecha_fin}</p>}
                            </div>
                            <div className="flex items-center space-x-2 pt-6">
                                <Switch id="edit-activa" checked={editData.activa} onCheckedChange={(checked) => setEditData('activa', checked)} />
                                <label htmlFor="edit-activa" className="text-sm font-medium ">Activa</label>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="edit-observaciones" className="block text-sm font-medium ">Observaciones</label>
                            <Textarea
                                id="edit-observaciones"
                                value={editData.observaciones}
                                onChange={(e) => setEditData('observaciones', e.target.value)}
                                className="mt-1"
                            />
                            {editErrors.observaciones && <p className="text-xs text-red-600 mt-1">{editErrors.observaciones}</p>}
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={updating}>Actualizar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FasesPanel;