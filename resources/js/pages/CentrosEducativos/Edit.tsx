import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CentroEducativo, PageProps } from '@/types';

interface EditCentroEducativoProps extends PageProps {
    centroEducativo: CentroEducativo;
}

const EditCentroEducativo: React.FC<EditCentroEducativoProps> = ({ centroEducativo }) => {
    const { data, setData, put, processing, errors } = useForm({
        codigo: centroEducativo.codigo,
        nombre: centroEducativo.nombre,
        direccion: centroEducativo.direccion,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('centros-educativos.update', centroEducativo.id));
    };

    return (
        <AppLayout>
            <Head title="Editar Centro Educativo" />
            <div className="p-4 md:p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Centro Educativo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    type="text"
                                    value={data.codigo}
                                    onChange={(e) => setData('codigo', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input
                                    id="nombre"
                                    type="text"
                                    value={data.nombre}
                                    onChange={(e) => setData('nombre', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                            </div>
                            <div>
                                <Label htmlFor="direccion">Dirección</Label>
                                <Input
                                    id="direccion"
                                    type="text"
                                    value={data.direccion}
                                    onChange={(e) => setData('direccion', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.direccion && <p className="text-xs text-red-500 mt-1">{errors.direccion}</p>}
                            </div>
                            <div className="flex items-center justify-end">
                                <Button type="submit" disabled={processing}>
                                    Actualizar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default EditCentroEducativo;
