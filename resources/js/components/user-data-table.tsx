import { DataTable } from "@/components/ui/data-table";
import { getUserColumns } from "@/components/user-columns";
import { type User } from "@/components/user-columns";
import { useState } from "react";

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
