import React, { useState, useMemo, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Olimpiada, Area, DefinicionEvaluacion } from '@/types/olympics/registration';
import PhasesManagementSheet from '@/components/phases-management-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { BreadcrumbItem } from '@/types';

interface OlimpiadasIndexProps extends PageProps {
    olimpiadas: Olimpiada[];
    areas: Area[];
    definiciones_evaluacion: DefinicionEvaluacion[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Inicio', href: '/' },
    { label: 'Olimpiadas', href: '/olympics' },
];

const Index: React.FC<OlimpiadasIndexProps> = ({ olimpiadas, areas, definiciones_evaluacion }) => {
    const { flash } = usePage().props as any;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOlimpiada, setEditingOlimpiada] = useState<Olimpiada | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedOlimpiada, setSelectedOlimpiada] = useState<Olimpiada | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nombre: '',
        descripcion: '',
        area_id: '',
        activa: true,
    });

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const openCreateModal = () => {
        setEditingOlimpiada(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (olimpiada: Olimpiada) => {
        setEditingOlimpiada(olimpiada);
        setData({
            nombre: olimpiada.nombre,
            descripcion: olimpiada.descripcion || '',
            area_id: String(olimpiada.area_id),
            activa: olimpiada.activa,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOlimpiada(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingOlimpiada
            ? route('olimpiadas.update', editingOlimpiada.id)
            : route('olimpiadas.store');
        
        const method = editingOlimpiada ? 'put' : 'post';

        (method === 'put' ? put : post)(url, {
            onSuccess: () => {
                toast.success(`Olimpiada ${editingOlimpiada ? 'actualizada' : 'creada'} exitosamente.`);
                closeModal();
            },
            onError: (err: any) => {
                console.error(err);
                const errorMessages = Object.values(err).join(' ');
                toast.error(`Error al ${editingOlimpiada ? 'actualizar' : 'crear'} la olimpiada: ${errorMessages}`);
            },
        });
    };

    const handleDelete = (olimpiada: Olimpiada) => {
        if (confirm('¿Estás seguro de que quieres eliminar esta olimpiada? Esto también eliminará todas sus fases.')) {
            destroy(route('olimpiadas.destroy', olimpiada.id), {
                onSuccess: () => {
                    toast.success('Olimpiada eliminada exitosamente.');
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Error al eliminar la olimpiada. Asegúrate de que no tenga inscripciones u otros datos asociados.');
                },
            });
        }
    };

    const handleManagePhases = (olimpiada: Olimpiada) => {
        setSelectedOlimpiada(olimpiada);
        setIsSidebarOpen(true);
    };

    const columns: ColumnDef<Olimpiada>[] = useMemo(() => [
        { accessorKey: 'nombre', header: 'Nombre' },
        { accessorKey: 'area.name', header: 'Área' },
        {
            accessorKey: 'activa',
            header: 'Activa',
            cell: ({ row }) => (row.original.activa ? 'Sí' : 'No'),
        },
        {
            id: 'fases',
            header: 'Fases',
            cell: ({ row }) => row.original.fases?.length || 0,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const olimpiada = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleManagePhases(olimpiada)}>Gestionar Fases</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(olimpiada)}>Editar Olimpiada</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(olimpiada)} className="text-red-600">
                                Eliminar Olimpiada
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Olimpiadas" />

            <div className="p-4 md:p-8">
                <div className="flex items-center justify-between mb-4 mt-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Gestión de Olimpiadas</h2>
                        <p className="text-muted-foreground">
                            Aquí puedes ver, crear y gestionar todas las olimpiadas y sus fases.
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Olimpiada
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={olimpiadas}
                />
            </div>

            {/* Modal para crear/editar olimpiada */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingOlimpiada ? 'Editar Olimpiada' : 'Crear Nueva Olimpiada'}</DialogTitle>
                        <DialogDescription>
                            Completa los detalles de la olimpiada.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <Input
                                label="Nombre"
                                placeholder="Nombre de la olimpiada"
                                value={data.nombre}
                                onChange={(e) => setData('nombre', e.target.value)}
                                error={errors.nombre}
                            />
                            <Textarea
                                label="Descripción"
                                placeholder="Descripción de la olimpiada"
                                value={data.descripcion}
                                onChange={(e) => setData('descripcion', e.target.value)}
                                error={errors.descripcion}
                            />
                            <Select
                                value={String(data.area_id)}
                                onValueChange={(value) => setData('area_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona un área" />
                                </SelectTrigger>
                                <SelectContent>
                                    {areas.map((area) => (
                                        <SelectItem key={area.id} value={String(area.id)}>
                                            {area.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={data.activa}
                                    onCheckedChange={(checked) => setData('activa', checked)}
                                    id="activa-olimpiada"
                                />
                                <label htmlFor="activa-olimpiada">Activa</label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={closeModal} disabled={processing}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingOlimpiada ? 'Actualizar' : 'Crear'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <PhasesManagementSheet
                olimpiada={selectedOlimpiada}
                definiciones_evaluacion={definiciones_evaluacion}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </AppLayout>
    );
};

export default Index;