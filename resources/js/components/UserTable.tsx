import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
};

interface UserTableProps {
  users: User[];
}

export default function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableCaption>Lista de usuarios registrados en el sistema.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead className="text-right">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right">
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  user.status === "Activo"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {user.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}