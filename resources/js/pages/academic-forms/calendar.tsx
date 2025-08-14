import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface EventWithPosition extends Event {
    dayPosition: 'start' | 'middle' | 'end' | 'single';
    durationDays: number;
}

const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Académico', href: '/dashboard/academico' },
    { title: 'Calendario', href: '/dashboard/calendario' },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
    'registro-aspirantes': 'Registro de Aspirantes',
    'inscripcion': 'Inscripción',
    'academia-sabatina': 'Academia Sabatina',
    'fin-de-mes': 'Fin de Mes',
    'fdtc': 'FDTC',
    'fin-de-semana': 'Fin de Semana',
    'examen': 'Examen',
    'graduacion': 'Graduación',
};

const EVENT_COLORS: Record<string, string> = {
    'registro-aspirantes': 'bg-blue-500',
    'inscripcion': 'bg-green-500',
    'academia-sabatina': 'bg-purple-500',
    'fin-de-mes': 'bg-orange-500',
    'fdtc': 'bg-red-500',
    'fin-de-semana': 'bg-yellow-500',
    'examen': 'bg-pink-500',
    'graduacion': 'bg-indigo-500',
};

const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarioPage() {
    const { events } = usePage<{
        events: Array<Event>;
    }>().props;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Convertir Date a formato YYYY-MM-DD
    const formatDateToString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Crear una fecha a partir de una cadena en formato YYYY-MM-DD
    const createDateFromString = (dateString: string): Date => {
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Mes 0-indexado
            const day = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return new Date(dateString);
    };

    // Formatear una fecha para mostrar
    const formatDateDisplay = (dateString: string): string => {
        if (!dateString) return 'No especificada';
        
        const date = createDateFromString(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Generar todas las fechas entre dos fechas
    const getAllDatesBetween = (startDateStr: string, endDateStr: string): string[] => {
        const dates = [];
        const startDate = createDateFromString(startDateStr);
        const endDate = createDateFromString(endDateStr);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dates.push(formatDateToString(d));
        }
        
        return dates;
    };

    // Obtener días del mes
    const getDaysInMonth = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayOfWeek = firstDay.getDay();

        const days = [];

        // Días del mes anterior
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevDate = new Date(currentYear, currentMonth, -i);
            days.push({
                date: prevDate,
                isCurrentMonth: false,
                day: prevDate.getDate(),
                dateStr: formatDateToString(prevDate),
            });
        }

        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(currentYear, currentMonth, day);
            days.push({
                date: currentDate,
                isCurrentMonth: true,
                day,
                dateStr: formatDateToString(currentDate),
            });
        }

        // Días del mes siguiente para completar la grilla
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            const nextDate = new Date(currentYear, currentMonth + 1, day);
            days.push({
                date: nextDate,
                isCurrentMonth: false,
                day: nextDate.getDate(),
                dateStr: formatDateToString(nextDate),
            });
        }

        return days;
    }, [currentMonth, currentYear]);

    // Obtener eventos para una fecha específica
    const getEventsForDate = (dateStr: string): EventWithPosition[] => {
        return events
            .filter(event => event.estado === 'activo')
            .map(event => {
                // Generar todas las fechas del evento
                const eventDates = getAllDatesBetween(event.fecha_inicio, event.fecha_fin);
                
                // Verificar si la fecha actual está en el evento
                if (!eventDates.includes(dateStr)) {
                    return null;
                }

                // Determinar posición
                const durationDays = eventDates.length;
                let dayPosition: 'start' | 'middle' | 'end' | 'single';

                const startDateFormatted = event.fecha_inicio;
                const endDateFormatted = event.fecha_fin;

                if (durationDays === 1) {
                    dayPosition = 'single';
                } else if (dateStr === startDateFormatted) {
                    dayPosition = 'start';
                } else if (dateStr === endDateFormatted) {
                    dayPosition = 'end';
                } else {
                    dayPosition = 'middle';
                }

                return {
                    ...event,
                    dayPosition,
                    durationDays
                };
            })
            .filter(event => event !== null) as EventWithPosition[];
    };

    // Obtener estilos CSS para eventos multi-día
    const getEventStyles = (event: EventWithPosition) => {
        const baseColor = EVENT_COLORS[event.clasificacion] || 'bg-gray-500';
        
        let finalClasses = '';
        switch (event.dayPosition) {
            case 'single':
                finalClasses = `w-full text-left px-2 py-1 text-xs text-white hover:opacity-90 transition-opacity cursor-pointer ${baseColor} rounded-lg min-h-[24px] flex items-center font-medium`;
                break;
            case 'start':
                finalClasses = `w-full text-left px-2 py-1 text-xs text-white hover:opacity-90 transition-opacity cursor-pointer ${baseColor} rounded-l-lg min-h-[24px] flex items-center font-medium`;
                break;
            case 'middle':
                finalClasses = `w-full text-left px-2 py-1 text-xs text-white hover:opacity-90 transition-opacity cursor-pointer ${baseColor} min-h-[24px] flex items-center font-medium`;
                break;
            case 'end':
                finalClasses = `w-full text-left px-2 py-1 text-xs text-white hover:opacity-90 transition-opacity cursor-pointer ${baseColor} rounded-r-lg min-h-[24px] flex items-center font-medium`;
                break;
            default:
                finalClasses = `w-full text-left px-2 py-1 text-xs text-white hover:opacity-90 transition-opacity cursor-pointer ${baseColor} rounded-lg min-h-[24px] flex items-center font-medium`;
        }
        
        return finalClasses;
    };
    
    // Obtener texto según la posición
    const getEventText = (event: EventWithPosition) => {
        switch (event.dayPosition) {
            case 'single':
                return event.nombre;
            case 'start':
                return event.nombre;
            case 'middle':
                return '';
            case 'end':
                return '';
            default:
                return event.nombre;
        }
    };

    // Navegación del calendario
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleEventClick = (event: Event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Estadísticas
    const activeEvents = events.filter(e => e.estado === 'activo');
    const registroEvents = activeEvents.filter(e => e.clasificacion === 'registro-aspirantes' || e.clasificacion === 'graduacion');
    const inscripcionEvents = activeEvents.filter(e => e.clasificacion === 'inscripcion');
    const sabatinaEvents = activeEvents.filter(e => e.clasificacion === 'academia-sabatina');
    const examenEvents = activeEvents.filter(e => e.clasificacion === 'examen' || e.clasificacion === 'fdtc');

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title="Calendario Académico" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-7xl">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight">Calendario Académico</h1>
                        <p className="text-muted-foreground">
                            Visualiza todos los eventos académicos programados
                        </p>
                    </div>

                    {/* Calendario */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Calendario</CardTitle>
                                    <CardDescription>
                                        Vista mensual de eventos académicos
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="min-w-[140px] text-center">
                                        <span className="text-lg font-semibold">
                                            {MONTHS[currentMonth]} {currentYear}
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Header de días */}
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {WEEKDAYS.map((day) => (
                                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {getDaysInMonth.map((dayInfo, index) => {
                                    const dayEvents = getEventsForDate(dayInfo.dateStr);
                                    const isCurrentDay = isToday(dayInfo.date);

                                    return (
                                        <div
                                            key={index}
                                            className={`
                                                min-h-[100px] p-1 border rounded-lg relative
                                                ${dayInfo.isCurrentMonth 
                                                    ? 'bg-background' 
                                                    : 'bg-muted/30'
                                                }
                                                ${isCurrentDay 
                                                    ? 'ring-2 ring-primary bg-primary/5' 
                                                    : ''
                                                }
                                                hover:bg-muted/50 transition-colors
                                            `}
                                        >
                                            <div className={`
                                                text-sm font-medium mb-1
                                                ${dayInfo.isCurrentMonth 
                                                    ? 'text-foreground' 
                                                    : 'text-muted-foreground'
                                                }
                                                ${isCurrentDay ? 'text-primary' : ''}
                                            `}>
                                                {dayInfo.day}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                {dayEvents.slice(0, 3).map((event, eventIndex) => {
                                                    const eventText = getEventText(event);
                                                    
                                                    return (
                                                        <button
                                                            key={`${event.id}-${dayInfo.dateStr}-${eventIndex}`}
                                                            onClick={() => handleEventClick(event)}
                                                            className={getEventStyles(event)}
                                                            title={`${event.nombre} (${formatDateDisplay(event.fecha_inicio)} - ${formatDateDisplay(event.fecha_fin)})`}
                                                        >
                                                            <span className="truncate w-full text-white">
                                                                {eventText || '\u00A0'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                                {dayEvents.length > 3 && (
                                                    <div className="text-xs text-muted-foreground">
                                                        +{dayEvents.length - 3} más
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t">
                                <h4 className="text-sm font-medium mb-3">Tipos de eventos:</h4>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                                        <div key={key} className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded ${EVENT_COLORS[key] || 'bg-gray-500'}`} />
                                            <span className="text-sm text-muted-foreground">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                    <p><strong>Eventos multi-día:</strong> Se muestran como barras continuas conectadas entre los días que duran.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modal de detalles */}
            <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Detalles del Evento
                        </DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">{selectedEvent.nombre}</h3>
                                <Badge variant="outline" className="mt-1">
                                    {EVENT_TYPE_LABELS[selectedEvent.clasificacion] || selectedEvent.clasificacion}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {formatDateDisplay(selectedEvent.fecha_inicio)} - {formatDateDisplay(selectedEvent.fecha_fin)}
                                    </span>
                                    <Badge variant="secondary" className="ml-2">
                                        {getAllDatesBetween(selectedEvent.fecha_inicio, selectedEvent.fecha_fin).length} días
                                    </Badge>
                                </div>

                                {(selectedEvent.hora_inicio || selectedEvent.hora_fin) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {selectedEvent.hora_inicio && selectedEvent.hora_fin
                                                ? `${selectedEvent.hora_inicio} - ${selectedEvent.hora_fin}`
                                                : selectedEvent.hora_inicio || 'No especificada'
                                            }
                                        </span>
                                    </div>
                                )}

                                {selectedEvent.ubicacion && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{selectedEvent.ubicacion}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${
                                        selectedEvent.estado === 'activo' ? 'bg-green-500' :
                                        selectedEvent.estado === 'inactivo' ? 'bg-red-500' :
                                        'bg-gray-500'
                                    }`} />
                                    <span className="capitalize">{selectedEvent.estado}</span>
                                </div>
                            </div>

                            {selectedEvent.descripcion && (
                                <div>
                                    <h4 className="font-medium mb-1">Descripción:</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEvent.descripcion}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}