import { DataTable } from "@/components/ui/data-table";
import { getUserColumns } from "@/components/user-columns";
import { type User } from "@/components/user-columns";

export default function UserDataTable({ users }: { users: User[] }) {
  return <DataTable columns={getUserColumns(users)} data={users} />;
}