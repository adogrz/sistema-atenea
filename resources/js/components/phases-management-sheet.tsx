import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GripVertical, PlusCircle } from 'lucide-react';
import { Olimpiada, FaseOlimpiada, DefinicionEvaluacion } from '@/types';

// Sortable Item Component
const SortableFaseCard = ({ fase, onEdit, onDelete }: { fase: FaseOlimpiada, onEdit: () => void, onDelete: () => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: fase.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="mb-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{fase.orden}. {fase.nombre}</CardTitle>
                    <div className="flex items-center">
                        <Button variant="ghost" size="sm" onClick={onEdit}>Editar</Button>
                        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500">Eliminar</Button>
                        <div {...listeners} className="cursor-grab p-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">
                        <p>Estado: {fase.estado}</p>
                        <p>Fechas: {fase.fecha_inicio} - {fase.fecha_fin}</p>
                        <p>Activa: {fase.activa ? 'Sí' : 'No'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


// Main Sheet Component
const PhasesManagementSheet: React.FC<any> = ({ olimpiada, definiciones_evaluacion, isOpen, onClose }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFase, setEditingFase] = useState<FaseOlimpiada | null>(null);
    const [isCreateFormVisible, setCreateFormVisible] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nombre: '',
        orden: '',
        fecha_inicio: '',
        fecha_fin: '',
        estado: 'programada',
        activa: true,
        observaciones: '',
        definicion_evaluacion_id: undefined as string | undefined,
    });

    const openEditModal = (fase: FaseOlimpiada) => {
        setEditingFase(fase);
        setData({
            nombre: fase.nombre,
            orden: String(fase.orden),
            fecha_inicio: fase.fecha_inicio || '',
            fecha_fin: fase.fecha_fin || '',
            estado: fase.estado,
            activa: fase.activa,
            observaciones: fase.observaciones || '',
            definicion_evaluacion_id: fase.definicion_evaluacion_id ? String(fase.definicion_evaluacion_id) : undefined,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFase(null);
        reset();
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!olimpiada || !editingFase) return;

        put(route('olimpiadas.fases.update', { olimpiada: olimpiada.id, fase: editingFase.id }), {
            onSuccess: () => {
                toast.success('Fase actualizada exitosamente.');
                closeModal();
            },
            onError: (err: any) => {
                toast.error(`Error al actualizar la fase: ${Object.values(err).join(' ')}`);
            },
        });
    };
    
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!olimpiada) return;
        const nextOrder = olimpiada.fases.length > 0 ? Math.max(...olimpiada.fases.map((f: FaseOlimpiada) => f.orden)) + 1 : 1;
        
        post(route('olimpiadas.fases.store', olimpiada.id), {
            data: { ...data, orden: nextOrder },
            onSuccess: () => {
                toast.success('Fase creada exitosamente.');
                reset();
                setCreateFormVisible(false);
            },
            onError: (err: any) => {
                toast.error(`Error al crear la fase: ${Object.values(err).join(' ')}`);
            },
        });
    };

    const handleDelete = (fase: FaseOlimpiada) => {
        if (!olimpiada) return;
        if (confirm('¿Estás seguro de que quieres eliminar esta fase?')) {
            destroy(route('olimpiadas.fases.destroy', { olimpiada: olimpiada.id, fase: fase.id }), {
                onSuccess: () => toast.success('Fase eliminada exitosamente.'),
                onError: () => toast.error('Error al eliminar la fase.'),
            });
        }
    };

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = olimpiada.fases.findIndex((f: FaseOlimpiada) => f.id === active.id);
            const newIndex = olimpiada.fases.findIndex((f: FaseOlimpiada) => f.id === over.id);
            const newOrder = arrayMove(olimpiada.fases, oldIndex, newIndex);

            // Optimistic update UI
            const originalFases = [...olimpiada.fases];
            olimpiada.fases = newOrder.map((f, index) => ({ ...f, orden: index + 1 }));

            router.post(route('dashboard.fases.reorder', { fase: active.id }), {
                direction: newIndex > oldIndex ? 'down' : 'up',
            }, {
                preserveScroll: true,
                onError: () => {
                    olimpiada.fases = originalFases; // Revert on error
                    toast.error('Error al reordenar la fase.');
                },
            });
        }
    };

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent className="sm:max-w-3xl w-full">
                    <SheetHeader>
                        <SheetTitle>Gestionar Fases de: {olimpiada?.nombre}</SheetTitle>
                        <SheetDescription>Arrastra y suelta las fases para reordenarlas. Agrega nuevas fases al final.</SheetDescription>
                    </SheetHeader>
                    <div className="py-4 h-[calc(100vh-150px)] overflow-y-auto">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={olimpiada?.fases.map((f: FaseOlimpiada) => f.id) || []} strategy={verticalListSortingStrategy}>
                                {olimpiada?.fases.map((fase: FaseOlimpiada) => (
                                    <SortableFaseCard 
                                        key={fase.id} 
                                        fase={fase} 
                                        onEdit={() => openEditModal(fase)} 
                                        onDelete={() => handleDelete(fase)} 
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>

                        {isCreateFormVisible ? (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle>Nueva Fase</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateSubmit}>
                                        <div className="grid gap-4">
                                            <Input label="Nombre" placeholder="Nombre de la nueva fase" value={data.nombre} onChange={e => setData('nombre', e.target.value)} error={errors.nombre} />
                                            <Input type="date" label="Fecha de Inicio" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} error={errors.fecha_inicio} />
                                            <Input type="date" label="Fecha de Fin" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} error={errors.fecha_fin} />
                                            <Select value={data.estado} onValueChange={value => setData('estado', value as any)}>
                                                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="programada">Programada</SelectItem>
                                                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                                                    <SelectItem value="finalizada">Finalizada</SelectItem>
                                                    <SelectItem value="anulada">Anulada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center space-x-2">
                                                <Switch checked={data.activa} onCheckedChange={checked => setData('activa', checked)} id="activa-create" />
                                                <label htmlFor="activa-create">Activa</label>
                                            </div>
                                            <Textarea label="Observaciones" placeholder="Observaciones" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} error={errors.observaciones} />
                                            <Select value={data.definicion_evaluacion_id} onValueChange={value => setData('definicion_evaluacion_id', value)}>
                                                <SelectTrigger><SelectValue placeholder="Definición de evaluación (opcional)" /></SelectTrigger>
                                                <SelectContent>
                                                    {definiciones_evaluacion.map((def: DefinicionEvaluacion) => <SelectItem key={def.id} value={String(def.id)}>{def.nombre}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <Button type="button" variant="ghost" onClick={() => setCreateFormVisible(false)}>Cancelar</Button>
                                            <Button type="submit" disabled={processing}>Guardar Fase</Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        ) : (
                            <Button onClick={() => setCreateFormVisible(true)} className="w-full mt-4">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Agregar Nueva Fase
                            </Button>
                        )}
                    </div>
                    <SheetFooter>
                        <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Dialog open={isModalOpen} onOpenChange={closeModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Fase</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                       {/* Form fields for editing... same as create form but pre-filled */}
                       <div className="grid gap-4 py-4">
                            <Input label="Nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} error={errors.nombre} />
                            <Input type="number" label="Orden" value={data.orden} onChange={e => setData('orden', e.target.value)} error={errors.orden} />
                            <Input type="date" label="Fecha de Inicio" value={data.fecha_inicio} onChange={e => setData('fecha_inicio', e.target.value)} error={errors.fecha_inicio} />
                            <Input type="date" label="Fecha de Fin" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} error={errors.fecha_fin} />
                            <Select value={data.estado} onValueChange={value => setData('estado', value as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="programada">Programada</SelectItem>
                                    <SelectItem value="en_proceso">En Proceso</SelectItem>
                                    <SelectItem value="finalizada">Finalizada</SelectItem>
                                    <SelectItem value="anulada">Anulada</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                                <Switch checked={data.activa} onCheckedChange={checked => setData('activa', checked)} id="activa-edit" />
                                <label htmlFor="activa-edit">Activa</label>
                            </div>
                            <Textarea label="Observaciones" value={data.observaciones} onChange={e => setData('observaciones', e.target.value)} error={errors.observaciones} />
                            <Select value={data.definicion_evaluacion_id} onValueChange={value => setData('definicion_evaluacion_id', value)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {definiciones_evaluacion.map((def: DefinicionEvaluacion) => <SelectItem key={def.id} value={String(def.id)}>{def.nombre}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeModal}>Cancelar</Button>
                            <Button type="submit" disabled={processing}>Actualizar Fase</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default PhasesManagementSheet;