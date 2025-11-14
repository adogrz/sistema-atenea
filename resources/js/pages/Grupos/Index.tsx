import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps, Grupo } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface GruposIndexProps extends PageProps {
    grupos: Grupo[];
}

const Index: React.FC<GruposIndexProps> = ({ grupos }) => {

    const handleDelete = (id: number) => {
        router.delete(route('grupos.destroy', id), {
            preserveScroll: true,
        });
    };

    const columns: ColumnDef<Grupo>[] = [
        {
            accessorKey: 'nombre',
            header: 'Nombre',
        },
        {
            accessorKey: 'horario',
            header: 'Horario',
        },
        {
            accessorKey: 'area.name',
            header: 'Área',
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Link href={route('grupos.edit', row.original.id)}>
                        <Button variant="outline">Editar</Button>
                    </Link>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el grupo.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(row.original.id)}>
                                    Eliminar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Grupos' }]}>
            <Head title="Gestión de Grupos" />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Gestión de Grupos</h1>
                    <Link href={route('grupos.create')}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Crear Grupo
                        </Button>
                    </Link>
                </div>
                <DataTable columns={columns} data={grupos} />
            </div>
        </AppLayout>
    );
};

export default Index;
