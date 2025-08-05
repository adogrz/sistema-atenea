import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEventColumns } from '@/components/event-columns';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { Description } from '@radix-ui/react-dialog';
import { ColumnFiltersState } from '@tanstack/react-table';
import { Calendar, Plus, Edit, Trash2, X, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

interface Event {
    id: number;
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description?: string;
    location?: string;
    status: 'active' | 'inactive' | 'completed';
    created_at: string;
}

interface EventForm extends Record<string, string> {
    name: string;
    type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    description: string;
    location: string;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Administrador Académico', href: '/dashboard/academico' },
];

const EVENT_TYPES = [
    { value: 'registro-aspirantes', label: 'Registro de Aspirantes' },
    { value: 'inscripcion', label: 'Inscripción' },
    { value: 'academia-sabatina', label: 'Academia Sabatina' },
    { value: 'fin-de-mes', label: 'Fin de Mes' },
    { value: 'fdtc', label: 'FDTC' },
    { value: 'fin-de-semana', label: 'Fin de Semana' },
    { value: 'examen', label: 'Examen' },
    { value: 'graduacion', label: 'Graduación' },
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

    // Estados
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) || null : null;

    // Formulario para agregar/editar eventos
    const { data, setData, post, put, processing, errors, reset } = useForm<EventForm>({
        name: '',
        type: '',
        start_date: '',
        end_date: '',
        start_time: '09:00',
        end_time: '17:00',
        description: '',
        location: '',
    });

    const handleAddEvent = () => {
        post('/dashboard/events', {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const handleEditEvent = () => {
        if (selectedEventId) {
            put(`/dashboard/events/${selectedEventId}`, {
                onSuccess: () => {
                    setShowEditModal(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteEvent = () => {
        if (selectedEventId) {
            router.delete(`/dashboard/events/${selectedEventId}`, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setSelectedEventId(null);
                },
            });
        }
    };

    const openEditModal = () => {
        if (selectedEvent) {
            setData({
                name: selectedEvent.name,
                type: selectedEvent.type,
                start_date: selectedEvent.start_date,
                end_date: selectedEvent.end_date,
                start_time: selectedEvent.start_time,
                end_time: selectedEvent.end_time,
                description: selectedEvent.description || '',
                location: selectedEvent.location || '',
            });
            setShowEditModal(true);
        }
    };

    const handleClearAllFilters = () => {
        setColumnFilters([]);
    };

    const columns = getEventColumns(events, selectedEventId, setSelectedEventId);

    // Estadísticas
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'active').length;
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date()).length;

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
                            onClick={() => setShowAddModal(true)}
                            disabled={!canCreateEvent}
                        >
                            <Plus className="h-4 w-4" />
                            <span>Agregar Evento</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                            onClick={openEditModal}
                            disabled={!selectedEventId || !canEditEvent}
                        >
                            <Edit className="h-4 w-4" />
                            <span>Editar Evento</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 text-red-600 hover:text-red-600"
                            onClick={() => setShowDeleteModal(true)}
                            disabled={!selectedEventId || !canDeleteEvent}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar Evento</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-2" onClick={handleClearAllFilters}>
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
                            <span className="text-2xl font-bold text-blue-600">{upcomingEvents}</span>
                            <span className="text-muted-foreground">Próximos</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-4">
                            <span className="text-2xl font-bold text-gray-600">{completedEvents}</span>
                            <span className="text-muted-foreground">Completados</span>
                        </div>
                    </div>

                    {/* Tabla de eventos */}
                    <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
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

                    {/* ...resto de modales igual... */}
                </div>
            </div>
        </AppLayout>
    );
}