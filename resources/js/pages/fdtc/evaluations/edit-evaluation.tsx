import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { InternadoEvaluacion, InternadoPeriodo, InternadoMateria } from '@/types/fdtc/internado';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Award } from 'lucide-react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

interface NivelEducativo {
  codigo: number;
  descripcion: string;
  nivel: string;
}

interface EvaluacionEdit extends InternadoEvaluacion {
    periodo_id?: number;
    materia_id?: number;
    niveles_aplicables?: number[];
}

interface Props {
    evaluacion: EvaluacionEdit;
    periodos: InternadoPeriodo[];
    materias: InternadoMateria[];
    niveles: NivelEducativo[];
}

export default function EditEvaluation({ evaluacion, periodos, materias, niveles }: Props) {
    const BREADCRUMBS: BreadcrumbItem[] = [
        { title: 'Inicio', href: '/dashboard' },
        { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
        { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones' },
        { title: 'Editar Evaluación', href: `/dashboard/internado-fdtc/evaluaciones/${evaluacion.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm<{
        periodo_id: string;
        materia_id: string;
        nombre: string;
        descripcion: string;
        peso_porcentual: string;
        nota_maxima: string;
        fecha_inicio: string;
        fecha_fin: string;
        permite_credito_extra: boolean;
        credito_extra_max: string;
        niveles_aplicables: number[];
    }>({
        periodo_id: evaluacion.periodo_id?.toString() || '',
        materia_id: evaluacion.materia_id?.toString() || '',
        nombre: evaluacion.nombre,
        descripcion: evaluacion.descripcion || '',
        peso_porcentual: evaluacion.peso_porcentual?.toString() || '0',
        nota_maxima: evaluacion.nota_maxima?.toString() || '10',
        fecha_inicio: evaluacion.fecha_inicio || '',
        fecha_fin: evaluacion.fecha_fin || '',
        permite_credito_extra: !!evaluacion.permite_credito_extra,
        credito_extra_max: evaluacion.credito_extra_max?.toString() || '0',
        niveles_aplicables: evaluacion.niveles_aplicables || [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('internado-fdtc.evaluaciones.update', evaluacion.id), {
            onSuccess: () => toast.success('Evaluación actualizada exitosamente'),
            onError: () => toast.error('Error al actualizar la evaluación'),
        });
    };

    return (
        <AppLayout breadcrumbs={BREADCRUMBS}>
            <Head title={`Editar Evaluación: ${evaluacion.nombre} - Internado FDTC`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="mx-auto w-full max-w-4xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Editar evaluación</CardTitle>
                            <CardDescription>Actualiza la configuración de la evaluación</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Periodo y Materia */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="periodo_id">Periodo *</Label>
                                        <select
                                            id="periodo_id"
                                            value={data.periodo_id}
                                            onChange={(e) => setData('periodo_id', e.target.value)}
                                            className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            required
                                        >
                                            <option value="">Selecciona un periodo</option>
                                            {periodos.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.nombre} {p.es_vigente ? '✓' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.periodo_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.periodo_id as string}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="materia_id">Materia *</Label>
                                        <select
                                            id="materia_id"
                                            value={data.materia_id}
                                            onChange={(e) => setData('materia_id', e.target.value)}
                                            className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
                                            required
                                        >
                                            <option value="">Selecciona una materia</option>
                                            {materias.map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.nombre} ({m.codigo})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.materia_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.materia_id as string}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="nombre">Nombre de la Evaluación *</Label>
                                        <Input
                                            id="nombre"
                                            value={data.nombre}
                                            onChange={(e) => setData('nombre', e.target.value)}
                                            placeholder="Ej: Examen Parcial 1, Trabajo Final"
                                            className="mt-1"
                                        />
                                        {errors.nombre && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nombre as string}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="descripcion">Descripción</Label>
                                        <Textarea
                                            id="descripcion"
                                            value={data.descripcion}
                                            onChange={(e) => setData('descripcion', e.target.value)}
                                            placeholder="Descripción opcional de la evaluación..."
                                            rows={3}
                                            className="mt-1"
                                        />
                                        {errors.descripcion && (
                                            <p className="mt-1 text-sm text-red-600">{errors.descripcion as string}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="peso">Peso Porcentual (%) *</Label>
                                            <Input
                                                id="peso"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={data.peso_porcentual}
                                                onChange={(e) => setData('peso_porcentual', e.target.value)}
                                                placeholder="Ej: 30"
                                                className="mt-1"
                                            />
                                            {errors.peso_porcentual && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.peso_porcentual as string}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="nota_maxima">Nota Máxima *</Label>
                                            <Input
                                                id="nota_maxima"
                                                type="number"
                                                min="0"
                                                max="10"
                                                step="0.1"
                                                value={data.nota_maxima}
                                                onChange={(e) => setData('nota_maxima', e.target.value)}
                                                className="mt-1"
                                            />
                                            {errors.nota_maxima && (
                                                <p className="mt-1 text-sm text-red-600">{errors.nota_maxima as string}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Fechas */}
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                                        <Input
                                            id="fecha_inicio"
                                            type="date"
                                            value={data.fecha_inicio}
                                            onChange={(e) => setData('fecha_inicio', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.fecha_inicio && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fecha_inicio as string}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                                        <Input
                                            id="fecha_fin"
                                            type="date"
                                            value={data.fecha_fin}
                                            onChange={(e) => setData('fecha_fin', e.target.value)}
                                            className="mt-1"
                                        />
                                        {errors.fecha_fin && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fecha_fin as string}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Niveles Aplicables */}
                                <div className="space-y-4">
                                    <Label className="text-base">Niveles Educativos *</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona a qué niveles aplica esta evaluación (al menos uno es requerido)
                                    </p>

                                    <div className="space-y-3">
                                        {niveles.map((nivel) => {
                                            const isSelected = data.niveles_aplicables.includes(nivel.codigo);

                                            return (
                                                <div key={nivel.codigo} className="rounded-lg border p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id={`nivel-${nivel.codigo}`}
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setData('niveles_aplicables', [
                                                                        ...data.niveles_aplicables,
                                                                        nivel.codigo,
                                                                    ]);
                                                                } else {
                                                                    setData(
                                                                        'niveles_aplicables',
                                                                        data.niveles_aplicables.filter((c) => c !== nivel.codigo)
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`nivel-${nivel.codigo}`} className="cursor-pointer flex-1">
                                                            <span className="font-medium">{nivel.descripcion}</span>
                                                            <span className="text-sm text-muted-foreground ml-2">({nivel.nivel})</span>
                                                        </Label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {errors.niveles_aplicables && (
                                        <p className="text-sm text-red-600">{errors.niveles_aplicables as string}</p>
                                    )}
                                </div>

                                {/* Crédito Extra */}
                                <div className="space-y-4 rounded-lg border p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="permite_credito" className="flex items-center gap-2">
                                                <Award className="h-4 w-4" />
                                                ¿Permite crédito extra?
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                Los puntos extra se acumulan separados de la nota
                                            </p>
                                        </div>
                                        <Switch
                                            id="permite_credito"
                                            checked={data.permite_credito_extra}
                                            onCheckedChange={(checked: boolean) => {
                                                setData('permite_credito_extra', checked);
                                                if (!checked) setData('credito_extra_max', '0');
                                            }}
                                        />
                                    </div>

                                    {data.permite_credito_extra && (
                                        <div>
                                            <Label htmlFor="credito_max">Crédito Extra Máximo *</Label>
                                            <Input
                                                id="credito_max"
                                                type="number"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                value={data.credito_extra_max}
                                                onChange={(e) => setData('credito_extra_max', e.target.value)}
                                                placeholder="Ej: 1.0"
                                                className="mt-1"
                                            />
                                            {errors.credito_extra_max && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.credito_extra_max as string}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Máximo de puntos extra que se pueden otorgar
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Información adicional */}
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <h4 className="mb-2 text-sm font-medium">Estadísticas de la evaluación</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Total estudiantes:</span>
                                            <p className="font-semibold">{evaluacion.total_estudiantes ?? 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Calificados:</span>
                                            <p className="font-semibold">{evaluacion.estudiantes_calificados ?? 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Promedio:</span>
                                            <p className="font-semibold">{Number(evaluacion.promedio ?? 0).toFixed(1)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex items-center justify-end gap-4 border-t pt-6">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={route('internado-fdtc.evaluaciones')}>Cancelar</Link>
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