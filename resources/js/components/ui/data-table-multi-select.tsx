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
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface DataTableMultiSelectProps<TData, TValue, TRowId = number> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    selectedRowIds: TRowId[];
    onRowSelectionChange: React.Dispatch<React.SetStateAction<TRowId[]>>;
    getRowId?: (row: TData) => TRowId;
    columnFilters?: ColumnFiltersState;
    setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

export function DataTableMultiSelect<TData, TValue, TRowId = number>({
    columns,
    data,
    selectedRowIds,
    onRowSelectionChange,
    getRowId,
    columnFilters = [],
    setColumnFilters,
}: DataTableMultiSelectProps<TData, TValue, TRowId>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);

    const rowSelection = React.useMemo(() => {
        const selection: Record<string, boolean> = {};
        selectedRowIds.forEach((id) => {
            selection[String(id)] = true;
        });
        return selection;
    }, [selectedRowIds]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            columnFilters,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: (updater) => {
            const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
            const newSelectedIds = Object.keys(newSelection)
                .filter((key) => newSelection[key])
                .map((key) => {
                    const parsedId = getRowId
                        ? (key as TRowId)
                        : (isNaN(Number(key)) ? key : Number(key)) as TRowId;
                    return parsedId;
                });
            onRowSelectionChange(newSelectedIds as TRowId[]);
        },
        getRowId: getRowId ? (row) => String(getRowId(row)) : undefined,
        initialState: {
            pagination: {
                pageSize: 10,
            },
        }
    });

    const handleRowClick = (row: any, event: React.MouseEvent) => {
        // No hacer nada si el clic fue en un elemento con data-no-select
        if ((event.target as HTMLElement).closest('[data-no-select]')) {
            return;
        }
        
        // Toggle la selección de la fila
        row.toggleSelected();
    };

    return (
        <div className="space-y-4">
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
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    onClick={(e) => handleRowClick(row, e)}
                                    className="cursor-pointer"
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
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {selectedRowIds.length} de {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <div className="text-sm">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}