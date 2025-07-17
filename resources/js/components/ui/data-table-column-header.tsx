import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, FilterIcon, X } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
    column: Column<TData, TValue>;
    title: string;
    enableDropdown?: boolean;
    enableSorting?: boolean;
    filterComponent?: React.ReactNode;
    onClearFilter?: () => void;
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
    enableDropdown = true,
    enableSorting = true,
    filterComponent,
    onClearFilter,
}: DataTableColumnHeaderProps<TData, TValue>) {
    const renderHeader = () => {
        if (!enableDropdown) {
            return <span>{title}</span>;
        }

        const showSortIcon = enableSorting && column.getCanSort();

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            '-ml-3 h-8 data-[state=open]:bg-accent',
                            !showSortIcon && 'pr-2', // Reduce padding when sort icon is hidden
                        )}
                    >
                        <span>{title}</span>
                        {showSortIcon &&
                            (column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="ml-2 h-4 w-4" />
                            ) : column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="ml-2 h-4 w-4" />
                            ) : (
                                <ChevronsUpDown className="ml-2 h-4 w-4" />
                            ))}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {showSortIcon && (
                        <>
                            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
                                <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Asc
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
                                <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                                Desc
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
                        <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                        Ocultar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };

    const isFiltered = column.getFilterValue() !== undefined;

    return (
        <div className={cn('flex items-center space-x-1', className)}>
            {renderHeader()}
            {filterComponent && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn('h-8', isFiltered && 'bg-accent text-accent-foreground')}
                        >
                            <FilterIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto max-w-sm p-2" align="start">
                        <div className="flex flex-col space-y-2">
                            {filterComponent}
                            {onClearFilter && isFiltered && (
                                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onClearFilter}>
                                    <X className="mr-2 h-4 w-4" />
                                    Limpiar Filtro
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            )}
        </div>
    );
}