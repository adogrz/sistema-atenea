import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, AlertTriangle, Check, LoaderCircle, Award } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { InternadoPeriodo, InternadoMateria } from '@/types/fdtc/internado';

const BREADCRUMBS: BreadcrumbItem[] = [
  { title: 'Inicio', href: '/dashboard' },
  { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
  { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones' },
  { title: 'Crear Evaluación', href: '/dashboard/internado-fdtc/evaluaciones/create' },
];

interface Props {
  periodos: InternadoPeriodo[];
  materias: InternadoMateria[];
}

export default function CreateEvaluation({ periodos, materias }: Props) {
  const { data, setData, post, processing, errors } = useForm<{
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
  }>({
    periodo_id: '',
    materia_id: '',
    nombre: '',
    descripcion: '',
    peso_porcentual: '',
    nota_maxima: '10',
    fecha_inicio: '',
    fecha_fin: '',
    permite_credito_extra: false,
    credito_extra_max: '0',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (!data.periodo_id) newErrors.periodo_id = 'Selecciona un periodo';
    if (!data.materia_id) newErrors.materia_id = 'Selecciona una materia';

    if (!data.nombre) newErrors.nombre = 'El nombre de la evaluación es requerido';

    if (!data.peso_porcentual) {
      newErrors.peso_porcentual = 'El peso porcentual es requerido';
    } else if (parseFloat(data.peso_porcentual) < 0 || parseFloat(data.peso_porcentual) > 100) {
      newErrors.peso_porcentual = 'El peso debe estar entre 0 y 100';
    }

    if (!data.nota_maxima) {
      newErrors.nota_maxima = 'La nota máxima es requerida';
    } else if (parseFloat(data.nota_maxima) <= 0 || parseFloat(data.nota_maxima) > 10) {
      newErrors.nota_maxima = 'La nota máxima debe estar entre 0 y 10';
    }

    if (data.fecha_inicio && data.fecha_fin && new Date(data.fecha_inicio) > new Date(data.fecha_fin)) {
      newErrors.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (data.permite_credito_extra) {
      if (!data.credito_extra_max || parseFloat(data.credito_extra_max) <= 0) {
        newErrors.credito_extra_max = 'Define el crédito extra máximo';
      }
    }

    setValidationErrors(newErrors);
  }, [data]);

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('internado-fdtc.evaluaciones.store'), {
      onSuccess: () => toast.success('Evaluación creada exitosamente'),
      onError: () => toast.error('Error al crear la evaluación'),
      preserveScroll: true,
    });
  };

  const isFormValid = () =>
    data.periodo_id &&
    data.materia_id &&
    data.nombre &&
    data.peso_porcentual &&
    data.nota_maxima &&
    Object.keys(validationErrors).length === 0;

  const getFieldValidation = (field: string) => {
    switch (field) {
      case 'nombre':
        return {
          isValid: !!data.nombre,
          value: data.nombre || 'Sin especificar',
          isEmpty: !data.nombre,
        };
      case 'peso':
        return {
          isValid: !!data.peso_porcentual && !validationErrors.peso_porcentual,
          value: data.peso_porcentual ? `${data.peso_porcentual}%` : 'Sin especificar',
          isEmpty: !data.peso_porcentual,
        };
      case 'nota_maxima':
        return {
          isValid: !!data.nota_maxima && !validationErrors.nota_maxima,
          value: data.nota_maxima || 'Sin especificar',
          isEmpty: !data.nota_maxima,
        };
      case 'fechas':
        return {
          isValid: true,
          value:
            data.fecha_inicio && data.fecha_fin
              ? `${data.fecha_inicio} - ${data.fecha_fin}`
              : 'Sin especificar',
          isEmpty: !data.fecha_inicio || !data.fecha_fin,
        };
      case 'credito_extra':
        return {
          isValid: true,
          value: data.permite_credito_extra
            ? `Sí (Máx: ${data.credito_extra_max} puntos)`
            : 'No',
          isEmpty: false,
        };
      case 'descripcion':
        return {
          isValid: true,
          value: data.descripcion || 'Sin descripción',
          isEmpty: !data.descripcion,
        };
      default:
        return { isValid: false, value: '', isEmpty: true };
    }
  };

  const SummaryItem = ({ label, field }: { label: string; field: string }) => {
    const validation = getFieldValidation(field);
    return (
      <div className="flex items-center gap-2">
        {validation.isValid ? (
          <Check className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-500 dark:text-orange-400" />
        )}
        <p className="text-sm text-foreground">
          <span className="font-medium">{label}:</span>{' '}
          <span className={validation.isEmpty ? 'text-muted-foreground' : 'text-foreground'}>
            {validation.value}
          </span>
        </p>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={BREADCRUMBS}>
      <Head title="Crear Evaluación - Internado FDTC" />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="mx-auto w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Crear nueva evaluación</CardTitle>
              <CardDescription>
                Configura una evaluación para calificar a los estudiantes del internado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-8">
                {/* Información Básica */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Información Básica</h3>
                    <p className="text-sm text-muted-foreground">
                      Define los datos principales de la evaluación
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="periodo_id">Periodo *</Label>
                      <select
                        id="periodo_id"
                        value={data.periodo_id}
                        onChange={(e) => setData('periodo_id', e.target.value)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">Selecciona un periodo</option>
                        {periodos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} {p.es_vigente ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                      {(validationErrors.periodo_id || errors.periodo_id) && (
                        <p className="text-sm text-red-600">
                          {validationErrors.periodo_id || (errors.periodo_id as string)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="materia_id">Materia *</Label>
                      <select
                        id="materia_id"
                        value={data.materia_id}
                        onChange={(e) => setData('materia_id', e.target.value)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">Selecciona una materia</option>
                        {materias.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre} ({m.codigo})
                          </option>
                        ))}
                      </select>
                      {(validationErrors.materia_id || errors.materia_id) && (
                        <p className="text-sm text-red-600">
                          {validationErrors.materia_id || (errors.materia_id as string)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre de la Evaluación *</Label>
                      <Input
                        id="nombre"
                        value={data.nombre}
                        onChange={(e) => setData('nombre', e.target.value)}
                        placeholder="Ej: Examen Parcial 1, Trabajo Final"
                      />
                      {(validationErrors.nombre || errors.nombre) && (
                        <p className="text-sm text-red-600">
                          {validationErrors.nombre || (errors.nombre as string)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={data.descripcion}
                        onChange={(e) => setData('descripcion', e.target.value)}
                        placeholder="Descripción opcional de la evaluación..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
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
                        />
                        {(validationErrors.peso_porcentual || errors.peso_porcentual) && (
                          <p className="text-sm text-red-600">
                            {validationErrors.peso_porcentual || (errors.peso_porcentual as string)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Peso de esta evaluación en la nota final
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nota_maxima">Nota Máxima *</Label>
                        <Input
                          id="nota_maxima"
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={data.nota_maxima}
                          onChange={(e) => setData('nota_maxima', e.target.value)}
                        />
                        {(validationErrors.nota_maxima || errors.nota_maxima) && (
                          <p className="text-sm text-red-600">
                            {validationErrors.nota_maxima || (errors.nota_maxima as string)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Calificación máxima posible</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Fechas (Opcional)</h3>
                    <p className="text-sm text-muted-foreground">
                      Define el periodo de vigencia de la evaluación
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                      <Input
                        id="fecha_inicio"
                        type="date"
                        value={data.fecha_inicio}
                        onChange={(e) => setData('fecha_inicio', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                      <Input
                        id="fecha_fin"
                        type="date"
                        value={data.fecha_fin}
                        onChange={(e) => setData('fecha_fin', e.target.value)}
                      />
                      {(validationErrors.fecha_fin || errors.fecha_fin) && (
                        <p className="text-sm text-red-600">
                          {validationErrors.fecha_fin || (errors.fecha_fin as string)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Crédito Extra */}
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Crédito Extra</h3>
                    <p className="text-sm text-muted-foreground">
                      Configura puntos adicionales independientes de la nota
                    </p>
                  </div>

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
                      <div className="space-y-2 pt-4">
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
                        />
                        {(validationErrors.credito_extra_max || errors.credito_extra_max) && (
                          <p className="text-sm text-red-600">
                            {validationErrors.credito_extra_max || (errors.credito_extra_max as string)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Máximo de puntos extra que se pueden otorgar
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen */}
                <div className="rounded-lg border bg-card p-4">
                  <h4 className="mb-3 flex items-center gap-2 font-medium text-foreground">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Resumen de la evaluación
                  </h4>
                  <div className="space-y-2">
                    <SummaryItem label="Nombre" field="nombre" />
                    <SummaryItem label="Peso" field="peso" />
                    <SummaryItem label="Nota máxima" field="nota_maxima" />
                    <SummaryItem label="Fechas" field="fechas" />
                    <SummaryItem label="Crédito extra" field="credito_extra" />
                    <SummaryItem label="Descripción" field="descripcion" />
                  </div>
                  {!isFormValid() && (
                    <div className="mt-3 rounded border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                      <p className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                        <AlertTriangle className="h-4 w-4" />
                        Completa todos los campos requeridos para crear la evaluación
                      </p>
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex items-center justify-between gap-4 border-t pt-6">
                  <Button type="button" variant="outline" asChild>
                    <Link href={route('internado-fdtc.evaluaciones')}>Cancelar</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={processing || !isFormValid()}
                    className="min-w-[140px]"
                  >
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Crear evaluación
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