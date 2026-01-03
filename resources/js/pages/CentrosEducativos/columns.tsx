"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CentroEducativo } from "@/types"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export const columns: ColumnDef<CentroEducativo>[] = [
  {
    accessorKey: "codigo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Código
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  /*
  {
    accessorKey: "direccion",
    header: "Dirección",
  },
  */
  {
    accessorKey: "departamento",
    header: "Departamento",
  },
  {
    accessorKey: "distrito",
    header: "Distrito",
  },

  {
    accessorKey: "sector",
    header: "Sector",
  },
  {
    accessorKey: "zona",
    header: "Zona",
    cell: ({ row }) => {
      const zona = row.original.zona;
      return (
        <Badge variant="outline"
          className={zona === 'Urbana' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-purple-600 bg-purple-50 text-purple-700'}>
          {row.original.zona}
        </Badge>
      );
    }
  },
  {
    accessorKey: "Internacional",
    header: "Internacional",
    cell: ({ row }) => (
      <Badge
        className={row.original.internacional ? 'border-green-600 bg-green-50 text-green-700' : 'border-blue-600 bg-blue-50 text-blue-700'}>
        {row.original.internacional ? 'Si' : 'No'}
      </Badge>
    ),
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const centro = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={route('centros-educativos.edit', centro.codigo)}>
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ver detalles</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
