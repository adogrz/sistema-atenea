import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CalificacionRow {
  id: number;
  participante_id: number;
  codigo: string;
  nombre: string;
  email: string;
  centro_educativo: string;
  nota: number | null;
  observaciones: string | null;
}

interface Props {
  evaluacion: {
    id: number;
    nombre: string;
    descripcion?: string | null;
    peso_porcentual: number;
    nota_maxima: number;
    promedio: number;
  };
  calificaciones: CalificacionRow[];
}

export default function EvaluationDetails({ evaluacion, calificaciones }: Props) {
  const BREADCRUMBS: BreadcrumbItem[] = [
    { title: 'Inicio', href: '/dashboard' },
    { title: 'Internado FDTC', href: '/dashboard/internado-fdtc' },
    { title: 'Evaluaciones', href: '/dashboard/internado-fdtc/evaluaciones' },
    { title: 'Calificaciones', href: `/dashboard/internado-fdtc/evaluaciones/${evaluacion.id}` },
  ];

  const [rows, setRows] = useState<CalificacionRow[]>(calificaciones);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);

  const totalConNota = useMemo(() => rows.filter(r => r.nota !== null && !Number.isNaN(Number(r.nota))).length, [rows]);

  const onChangeNota = (id: number, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, nota: value === '' ? null : Number(value) } : r));
  };

  const onChangeObs = (id: number, value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, observaciones: value } : r));
  };

  const saveRow = (row: CalificacionRow) => {
    setSavingId(row.id);
    router.put(route('internado-fdtc.calificaciones.guardar', row.id), {
      nota: row.nota ?? 0,
      observaciones: row.observaciones ?? null,
    }, {
      preserveScroll: true,
      onSuccess: () => toast.success('Calificación guardada'),
      onError: () => toast.error('Error al guardar'),
      onFinish: () => setSavingId(null),
    });
  };

  const saveAll = () => {
    setSavingAll(true);
    const payload = {
      calificaciones: rows.map(r => ({
        id: r.id,
        nota: r.nota ?? 0,
        observaciones: r.observaciones ?? null,
      })),
    };
    router.post(route('internado-fdtc.calificaciones.guardar-masivo', evaluacion.id), payload, {
      preserveScroll: true,
      onSuccess: () => toast.success('Calificaciones guardadas'),
      onError: () => toast.error('Error al guardar calificaciones'),
      onFinish: () => setSavingAll(false),
    });
  };

  return (
    <AppLayout breadcrumbs={BREADCRUMBS}>
      <Head title={`Calificaciones - ${evaluacion.nombre}`} />
      <div className="flex h-full flex-1 flex-col gap-6 p-4">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" className="gap-2">
              <Link href={route('internado-fdtc.evaluaciones')}>
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button onClick={saveAll} disabled={savingAll} className="gap-2">
              {savingAll && <LoaderCircle className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Guardar todo
            </Button>
          </div>

          <Card className="mt-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {evaluacion.nombre}
                <Badge variant="secondary">{evaluacion.peso_porcentual}%</Badge>
              </CardTitle>
              <CardDescription>
                Nota máxima: {Number(evaluacion.nota_maxima).toFixed(1)} | Promedio: {Number(evaluacion.promedio ?? 0).toFixed(1)} | Calificados: {totalConNota}/{rows.length}
              </CardDescription>
              {evaluacion.descripcion && <p className="text-sm text-muted-foreground mt-1">{evaluacion.descripcion}</p>}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="border-b p-2">Código</th>
                      <th className="border-b p-2">Estudiante</th>
                      <th className="border-b p-2">Centro</th>
                      <th className="border-b p-2 w-32">Nota</th>
                      <th className="border-b p-2">Observaciones</th>
                      <th className="border-b p-2 w-36">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/50">
                        <td className="border-b p-2">{r.codigo}</td>
                        <td className="border-b p-2">{r.nombre}</td>
                        <td className="border-b p-2">{r.centro_educativo}</td>
                        <td className="border-b p-2">
                          <Input
                            type="number"
                            min={0}
                            max={evaluacion.nota_maxima}
                            step="0.01"
                            value={r.nota ?? ''}
                            onChange={(e) => onChangeNota(r.id, e.target.value)}
                          />
                        </td>
                        <td className="border-b p-2">
                          <Textarea
                            rows={1}
                            value={r.observaciones ?? ''}
                            onChange={(e) => onChangeObs(r.id, e.target.value)}
                          />
                        </td>
                        <td className="border-b p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => saveRow(r)}
                            disabled={savingId === r.id}
                          >
                            {savingId === r.id && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Guardar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}