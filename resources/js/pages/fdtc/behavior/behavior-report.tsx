import { Head, router } from '@inertiajs/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { InternadoPeriodo } from '@/types/fdtc/internado';

type FilaConducta = {
  participante_id: number;
  codigo: string;
  nombre: string;
  nivel_educativo?: string | null;
  calificacion: 'excelente' | 'buena' | 'regular' | 'mala' | string;
  descripcion?: string | null;
  actualizado_en?: string | null;
};

interface PageProps {
  periodos: InternadoPeriodo[];
  filtros: { periodo_id?: number | null; nivel?: string | null };
  filas: FilaConducta[];
}

const toText = (v: unknown) => (v == null ? '' : String(v));
  const parseDateLocal = (value: string) => {
    if (!value) return new Date(NaN);
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date(value);
  };
  const formatFechaLarga = (value: string) => {
    const d = parseDateLocal(value);
    if (isNaN(d.getTime())) return value;
    const out = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return out.replace(',', '').toLowerCase();
  };

export default function ConductReport(props: PageProps) {
  const listaPeriodos = Array.isArray(props.periodos) ? props.periodos : [];
  const filas = Array.isArray(props.filas) ? props.filas : [];

  const defaultPeriodoId = useMemo(() => {
    const vigente = listaPeriodos.find((p) => (p as any).es_vigente);
    return vigente?.id ? String(vigente.id) : listaPeriodos[0]?.id ? String(listaPeriodos[0].id) : '';
  }, [listaPeriodos]);

  const [periodoId, setPeriodoId] = useState<string>(props.filtros.periodo_id ? String(props.filtros.periodo_id) : '');
  const [nivel, setNivel] = useState<string>(props.filtros.nivel || '');
  const [q, setQ] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const didAutoLoad = useRef(false);

  // Modal de detalle
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalle, setDetalle] = useState<{ calificacion: string; descripcion?: string | null; fecha?: string | null } | null>(null);
  const [detalleAlumno, setDetalleAlumno] = useState<{ nombre: string; codigo: string } | null>(null);

  const niveles = useMemo(
    () => Array.from(new Set(filas.map((f) => toText(f.nivel_educativo).trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [filas]
  );

  const filasFiltradas = useMemo(() => {
    const query = toText(q).trim().toLowerCase();
    return filas.filter((f) => {
      if (nivel && toText(f.nivel_educativo) !== toText(nivel)) return false;
      if (!query) return true;
      return toText(f.nombre).toLowerCase().includes(query) || toText(f.codigo).toLowerCase().includes(query);
    });
  }, [filas, q, nivel]);

  useEffect(() => {
    if (didAutoLoad.current) return;
    const pid = periodoId || defaultPeriodoId;
    if (!pid) return;
    if (!filas.length || !props.filtros.periodo_id) {
      didAutoLoad.current = true;
      router.get(
        route('internado-fdtc.conductas.reporte'),
        { periodo_id: pid, nivel: nivel || undefined },
        { preserveScroll: true, replace: true }
      );
    }
  }, [periodoId, defaultPeriodoId, filas.length]);

  const onChangePeriodo = (value: string) => {
    setPeriodoId(value);
    if (value) {
      router.get(
        route('internado-fdtc.conductas.reporte'),
        { periodo_id: value, nivel: nivel || undefined },
        { preserveScroll: true, replace: true }
      );
    }
  };

  const handleBuscar = () => {
    if (!periodoId) return toast.error('Selecciona un periodo');
    setLoading(true);
    const t = toast.loading('Generando reporte...');
    router.get(
      route('internado-fdtc.conductas.reporte'),
      { periodo_id: periodoId, nivel: nivel || undefined },
      {
        preserveScroll: true,
        replace: true,
        onSuccess: () => toast.success('Reporte actualizado'),
        onError: () => toast.error('No se pudo cargar el reporte'),
        onFinish: () => {
          setLoading(false);
          toast.dismiss(t);
        },
      }
    );
  };

  const abrirDetalle = async (fila: FilaConducta) => {
    if (!periodoId) return toast.error('Selecciona un periodo');
    setDetalleOpen(true);
    setDetalleAlumno({ nombre: fila.nombre, codigo: fila.codigo });
    setDetalle(null);
    setDetalleLoading(true);
    try {
      const qs = new URLSearchParams({ participante_id: String(fila.participante_id), periodo_id: String(periodoId) });
      const res = await fetch(route('internado-fdtc.conductas.reporte.detalle') + '?' + qs.toString(), { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const json = await res.json();
      setDetalle(json.data || null);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo cargar el detalle');
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarDetalle = () => {
    setDetalleOpen(false);
    setDetalle(null);
    setDetalleAlumno(null);
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Head title="Reporte de Conducta - Internado FDTC" />
        <h1 className="text-2xl font-bold mb-3">Reporte de Conducta</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra por periodo y nivel educativo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="md:col-span-2">
                <label htmlFor="periodo" className="block text-sm mb-1">Periodo</label>
                <select
                  id="periodo"
                  value={periodoId}
                  onChange={(e) => onChangePeriodo(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona un periodo</option>
                  {listaPeriodos.map(p => (<option key={p.id} value={p.id}>{p.nombre}{(p as any).es_vigente ? ' ✓' : ''}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Nivel</label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={!niveles.length}
                >
                  <option value="">{niveles.length ? 'Todos' : 'Sin niveles'}</option>
                  {niveles.map(n => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
              <Input placeholder="Buscar por nombre o código..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Detalle por estudiante</CardTitle>
            <CardDescription>{filasFiltradas.length} registro(s){nivel ? ` · Nivel: ${nivel}` : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Código</th>
                    <th className="py-2 px-2">Nombre</th>
                    <th className="py-2 px-2">Nivel</th>
                    <th className="py-2 px-2">Calificación</th>
                    <th className="py-2 px-2">Descripción</th>
                    <th className="py-2 px-2">Actualizado</th>
                    <th className="py-2 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filasFiltradas.length ? filasFiltradas.map((f) => (
                    <tr key={f.participante_id} className="border-b last:border-0">
                      <td className="py-2 px-2">{f.codigo || '—'}</td>
                      <td className="py-2 px-2">{f.nombre}</td>
                      <td className="py-2 px-2">{toText(f.nivel_educativo) || '—'}</td>
                      <td className="py-2 px-2 capitalize">{toText(f.calificacion) || '—'}</td>
                      <td className="py-2 px-2">
                        <span className="line-clamp-2 text-muted-foreground">{toText(f.descripcion) || '—'}</span>
                      </td>
                      <td className="py-2 px-2">{f.actualizado_en ? formatFechaLarga(f.actualizado_en) : '—'}</td>
                      <td className="py-2 px-2 text-right">
                        <Button type="button" variant="outline" size="sm" onClick={() => abrirDetalle(f)}>
                          Ver detalle
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td className="py-6 text-center text-muted-foreground" colSpan={7}>Sin datos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {detalleOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={cerrarDetalle} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-xl rounded-md border bg-background shadow-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Detalle de conducta</div>
                    <div className="text-xs text-muted-foreground">
                      {detalleAlumno ? `${detalleAlumno.codigo} · ${detalleAlumno.nombre}` : ''}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" onClick={cerrarDetalle}>Cerrar</Button>
                </div>
                <div className="p-4">
                  {detalleLoading ? (
                    <div className="text-center text-muted-foreground py-8">Cargando...</div>
                  ) : detalle ? (
                    <div className="space-y-2">
                      <div><span className="text-sm font-medium">Calificación: </span><span className="capitalize">{toText(detalle.calificacion) || '—'}</span></div>
                      <div><span className="text-sm font-medium">Fecha: </span>{toText(detalle.fecha) ? formatFechaLarga(toText(detalle.fecha)) : '—'}</div>
                      <div>
                        <span className="text-sm font-medium">Descripción:</span>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">{toText(detalle.descripcion) || '—'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Sin registro de conducta en el periodo</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}