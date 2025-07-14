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

export type Event = {
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
};

export function getEventColumns(
  events: Event[],
  selectedEventId: number | null,
  setSelectedEventId: (id: number) => void
): ColumnDef<Event>[] {
  const uniqueTypes = Array.from(new Set(events.map(e => e.type)));
  const uniqueStatuses = Array.from(new Set(events.map(e => e.status)));

  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: "Nombre del Evento",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "type",
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
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("type")}</Badge>
      ),
      filterFn: "equalsString",
    },
    {
      accessorKey: "start_date",
      header: "Fecha",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{new Date(row.getValue("start_date")).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "start_time",
      header: "Hora",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{row.getValue("start_time")} - {row.original.end_time}</span>
        </div>
      ),
    },
    {
      accessorKey: "location",
      header: "Ubicación",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{row.getValue("location") || "No especificada"}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
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
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant={status === 'activo' ? 'default' : status === 'completado' ? 'secondary' : 'outline'}
          >
            {status}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
  ];
}