import { Table } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    toolbarOptions?: {
        searchableColumnId?: string
        filters?: {
            columnId: string
            title: string
            options: { label: string; value: string }[]
        }[]
    }
}

export function DataTableToolbar<TData>({ table, toolbarOptions }: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters?.length > 0

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                {toolbarOptions?.searchableColumnId && table.getColumn(toolbarOptions.searchableColumnId) && (
                    <Input
                        placeholder="Buscar..."
                        value={(table.getColumn(toolbarOptions.searchableColumnId)?.getFilterValue() as string) ?? ''}
                        onChange={(event) =>
                            table.getColumn(toolbarOptions.searchableColumnId)?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
                {toolbarOptions?.filters?.map((filter) =>
                    table.getColumn(filter.columnId) ? (
                        <DataTableFacetedFilter
                            key={filter.columnId}
                            column={table.getColumn(filter.columnId)}
                            title={filter.title}
                            options={filter.options}
                        />
                    ) : null
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
