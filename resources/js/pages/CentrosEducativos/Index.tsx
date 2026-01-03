import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const CentrosEducativosIndex: React.FC<PageProps> = ({ centrosEducativos, filters }) => {
    return (
        <AppLayout>
            <Head title="Centros Educativos" />
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Centros Educativos</h1>
                        <p className="text-muted-foreground">
                            Aquí puedes ver, crear y gestionar todos los centros educativos.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button asChild>
                            <Link href={route('centros-educativos.importar')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Importar
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('centros-educativos.create')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Crear Centro
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <DataTable
                            columns={columns}
                            data={centrosEducativos.data}
                            searchableColumn='nombre'
                            // toolbar={DataTableToolbar}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default CentrosEducativosIndex;
