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
    toolbarOptions: {
        areas: { label: string; value: string }[]
        niveles: { label: string; value: string }[]
    };
    renderRowSubComponent?: (props: { row: Row<TData> }) => React.ReactElement;
    getRowCanExpand?: (row: Row<TData>) => boolean;
}

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             selectedRowId,
                                             onRowClick,
                                             getRowId = (row: TData) => (row as { id: string | number }).id,
                                             columnFilters,
                                             setColumnFilters,
                                             toolbarOptions,
                                             renderRowSubComponent,
                                             getRowCanExpand
                                         }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowCanExpand,
    });

    return (
        <div>
            {/* Búsqueda Global */}
            <DataTableToolbar table={table} toolbarOptions={toolbarOptions} />

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
