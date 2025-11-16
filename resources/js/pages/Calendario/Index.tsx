import React, { useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { type BreadcrumbItem, FaseOlimpiada } from '@/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { EventDropArg } from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';
import { toast } from 'sonner';
import { FaseGestionModal } from '@/components/FaseGestionModal';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPageProps {
    events: EventInput[];
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: route('dashboard') },
    { title: 'Olimpiadas', href: route('olimpiadas.index') },
    { title: 'Calendario de Fases' },
];

export default function CalendarioPage({ events: initialEvents }: CalendarPageProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFase, setEditingFase] = useState<FaseOlimpiada | null>(null);
    const calendarRef = useRef<FullCalendar>(null);

    const handleEventDrop = (info: EventDropArg) => {
        const { event } = info;
        const faseId = Number(event.id);
        const newStartDate = event.startStr.split('T')[0];
        const newEndDate = event.endStr ? new Date(event.endStr).toISOString().split('T')[0] : newStartDate;

        // Revert the event's position if the update fails
        info.revert();

        router.put(route('fases.gestion.update', { fase: faseId }), {
            fecha_inicio: newStartDate,
            fecha_fin: newEndDate,
            // Keep other properties as they are not changed by drag-and-drop
            cupos: event.extendedProps?.cupos,
            nota_minima_aprobacion: event.extendedProps?.nota_minima_aprobacion,
        }, {
            onSuccess: () => {
                toast.success('Fechas de fase actualizadas exitosamente.');
                // Manually update the event in the calendar if successful
                if (calendarRef.current) {
                    const calendarApi = calendarRef.current.getApi();
                    const calendarEvent = calendarApi.getEventById(event.id);
                    if (calendarEvent) {
                        calendarEvent.setDates(event.start, event.end);
                    }
                }
            },
            onError: (err) => {
                toast.error('Error al actualizar las fechas de la fase.');
                console.error(err);
            },
            preserveScroll: true,
        });
    };

    const handleEventClick = (info: any) => {
        const { event } = info;
        const fase: FaseOlimpiada = {
            id: Number(event.id),
            nombre: event.extendedProps?.fase_nombre || event.title,
            orden: 0, // Not relevant for this modal
            cupos: event.extendedProps?.cupos,
            nota_minima_aprobacion: event.extendedProps?.nota_minima_aprobacion,
            fecha_inicio: event.startStr.split('T')[0],
            fecha_fin: event.endStr ? new Date(event.endStr).toISOString().split('T')[0] : event.startStr.split('T')[0],
            activa: true, // Default or fetch from backend if needed
            observaciones: '', // Default or fetch from backend if needed
            olimpiada: {
                id: 0, // Not relevant for this modal
                nombre: event.extendedProps?.olimpiada_nombre || '',
                descripcion: null,
                area_id: 0,
                activa: true,
                created_at: '',
                updated_at: '',
                nivel_educativo_id: 0,
                tipo: 'nivel',
                anio: 0,
            }
        };
        setEditingFase(fase);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setEditingFase(null);
        // Refresh the page to get updated data after modal close
        router.reload({ preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Calendario de Fases" />
            <div className="p-4 md:p-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center">
                        <CalendarIcon className="mr-2 h-6 w-6" />
                        Calendario de Fases de Olimpiadas
                    </h2>
                    <p className="text-muted-foreground mt-2">
                        Visualiza y gestiona las fechas de las fases de las olimpiadas.
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek,dayGridDay'
                        }}
                        locale="es"
                        editable={true}
                        selectable={true}
                        droppable={true}
                        events={initialEvents}
                        eventDrop={handleEventDrop}
                        eventClick={handleEventClick}
                        eventContent={(arg) => (
                            <div className="fc-event-main-frame p-1 text-xs">
                                <div className="fc-event-title-container">
                                    <div className="fc-event-title fc-sticky">{arg.event.title}</div>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>

            <FaseGestionModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                fase={editingFase}
                onUpdate={() => { /* Data is refreshed by router.reload in handleCloseModal */ }}
            />
        </AppLayout>
    );
}
