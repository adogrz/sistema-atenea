import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type Log = {
  id: number;
  log_name: string | null;
  description: string;
  causer?: { name?: string } | null;
  properties?: { event?: string } | null;
  created_at: string;
};

export function getLogColumns(logs: Log[]): ColumnDef<Log>[] {
  const uniqueTypes = Array.from(
    new Set(logs.map((log) => log.log_name ?? "General"))
  ).filter((type) => typeof type === "string" && type.trim() !== "");
  
  const uniqueEvents = Array.from(
    new Set(logs.map((log) => log.properties?.event ?? "Sin evento"))
  ).filter((event) => typeof event === "string" && event.trim() !== "");

  return [
    {
      accessorKey: "causer.name",
      header: "Usuario", // Simple texto, sin dropdown
      cell: ({ row }) => row.original.causer?.name ?? "Desconocido",
    },
    {
      accessorKey: "log_name",
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
      cell: ({ row }) => row.original.log_name ?? "General",
      filterFn: "equalsString",
    },
    {
      accessorKey: "properties.event",
      header: ({ column }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              {column.getFilterValue()
                ? `Evento: ${column.getFilterValue()}`
                : "Filtrar por evento"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>
              Todos
            </DropdownMenuItem>
            {uniqueEvents.map((event) => (
              <DropdownMenuItem key={event} onClick={() => column.setFilterValue(event)}>
                {event}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      cell: ({ row }) => row.original.properties?.event ?? "Sin evento",
      filterFn: "equalsString",
    },
    {
      accessorKey: "description",
      header: "Descripción",
    },
    {
      accessorKey: "created_at",
      header: "Fecha",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
  ];
}