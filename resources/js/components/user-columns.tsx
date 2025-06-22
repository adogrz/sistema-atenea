import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export type User = {
  id: number;
  name: string;
  email: string;
  role_name: string;
  sede_name: string;
  status: string;
};


export function getUserColumns(users: User[]): ColumnDef<User>[] {
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role_name)));
  const uniqueSedes = Array.from(new Set(users.map((u) => u.sede_name)));

  return [{
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "email",
    header: "Correo",
  },
  {
    accessorKey: "role_name",
    header: ({ column }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {column.getFilterValue() ? `Rol: ${column.getFilterValue()}` : "Filtrar por rol"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>Todos</DropdownMenuItem>
          {uniqueRoles.map((role) => (
            <DropdownMenuItem key={role} onClick={() => column.setFilterValue(role)}>
              {role}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    cell: ({ row }) => row.getValue("role_name"),
    filterFn: "equalsString",
  },
  {
    accessorKey: "sede_name",
    header: ({ column }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs">
            {column.getFilterValue() ? `Sede: ${column.getFilterValue()}` : "Filtrar por sede"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.setFilterValue(undefined)}>Todas</DropdownMenuItem>
          {uniqueSedes.map((sede) => (
            <DropdownMenuItem key={sede} onClick={() => column.setFilterValue(sede)}>
              {sede}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    cell: ({ row }) => row.getValue("sede_name"),
    filterFn: "equalsString",
  }, {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const isActive = status.toLowerCase() === "active";

      return (
        <div className="flex justify">
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"
              }`}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  ]
};