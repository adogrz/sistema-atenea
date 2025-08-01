import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Calendar, Clock, MapPin } from "lucide-react";

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

export function getEventColumns(
  events: Event[],
  selectedEventId: number | null,
  setSelectedEventId: (id: number | null) => void
): ColumnDef<Event>[] {
  const uniqueTypes = Array.from(new Set(events.map(e => e.clasificacion)));
  const uniqueStatuses = Array.from(new Set(events.map(e => e.estado)));

  return [
    {
      id: 'radio_select',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="flex justify-center">
            <input
              type="radio"
              name="event-selection"
              checked={selectedEventId === event.id}
              onChange={() => setSelectedEventId(event.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 text-primary"
            />
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
      meta: { title: 'Seleccionar' },
    },
    {
      accessorKey: "nombre",
      header: "Nombre del Evento",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
    {
      accessorKey: "clasificacion",
      header: ({ column }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              {column.getFilterValue()
                ? `Tipo: ${column.getFilterValue()}`
                : "Filtrar por tipo"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
              Todos
            </DropdownMenuItem>
            {uniqueTypes.map((type) => (
              <DropdownMenuItem key={type} onClick={() => column.setFilterValue(type)}>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: ({ row }) => {
        const type = row.getValue("clasificacion") as string;
        const typeLabels: Record<string, string> = {
          'registro-aspirantes': 'Registro de Aspirantes',
          'inscripcion': 'Inscripción',
          'academia-sabatina': 'Academia Sabatina',
          'fin-de-mes': 'Fin de Mes',
          'fdtc': 'FDTC',
          'fin-de-semana': 'Fin de Semana',
          'examen': 'Examen',
          'graduacion': 'Graduación',
        };
        return (
          <Badge variant="outline">{typeLabels[type] || type}</Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "fecha_inicio",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(row.getValue("fecha_inicio")).toLocaleDateString('es-ES')}</span>
        </div>
      ),
    },
    {
      accessorKey: "hora_inicio",
      header: "Hora",
      cell: ({ row }) => {
        const startTime = row.getValue("hora_inicio") as string;
        const endTime = row.original.hora_fin;
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {startTime && endTime 
                ? `${startTime} - ${endTime}` 
                : startTime || 'No especificada'
              }
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "ubicacion",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{row.getValue("ubicacion") || "No especificada"}</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Creado",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("created_at")).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      accessorKey: 'estado',
      header: ({ column }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              {column.getFilterValue()
                ? `Estado: ${column.getFilterValue()}`
                : "Filtrar por estado"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
              Todos
            </DropdownMenuItem>
            {uniqueStatuses.map((status) => (
              <DropdownMenuItem key={status} onClick={() => column.setFilterValue(status)}>
                {status === 'activo' ? 'Activo' : 
                 status === 'inactivo' ? 'Inactivo' : 
                 status === 'completado' ? 'Completado' : status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: ({ row }) => {
        const status = row.getValue('estado') as string;
        const statusConfig = {
          activo: { 
            label: 'Activo', 
            className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            dot: 'bg-green-500'
          },
          inactivo: { 
            label: 'Inactivo', 
            className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            dot: 'bg-red-500'
          },
          completado: { 
            label: 'Completado', 
            className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
            dot: 'bg-gray-500'
          },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactivo;
        
        return (
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${config.className}`}>
            <div className={`h-2 w-2 rounded-full ${config.dot}`} />
            {config.label}
          </span>
        );
      },
      filterFn: "equalsString",
    },
  ];
}