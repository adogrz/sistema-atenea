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
    RowSelectionState
} from '@tanstack/react-table';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from './data-table-pagination';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableMultiSelectProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    getRowId?: (row: TData) => string | number;
    columnFilters: ColumnFiltersState;
    setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
    selectedRowIds: number[];
    onRowSelectionChange: Dispatch<SetStateAction<number[]>>;
}

export function DataTableMultiSelect<TData, TValue>({
    columns,
    data,
    getRowId = (row: TData) => (row as { id: string | number }).id,
    columnFilters,
    setColumnFilters,
    selectedRowIds,
    onRowSelectionChange
}: DataTableMultiSelectProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    // Sincronizar rowSelection con selectedRowIds al montar y cuando cambian
    useEffect(() => {
        const newSelection: RowSelectionState = {};
        selectedRowIds.forEach(id => {
            newSelection[id.toString()] = true;
        });
        setRowSelection(newSelection);
    }, [selectedRowIds]);

    // Notificar cambios de selección al componente padre
    useEffect(() => {
        const selectedIds = Object.keys(rowSelection)
            .filter(key => rowSelection[key])
            .map(key => Number(key));
        
        // Solo actualizar si hay cambios reales para evitar loops infinitos
        const currentSorted = [...selectedRowIds].sort((a, b) => a - b);
        const newSorted = [...selectedIds].sort((a, b) => a - b);
        
        if (JSON.stringify(currentSorted) !== JSON.stringify(newSorted)) {
            onRowSelectionChange(selectedIds);
        }
    }, [rowSelection]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
            columnFilters,
            columnVisibility,
            rowSelection
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        enableRowSelection: true,
        getRowId: (row) => getRowId(row).toString()
    });

    const handleRowClick = (row: any, event: React.MouseEvent) => {
        // Evitar toggle si se hizo clic en un botón, link o checkbox
        const target = event.target as HTMLElement;
        if (
            target.closest('button') || 
            target.closest('a') || 
            target.closest('input[type="checkbox"]') ||
            target.closest('[data-no-select]')
        ) {
            return;
        }

        // Toggle de selección
        row.toggleSelected();
    };

    return (
        <div>
            {/* Búsqueda Global */}
            <div className="flex items-center py-4">
                <Input
                    type="search"
                    placeholder="Buscar..."
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? 'selected' : undefined}
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