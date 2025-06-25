import { DataTable } from '@/components/ui/data-table';
import { getLogColumns, type Log } from '@/components/log-columns';

export default function LogDataTable({ logs }: { logs: Log[] }) {
    if (!logs || logs.length === 0) {
        return <div className="py-4 text-center text-muted-foreground">No hay registro disponible</div>;
    }

    return <DataTable columns={getLogColumns(logs)} data={logs} getRowId={(log) => log.id} />;
}
