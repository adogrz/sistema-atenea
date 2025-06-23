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


/**
 * Generates column definitions for a user table with selection, filtering, and status display.
 *
 * @param users - The list of user objects to extract unique roles and sedes for filtering.
 * @param selectedUserId - The currently selected user's ID, or null if none is selected.
 * @param setSelectedUserId - Callback to update the selected user ID when a row is selected.
 * @returns An array of column definitions for rendering a user table, including selection radio buttons, user details, filterable role and sede columns, and a status badge.
 */
export function getUserColumns(
  users: User[],
  selectedUserId: number | null,
  setSelectedUserId: (id: number) => void
): ColumnDef<User>[] {
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role_name)));
  const uniqueSedes = Array.from(new Set(users.map((u) => u.sede_name)));

  return [
    {
      id: "radio_select",
      header: "Selección",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-center">
            <input
              type="radio"
              name="user-selection"
              checked={selectedUserId === user.id}
              onChange={() => setSelectedUserId(user.id)}
              onClick={(e) => e.stopPropagation()}
              className="h-4 w-4 text-primary"
            />
          </div>
        );
      },
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
          <div className="flex justify-center">
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