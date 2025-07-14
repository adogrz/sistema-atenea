import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { MultiSelectColumnFilter } from "@/components/ui/multi-select-column-filter";
import { Dispatch, SetStateAction } from "react";

export type Log = {
  id: number;
  log_name: string | null;
  description: string;
  causer?: { name?: string } | null;
  properties?: { event?: string } | null;
  created_at: string;
};

export function getLogColumns(
  logs: Log[],
  selectedTypes: string[],
  setSelectedTypes: Dispatch<SetStateAction<string[]>>,
  selectedEvents: string[],
  setSelectedEvents: Dispatch<SetStateAction<string[]>>
): ColumnDef<Log>[] {
  const uniqueTypes = Array.from(
    new Set(logs.map((log) => log.log_name ?? "General"))
  ).filter((type) => typeof type === "string" && type.trim() !== "");

  const uniqueEvents = Array.from(
    new Set(logs.map((log) => log.properties?.event ?? "Sin evento"))
  ).filter((event) => typeof event === "string" && event.trim() !== "");

  return [
    {
      id: "id_column", // Columna dummy para alinear
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" enableDropdown={false} enableSorting={false} />
      ),
      cell: ({ row }) => row.original.id,
      size: 60, // Ancho fijo similar a la columna de selección de usuarios
      enableSorting: false,
      enableHiding: false,
      meta: { title: "#" },
    },
    {
      accessorKey: "causer.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Usuario" />
      ),
      cell: ({ row }) => row.original.causer?.name ?? "Desconocido",
      filterFn: (row, id, value) => {
        return (row.original.causer?.name ?? "Desconocido").toLowerCase().includes(String(value).toLowerCase());
      },
      meta: { title: "Usuario" },
    },
    {
      id: "log_name",
      accessorKey: "log_name",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Tipo"
          filterComponent={
            <MultiSelectColumnFilter
              column={column}
              selectedValues={selectedTypes}
              setSelectedValues={setSelectedTypes}
              options={uniqueTypes}
              placeholder="Filtrar por tipo..."
            />
          }
          onClearFilter={() => {
            setSelectedTypes([]);
            column.setFilterValue(undefined);
          }}
        />
      ),
      cell: ({ row }) => row.original.log_name ?? "General",
      filterFn: (row, id, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const logName = row.original.log_name ?? "General";
        return filterValue.includes(logName);
      },
      meta: { title: "Tipo" },
    },
    {
      id: "event",
      accessorKey: "properties.event",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Evento"
          filterComponent={
            <MultiSelectColumnFilter
              column={column}
              selectedValues={selectedEvents}
              setSelectedValues={setSelectedEvents}
              options={uniqueEvents}
              placeholder="Filtrar por evento..."
            />
          }
          onClearFilter={() => {
            setSelectedEvents([]);
            column.setFilterValue(undefined);
          }}
        />
      ),
      cell: ({ row }) => row.original.properties?.event ?? "Sin evento",
      filterFn: (row, id, filterValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        const event = row.original.properties?.event ?? "Sin evento";
        return filterValue.includes(event);
      },
      meta: { title: "Evento" },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Descripción" />
      ),
      filterFn: (row, id, value) => {
        return row.original.description.toLowerCase().includes(String(value).toLowerCase());
      },
      meta: { title: "Descripción" },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha" />
      ),
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
      filterFn: (row, id, value) => {
        return new Date(row.original.created_at).toLocaleString().toLowerCase().includes(String(value).toLowerCase());
      },
      meta: { title: "Fecha" },
    },
  ];
}