import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DefinicionEvaluacion, ItemDefinido } from '@/types/olympics';
import { PlusCircle, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BreadcrumbItem } from '@/types';

interface DefinicionEvaluacionFormProps {
    definicionEvaluacion?: DefinicionEvaluacion;
}

interface SortableItemProps {
    item: ItemDefinido;
    onRemove: (id: string) => void;
    onChange: (id: string, field: keyof ItemDefinido, value: any) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onRemove, onChange }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.local_id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center space-x-2 border p-3 rounded-md bg-card shadow-sm mb-2">
            <div {...listeners} {...attributes} className="cursor-grab text-muted-foreground">
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-grow">
                <Input
                    placeholder="Nombre del Ítem"
                    value={item.nombre}
                    onChange={(e) => onChange(item.local_id!, 'nombre', e.target.value)}
                    className="col-span-2"
                />
                <Input
                    type="number"
                    placeholder="Ponderación"
                    value={item.ponderacion}
                    onChange={(e) => onChange(item.local_id!, 'ponderacion', parseFloat(e.target.value))}
                />
                <Input
                    type="number"
                    placeholder="Puntaje Máximo"
                    value={item.puntaje_maximo}
                    onChange={(e) => onChange(item.local_id!, 'puntaje_maximo', parseFloat(e.target.value))}
                />
                <div className="flex items-center space-x-2">
                    <Switch
                        id={`obligatorio-${item.local_id}`}
                        checked={item.obligatorio}
                        onCheckedChange={(checked) => onChange(item.local_id!, 'obligatorio', checked)}
                    />
                    <Label htmlFor={`obligatorio-${item.local_id}`}>Obligatorio</Label>
                </div>
            </div>
            <Button variant="destructive" size="icon" onClick={() => onRemove(item.local_id!)}>
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
};

const Form: React.FC<DefinicionEvaluacionFormProps> = ({ definicionEvaluacion }) => {
    const isEditMode = !!definicionEvaluacion;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Inicio', href: route('dashboard') },
        { title: 'Olimpiadas', href: route('olimpiadas.index') }, // Placeholder route
        { title: 'Definiciones de Evaluación', href: route('definiciones-evaluacion.index') },
        { title: isEditMode ? 'Editar' : 'Crear', href: isEditMode ? route('definiciones-evaluacion.edit', definicionEvaluacion!.id) : route('definiciones-evaluacion.create') },
    ];

    const { data, setData, post, put, processing, errors } = useForm({
        nombre: definicionEvaluacion?.nombre || '',
        descripcion: definicionEvaluacion?.descripcion || '',
        estado: definicionEvaluacion?.estado ?? true,
        bloqueada: definicionEvaluacion?.bloqueada ?? false,
        items: definicionEvaluacion?.items_definidos?.map(item => ({ ...item, local_id: item.id ? String(item.id) : `new-${Math.random()}` })) || [],
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (definicionEvaluacion) {
            setData({
                nombre: definicionEvaluacion.nombre,
                descripcion: definicionEvaluacion.descripcion || '',
                estado: definicionEvaluacion.estado,
                bloqueada: definicionEvaluacion.bloqueada,
                items: definicionEvaluacion.items_definidos?.map(item => ({ ...item, local_id: item.id ? String(item.id) : `new-${Math.random()}` })) || [],
            });
        }
    }, [definicionEvaluacion]);

    const handleAddItem = () => {
        setData('items', [...data.items, {
            local_id: `new-${Math.random()}`,
            nombre: '',
            descripcion: '',
            orden: data.items.length + 1,
            obligatorio: false,
            ponderacion: 0,
            puntaje_maximo: 0,
        }]);
    };

    const handleRemoveItem = (localId: string) => {
        setData('items', data.items.filter(item => item.local_id !== localId));
    };

    const handleItemChange = (localId: string, field: keyof ItemDefinido, value: any) => {
        setData('items', data.items.map(item =>
            item.local_id === localId ? { ...item, [field]: value } : item
        ));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = data.items.findIndex(item => item.local_id === active.id);
            const newIndex = data.items.findIndex(item => item.local_id === over.id);
            const newItems = [...data.items];
            const [removed] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, removed);
            setData('items', newItems.map((item, index) => ({ ...item, orden: index + 1 })));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemsForSubmission = data.items.map(({ local_id, ...item }) => item);

        if (isEditMode) {
            put(route('definiciones-evaluacion.update', definicionEvaluacion!.id), {
                data: { ...data, items: itemsForSubmission },
                onSuccess: () => toast.success('Definición de evaluación actualizada.'),
                onError: (err) => {
                    console.error(err);
                    toast.error('Error al actualizar la definición.');
                },
            });
        } else {
            post(route('definiciones-evaluacion.store'), {
                data: { ...data, items: itemsForSubmission },
                onSuccess: () => toast.success('Definición de evaluación creada.'),
                onError: (err) => {
                    console.error(err);
                    toast.error('Error al crear la definición.');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditMode ? "Editar Definición de Evaluación" : "Crear Definición de Evaluación"} />
            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isEditMode ? "Editar Definición de Evaluación" : "Crear Nueva Definición de Evaluación"}
                        </h2>
                        <p className="text-muted-foreground">
                            {isEditMode ? "Modifica los detalles y los ítems de esta definición." : "Define una nueva plantilla de evaluación y sus ítems asociados."}
                        </p>
                    </div>
                    <Link href={route('definiciones-evaluacion.index')}>
                        <Button variant="outline">Volver al Listado</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Detalles de la Definición</CardTitle>
                            <CardDescription>Información general de la plantilla de evaluación.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={errors.nombre ? 'border-destructive' : ''}
                                />
                                {errors.nombre && <p className="text-destructive text-sm mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <Label htmlFor="descripcion">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className={errors.descripcion ? 'border-destructive' : ''}
                                />
                                {errors.descripcion && <p className="text-destructive text-sm mt-1">{errors.descripcion}</p>}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="estado"
                                    checked={data.estado}
                                    onCheckedChange={(checked) => setData('estado', checked)}
                                />
                                <Label htmlFor="estado">Activa</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="bloqueada"
                                    checked={data.bloqueada}
                                    onCheckedChange={(checked) => setData('bloqueada', checked)}
                                />
                                <Label htmlFor="bloqueada">Bloqueada (Impide modificaciones futuras)</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Ítems de Evaluación</CardTitle>
                                <CardDescription>Define los ítems que componen esta evaluación.</CardDescription>
                            </div>
                            <Button type="button" variant="outline" onClick={handleAddItem}>
                                <PlusCircle className="h-4 w-4 mr-2" /> Añadir Ítem
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {data.items.length > 0 ? (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={data.items.map(item => item.local_id!)} strategy={verticalListSortingStrategy}>
                                        {data.items.map((item) => (
                                            <SortableItem
                                                key={item.local_id}
                                                item={item}
                                                onRemove={handleRemoveItem}
                                                onChange={handleItemChange}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <p className="text-center text-muted-foreground">No hay ítems definidos. Haz clic en "Añadir Ítem" para empezar.</p>
                            )}
                            {errors.items && <p className="text-destructive text-sm mt-1">{errors.items}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {isEditMode ? "Actualizar Definición" : "Guardar Definición"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default Form;
