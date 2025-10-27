import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DefinicionEvaluacion, ItemDefinido } from '@/types';
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
    isBlocked: boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, onRemove, onChange, isBlocked }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.local_id! });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center space-x-4 border p-4 rounded-lg bg-card shadow-sm mb-3">
            <div {...listeners} {...attributes} className={`cursor-grab text-muted-foreground ${isBlocked ? 'cursor-not-allowed' : ''}`}>
                <GripVertical className="h-5 w-5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-grow">
                <div className="col-span-2">
                    <Label htmlFor={`nombre-${item.local_id}`} className="mb-2 block">Nombre del Ítem</Label>
                    <Input
                        id={`nombre-${item.local_id}`}
                        placeholder="Nombre del Ítem"
                        value={item.nombre}
                        onChange={(e) => onChange(item.local_id!, 'nombre', e.target.value)}
                        disabled={isBlocked}
                    />
                </div>
                <div>
                    <Label htmlFor={`puntos_maximos-${item.local_id}`} className="mb-2 block">Puntos Máximos</Label>
                    <Input
                        id={`puntos_maximos-${item.local_id}`}
                        type="number"
                        value={item.puntos_maximos}
                        onChange={(e) => onChange(item.local_id!, 'puntos_maximos', parseFloat(e.target.value))}
                        disabled={isBlocked}
                    />
                </div>
            </div>
            <Button variant="destructive" size="icon" onClick={() => onRemove(item.local_id!)} disabled={isBlocked}>
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
        version: definicionEvaluacion?.version || 1,
        estado: definicionEvaluacion?.estado || 'borrador',
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
            setData(prevData => ({
                ...prevData,
                nombre: definicionEvaluacion.nombre,
                descripcion: definicionEvaluacion.descripcion || '',
                version: definicionEvaluacion?.version || 1,
                estado: definicionEvaluacion.estado || 'borrador',
                bloqueada: definicionEvaluacion.bloqueada ?? false,
                items: definicionEvaluacion.items_definidos?.map(item => ({ ...item, local_id: item.id ? String(item.id) : `new-${Math.random()}` })) || [],
            }));
        }
    }, [definicionEvaluacion]);

    const handleAddItem = () => {
        setData('items', [...data.items, {
            local_id: `new-${Math.random()}`,
            nombre: '',
            descripcion: '',
            orden: data.items.length + 1,
            puntos_maximos: 0,
            id: 0,
            definicion_evaluacion_id: 0,
            created_at: '',
            updated_at: ''
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

        if (isEditMode && definicionEvaluacion?.bloqueada) {
            toast.error('Esta definición está bloqueada y no puede ser modificada.');
            return;
        }

        const itemsForSubmission = data.items.map(({ local_id, ...item }) => item);

        const commonOptions = {
            onSuccess: () => toast.success(isEditMode ? 'Rúbrica actualizada exitosamente.' : 'Rúbrica creada exitosamente.'),
            onError: (err: any) => {
                console.error(err);
                if (err && Object.keys(err).length > 0) {
                    toast.error('Error de validación. Por favor, corrige los campos marcados.');
                } else {
                    toast.error('Error al procesar la solicitud. Inténtalo de nuevo.');
                }
            },
        };

        if (isEditMode) {
            put(route('definiciones-evaluacion.update', definicionEvaluacion!.id), {
                ...commonOptions,
                data: { ...data, items: itemsForSubmission },
            });
        } else {
            post(route('definiciones-evaluacion.store'), {
                ...commonOptions,
                data: { ...data, items: itemsForSubmission },
            });
        }
    };

    const totalPuntosMaximos = React.useMemo(() => {
        return data.items.reduce((sum, item) => sum + (parseFloat(item.puntos_maximos as any) || 0), 0);
    }, [data.items]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditMode ? "Editar Definición de Evaluación" : "Crear Definición de Evaluación"} />
            <div className="p-4 md:p-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {isEditMode ? "Editar Definición de Evaluación" : "Crear Nueva Definición de Evaluación"}
                        </h2>
                        <p className="text-muted-foreground mt-1">
                            {isEditMode ? "Modifica los detalles y los ítems de esta definición." : "Define una nueva plantilla de evaluación y sus ítems asociados."}
                        </p>
                    </div>
                    <Link href={route('definiciones-evaluacion.index')}>
                        <Button variant="outline">Volver al Listado</Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Detalles de la Definición</CardTitle>
                            <CardDescription>Información general de la plantilla de evaluación.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <Label htmlFor="nombre" className="mb-2 block">Nombre</Label>
                                <Input
                                    id="nombre"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className={errors.nombre ? 'border-destructive' : ''}
                                    disabled={isEditMode && definicionEvaluacion?.bloqueada}
                                />
                                {errors.nombre && <p className="text-destructive text-sm mt-2">{errors.nombre}</p>}
                            </div>
                            <div>
                                <Label htmlFor="version" className="mb-2 block">Versión</Label>
                                <Input
                                    id="version"
                                    type="number"
                                    value={data.version}
                                    onChange={(e) => setData('version', parseInt(e.target.value))}
                                    className={errors.version ? 'border-destructive' : ''}
                                    disabled={isEditMode && definicionEvaluacion?.bloqueada}
                                />
                                {errors.version && <p className="text-destructive text-sm mt-2">{errors.version}</p>}
                            </div>
                            <div>
                                <Label htmlFor="descripcion" className="mb-2 block">Descripción</Label>
                                <Textarea
                                    id="descripcion"
                                    value={data.descripcion}
                                    onChange={(e) => setData('descripcion', e.target.value)}
                                    className={errors.descripcion ? 'border-destructive' : ''}
                                    disabled={isEditMode && definicionEvaluacion?.bloqueada}
                                />
                                {errors.descripcion && <p className="text-destructive text-sm mt-2">{errors.descripcion}</p>}
                            </div>
                            <div>
                                <Label htmlFor="estado" className="mb-2 block">Estado</Label>
                                <Select
                                    value={data.estado}
                                    onValueChange={(value) => setData('estado', value)}
                                    disabled={isEditMode && definicionEvaluacion?.bloqueada}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="borrador">Borrador</SelectItem>
                                        <SelectItem value="publicada">Publicada</SelectItem>
                                        <SelectItem value="archivada">Archivada</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.estado && <p className="text-destructive text-sm mt-2">{errors.estado}</p>}
                            </div>
                            <div className="flex items-center space-x-3">
                                <Switch
                                    id="bloqueada"
                                    checked={data.bloqueada}
                                    onCheckedChange={(checked) => setData('bloqueada', checked)}
                                    disabled={isEditMode && definicionEvaluacion?.bloqueada}
                                />
                                <Label htmlFor="bloqueada" className="mb-0">Bloqueada (Impide modificaciones futuras)</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <CardTitle>Ítems de Evaluación</CardTitle>
                                <CardDescription>Define los ítems que componen esta evaluación.</CardDescription>
                                <div className="text-sm text-muted-foreground mt-2">
                                    Total de ítems: {data.items.length} | Puntuación máxima total: {totalPuntosMaximos.toFixed(2)}
                                </div>
                            </div>
                            <Button type="button" variant="outline" onClick={handleAddItem} disabled={isEditMode && definicionEvaluacion?.bloqueada}>
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
                                                isBlocked={isEditMode && definicionEvaluacion?.bloqueada}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <div className="text-center text-muted-foreground py-8">
                                    <p>No hay ítems definidos.</p>
                                    <p className="text-sm">Haz clic en "Añadir Ítem" para empezar.</p>
                                </div>
                            )}
                            {errors.items && <p className="text-destructive text-sm mt-2">{errors.items}</p>}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || (isEditMode && definicionEvaluacion?.bloqueada)}>
                            {isEditMode ? "Actualizar Definición" : "Guardar Definición"}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
};

export default Form;
