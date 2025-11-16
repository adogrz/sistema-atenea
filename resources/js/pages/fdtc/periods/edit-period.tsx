import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { InternadoPeriodo } from '@/types/fdtc/internado';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

interface Props {
    periodo: InternadoPeriodo;
}

export default function EditPeriod({ periodo }: Props) {
    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
        { title: 'Periodos', href: '/dashboard/internado-fdtc/periodos' },
        { title: 'Editar Periodo', href: `/dashboard/internado-fdtc/periodos/${periodo.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        nombre: periodo.nombre,
        fecha_inicio: periodo.fecha_inicio,
        fecha_fin: periodo.fecha_fin,
        descripcion: periodo.descripcion || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('internado-fdtc.periodos.update', periodo.id),{
            onSuccess: () => {
                toast.success('Periodo actualizado exitosamente');
            },
            onError: () => {
                toast.error('Error al actualizar periodo');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={`Editar Periodo: ${periodo.nombre} - Internado FDTC`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Editar periodo</CardTitle>
                            <CardDescription>
                                Actualiza la información del periodo académico
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="nombre">Nombre del Periodo *</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            placeholder="Ej: Enero 2025, Periodo 1 - 2025"
                                            className="mt-1"
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="descripcion">Descripción</Label>
                                        <Textarea
                                            id="descripcion"
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            placeholder="Descripción opcional del periodo..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.descripcion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                                        <Input
                                            id="fecha_inicio"
                                            type="date"
                                            value={data.fecha_inicio}
                                            onChange={(e) => setData('fecha_inicio', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.fecha_inicio && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                                        <Input
                                            id="fecha_fin"
                                            type="date"
                                            value={data.fecha_fin}
                                            onChange={(e) => setData('fecha_fin', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.fecha_fin && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fecha_fin}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Información adicional */}
                                {(periodo.total_asistencias !== undefined || periodo.total_conductas !== undefined) && (
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <h4 className="mb-2 text-sm font-medium">Información del periodo</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            {periodo.total_asistencias !== undefined && (
                                                <div>
                                                    <span className="text-muted-foreground">Asistencias registradas:</span>
                                                    <p className="font-semibold">{periodo.total_asistencias}</p>
                                                </div>
                                            )}
                                            {periodo.total_conductas !== undefined && (
                                                <div>
                                                    <span className="text-muted-foreground">Conductas registradas:</span>
                                                    <p className="font-semibold">{periodo.total_conductas}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4 border-t pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('internado-fdtc.periodos.index')}>Cancelar</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Guardar cambios
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}