import { DataTable } from "@/components/ui/data-table";
import { getLogColumns, type Log } from "@/components/log-columns";

/**
 * Renders a data table displaying a list of log entries.
 *
 * @param logs - The array of log objects to display in the table
 * @returns A React element containing the data table for the provided logs
 */
export default function LogDataTable({ logs }: { logs: Log[] }) {
  return (
    <DataTable
      columns={getLogColumns(logs)}
      data={logs}
      getRowId={(log) => log.id}
    />
  );
}