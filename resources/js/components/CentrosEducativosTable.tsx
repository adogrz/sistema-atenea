import React, { useState } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    ColumnFiltersState,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DataTableColumnHeader } from './ui/data-table-column-header';

interface CentroEducativo {
    codigo: string;
    nombre: string;
    departamento: string;
    distrito: string;
    sector: string;
    zona: string;
}

interface CentrosEducativosTableProps {
    centros: CentroEducativo[];
}

const CentrosEducativosTable: React.FC<CentrosEducativosTableProps> = ({ centros }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const columns: ColumnDef<CentroEducativo>[] = [
        {
            accessorKey: 'codigo',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Código" />,
        },
        {
            accessorKey: 'nombre',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
        },
        {
            accessorKey: 'departamento',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Departamento" />,
        },
        {
            accessorKey: 'distrito',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Distrito" />,
        },
        {
            accessorKey: 'sector',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Sector" />,
            cell: ({ row }) => {
                const sector = row.getValue('sector') as string;
                return <Badge variant={sector === 'PÚBLICO' ? 'secondary' : 'default'}>{sector}</Badge>;
            },
        },
        {
            accessorKey: 'zona',
            header: ({ column }) => <DataTableColumnHeader column={column} title="Zona" />,
            cell: ({ row }) => {
                const zona = row.getValue('zona') as string;
                return <Badge variant={zona === 'Urbana' ? 'outline' : 'default'}>{zona}</Badge>;
            },
        },
    ];

    const table = useReactTable({
        data: centros,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader>
                <CardTitle>Centros Educativos Existentes</CardTitle>
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Filtrar por nombre..."
                        value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('nombre')?.setFilterValue(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <div className="flex-grow overflow-y-auto rounded-md border">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
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
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
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
                <div className="flex items-center justify-between space-x-2 py-4 mt-auto">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} de {table.getCoreRowModel().rows.length} registros.
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Filas por página</p>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Primera página</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Página anterior</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Siguiente página</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Última página</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CentrosEducativosTable;
