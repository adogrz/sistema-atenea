import { getLogColumns, type Log } from '@/components/log-columns';
import { DataTable } from '@/components/ui/data-table';
import { Head, usePage } from '@inertiajs/react';
import * as React from 'react';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { ColumnFiltersState } from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Auditoría', href: '/dashboard/audit' },
];

export default function Dashboard() {
    const { logs } = usePage<{ logs: Log[] }>().props;
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
    const [selectedEvents, setSelectedEvents] = React.useState<string[]>([]);

    const columns = React.useMemo(
        () => getLogColumns(logs, selectedTypes, setSelectedTypes, selectedEvents, setSelectedEvents),
        [logs, selectedTypes, selectedEvents],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Auditoría" />
            <div className="p-4">
                <h2 className="mb-4 text-2xl font-bold">Registro de actividad</h2>
                <DataTable
                    columns={columns}
                    data={logs}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    getRowId={(log) => log.id}
                />
            </div>
        </AppLayout>
    );
}
