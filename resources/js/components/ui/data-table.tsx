import React from 'react';
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    VisibilityState,
    Row
} from '@tanstack/react-table';
import { Dispatch, SetStateAction, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DataTablePagination } from './data-table-pagination';

import { DataTableToolbar } from './data-table-toolbar';

// Definición de las propiedades del componente DataTable
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    selectedRowId?: number | string | null;
    onRowClick?: (row: TData) => void;
    getRowId?: (row: TData) => string | number;
    columnFilters: ColumnFiltersState;
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
    globalFilter?: string;
    onGlobalFilterChange?: (value: string) => void;
    searchPlaceholder?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    selectedRowId,
    onRowClick,
    getRowId = (row: TData) => (row as { id: string | number }).id,
    columnFilters,
    setColumnFilters,
    globalFilter: externalGlobalFilter,
    onGlobalFilterChange: externalOnGlobalFilterChange,
    searchPlaceholder = 'Buscar...',
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    // Usar el filtro externo si existe, sino el interno
    const globalFilter = externalGlobalFilter !== undefined ? externalGlobalFilter : internalGlobalFilter;
    const setGlobalFilter = externalOnGlobalFilterChange || setInternalGlobalFilter;

    // Si hay un handler externo, significa que el filtrado es del lado del servidor
    const isServerSideFiltering = externalOnGlobalFilterChange !== undefined;

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility,
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        // Solo usar filtrado del cliente si NO es filtrado del servidor
        ...(isServerSideFiltering ? {} : { getFilteredRowModel: getFilteredRowModel() }),
        // Deshabilitar el filtrado automático del cliente cuando es del servidor
        manualFiltering: isServerSideFiltering,
    });

    return (
        <div>
            {/* Búsqueda Global */}
            <div className="flex items-center py-4">
                <Input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                <DataTableViewOptions table={table} />
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow
                                        data-state={selectedRowId === getRowId(row.original) ? 'selected' : undefined}
                                        onClick={() => onRowClick?.(row.original)}
                                        className="cursor-pointer hover:bg-muted"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length}>
                                                {renderRowSubComponent?.({ row })}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
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
            <div className="mt-2">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
