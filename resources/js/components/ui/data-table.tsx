"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Definición de las propiedades del componente DataTable
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  selectedRowId?: number | string | null;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string | number;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  selectedRowId,
  onRowClick,
  getRowId = (row: any) => row.id,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(10); // Nuevo estado para el tamaño de página
  const [pageIndex, setPageIndex] = useState(0); // Nuevo estado para el índice de página

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      columnVisibility,
      pagination: { pageIndex, pageSize }, // Controla ambos estados
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: (updater) => {
      // Maneja el cambio de paginación correctamente
      if (typeof updater === "function") {
        setPageIndex((prevPageIndex) => {
          const result = updater({ pageIndex: prevPageIndex, pageSize });
          return result.pageIndex ?? prevPageIndex;
        });
        setPageSize((prevPageSize) => {
          const result = updater({ pageIndex, pageSize: prevPageSize });
          return result.pageSize ?? prevPageSize;
        });
      } else if (typeof updater === "object") {
        if (typeof updater.pageIndex === "number") setPageIndex(updater.pageIndex);
        if (typeof updater.pageSize === "number") setPageSize(updater.pageSize);
      }
    },
    initialState: {
      pagination: { pageIndex, pageSize },
    },
  });

  // Cuando el usuario cambia el tamaño de página
  const handlePageSizeChange = (value: string) => {
    const size = Number(value);
    setPageSize(size);
    setPageIndex(0); // Reinicia a la primera página al cambiar el tamaño
    table.setPageSize(size);
    table.setPageIndex(0);
  };

  return (
    <div className="space-y-4 m-3">
      {/* Búsqueda Global */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="pl-9"
        />
      </div>
      {/* Tabla */}
      <div className="rounded-md border w-full overflow-hidden flex flex-col">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedRowId === getRowId(row.original) ? "selected" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                  className="cursor-pointer hover:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Paginación */}
      <div className="flex items-center justify-between space-x-2 py-2 bottom-0">
        <div className="flex items-center gap-2">
          <span className="text-sm">Filas por página:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-auto h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <div className="text-sm text-muted-foreground">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">
        Total de filas: {table.getFilteredRowModel().rows.length}
      </div>
    </div>
  );
}
