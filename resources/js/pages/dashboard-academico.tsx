import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { getEventColumns } from '@/components/event-columns';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Description } from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Event {
    id: number;
    nombre: string;
    clasificacion: string;
    fecha_inicio: string;
    fecha_fin: string;
    hora_inicio: string;
    hora_fin: string;
    descripcion?: string;
    ubicacion?: string;
    estado: 'activo' | 'inactivo' | 'completado';
    created_at: string;
    updated_at: string;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Administrador Académico', href: '/dashboard/academico' },
];

export default function DashboardAcademico() {
    const { hasPermission } = usePermissions();
    const { events, auth } = usePage<{
        events: Array<Event>;
        auth: { user: any };
    }>().props;

    // Permisos
    const canCreateEvent = hasPermission('events:create');
    const canEditEvent = hasPermission('events:edit');
    const canDeleteEvent = hasPermission('events:delete');
    const canViewEvents = hasPermission('events:view');

    // Estados
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) || null : null;

    // Función para editar evento
    const handleEdit = () => {
        if (!canEditEvent) {
            alert('No tienes permisos para editar eventos');
            return;
        }
        
        if (!selectedEventId) {
            alert('Por favor selecciona un evento primero');
            return;
        }
        
        router.get(`/dashboard/academic-forms/${selectedEventId}/edit`);
    };

    // Función para eliminar evento
    const handleDelete = () => {
        if (!canDeleteEvent) {
            alert('No tienes permisos para eliminar eventos');
            return;
        }

        if (selectedEventId) {
            router.delete(`/dashboard/academic-forms/${selectedEventId}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedEventId(null);
                },
                onError: (errors) => {
                    console.error('Error al eliminar:', errors);
                },
            });
        }
    };

    // Función para crear evento
    const handleCreate = () => {
        if (!canCreateEvent) {
            alert('No tienes permisos para crear eventos');
            return;
        }
        router.get('/dashboard/academic-forms/create-event');
    };

    // Función para limpiar filtros
    const handleClearAllFilters = () => {
        setColumnFilters([]);
    };

    const columns = getEventColumns(events, selectedEventId, setSelectedEventId);

    // Estadísticas
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.estado === 'activo').length;
    const inactiveEvents = events.filter(e => e.estado === 'inactivo').length;
    const completedEvents = events.filter(e => e.estado === 'completado').length;

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Panel Administrador Académico" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="admin-panel">
                    {/* Barra de herramientas */}
                    <div className="mb-2 flex items-center gap-2 rounded-lg border bg-background p-2">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={handleCreate}
                            disabled={!canCreateEvent}
                            title={!canCreateEvent ? "No tienes permisos para crear eventos" : "Crear nuevo evento"}
                            asChild
                        >
                            <Link href="/dashboard/academic-forms/create-event" className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                <span>Agregar Evento</span>
                            </Link>
                        </Button>
                        
                        <Button 
                            onClick={handleEdit}
                            disabled={!selectedEventId || !canEditEvent}
                            variant="outline"
                            title={!canEditEvent ? "No tienes permisos para editar eventos" : !selectedEventId ? "Selecciona un evento primero" : "Editar evento seleccionado"}
                        >
                            <Edit className="h-4 w-4" />
                            Editar Evento
                        </Button>
                        
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-red-600 hover:text-red-600"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={!selectedEventId || !canDeleteEvent}
                            title={!canDeleteEvent ? "No tienes permisos para eliminar eventos" : !selectedEventId ? "Selecciona un evento primero" : "Eliminar evento seleccionado"}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar Evento</span>
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            className="flex items-center gap-2" 
                            onClick={handleClearAllFilters}
                        >
                            <X className="h-4 w-4" />
                            <span>Limpiar Filtros</span>
                        </Button>
                    </div>

                    {/* Estadísticas */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                            <span className="text-2xl font-bold">{totalEvents}</span>
                            <span className="text-muted-foreground">Total Eventos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                            <span className="text-2xl font-bold text-green-600">{activeEvents}</span>
                            <span className="text-muted-foreground">Activos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                            <span className="text-2xl font-bold text-red-600">{inactiveEvents}</span>
                            <span className="text-muted-foreground">Inactivos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                            <span className="text-2xl font-bold text-gray-600">{completedEvents}</span>
                            <span className="text-muted-foreground">Completados</span>
                        </div>
                    </div>

                    {/* Tabla de eventos */}
                    <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <DataTable
                            columns={columns}
                            data={events}
                            selectedRowId={selectedEventId}
                            onRowClick={(event) => setSelectedEventId(event.id)}
                            getRowId={(event) => event.id}
                            columnFilters={columnFilters}
                            setColumnFilters={setColumnFilters}
                        />
                    </div>

                    {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
                    <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Eliminar evento?</DialogTitle>
                            </DialogHeader>
                            <Description className="mb-4">
                                <p className="mb-1">ID: {selectedEventId}</p>
                                <p className="mb-1">Nombre: {selectedEvent?.nombre}</p>
                                <p className="mb-1">Tipo: {selectedEvent?.clasificacion}</p>
                                <p className="mb-1">Estado: {selectedEvent?.estado}</p>
                                <p className="mb-1">Fecha: {selectedEvent?.fecha_inicio && new Date(selectedEvent.fecha_inicio).toLocaleDateString('es-ES')}</p>
                            </Description>
                            <p>Esta acción no se puede deshacer. El evento seleccionado será eliminado permanentemente del sistema.</p>
                            <DialogFooter className="flex justify-end gap-2 pt-4">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                    Eliminar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>
        </AppLayout>
    );
}