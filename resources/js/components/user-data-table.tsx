import { DataTable } from "@/components/ui/data-table";
import { getUserColumns } from "@/components/user-columns";
import { type User } from "@/components/user-columns";
import { useState } from "react";

/**
 * Displays a table of users with selectable rows.
 *
 * Renders a data table for the provided array of users, allowing a single user to be selected by clicking a row.
 *
 * @param users - The array of user objects to display in the table
 * @returns The rendered user data table component
 */
export default function UserDataTable({ users }: { users: User[] }) {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  return (
    <DataTable
      columns={getUserColumns(users, selectedUserId, setSelectedUserId)}
      data={users}
      selectedRowId={selectedUserId}
      onRowClick={(user) => setSelectedUserId(user.id)}
      getRowId={(user) => user.id}
    />
  );
}
