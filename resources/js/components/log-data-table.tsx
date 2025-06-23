import { DataTable } from "@/components/ui/data-table";
import { getLogColumns, type Log } from "@/components/log-columns";

export default function LogDataTable({ logs }: { logs: Log[] }) {
  return (
    <DataTable
      columns={getLogColumns(logs)}
      data={logs}
      getRowId={(log) => log.id}
    />
  );
}