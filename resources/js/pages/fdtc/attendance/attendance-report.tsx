import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { InternadoPeriodo } from '@/types/fdtc/internado';

type FilaReporte = {
  participante_id: number;
  codigo: string;
  nombre: string;
  nivel_educativo?: string | null;
  presentes: number;
  ausentes: number;
  justificadas: number;
  total: number;
  porcentaje: number;
};

type DetalleDia = { id: number; fecha: string; estado: 'presente'|'ausente'|'justificada'; observaciones?: string | null };

interface PageProps {
  periodos: InternadoPeriodo[];
  filtros: {
    periodo_id?: number | null;
    desde?: string | null;
    hasta?: string | null;
    nivel?: string | null;
  };
  resumen: { presentes: number; ausentes: number; justificadas: number; total: number };
  filas: FilaReporte[];
}

export default function AttendanceReport(props: PageProps) {
  const listaPeriodos = Array.isArray(props.periodos) ? props.periodos : [];
  const filas = Array.isArray(props.filas) ? props.filas : [];

  const toText = (v: unknown) => (v == null ? '' : String(v));

  const defaultPeriodoId = useMemo(() => {
   const vigente = listaPeriodos.find((p) => (p as any).es_vigente);
   return vigente?.id ? String(vigente.id) : listaPeriodos[0]?.id ? String(listaPeriodos[0].id) : '';
 }, [listaPeriodos]);

  const [periodoId, setPeriodoId] = useState<string>(props.filtros.periodo_id ? String(props.filtros.periodo_id) : defaultPeriodoId);
  const [nivel, setNivel] = useState<string>(props.filtros.nivel || '');
  const [q, setQ] = useState<string>('');

  const didAutoLoad = useRef(false);

  const buildUrl = (name: string, fallback: string): string => {
    try {
      const w = window as any;
      if (typeof w.route === 'function') {
        return w.route(name);
      }
    } catch (_) {}
    return fallback;
  };

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
    const out = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
    return out.replace(',', '').toLowerCase();
  };

  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalle, setDetalle] = useState<DetalleDia[]>([]);
  const [detalleAlumno, setDetalleAlumno] = useState<{ nombre: string; codigo: string } | null>(null);

  const niveles = useMemo(
    () =>
      Array.from(
        new Set(
          filas.map((f) => toText(f.nivel_educativo).trim()).filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
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

  const abrirDetalle = async (fila: FilaReporte) => {
    if (!periodoId) return toast.error('Selecciona un periodo');
    setDetalleOpen(true);
    setDetalleAlumno({ nombre: fila.nombre, codigo: fila.codigo });
    setDetalle([]);
    setDetalleLoading(true);
    try {
      const qs = new URLSearchParams({
        participante_id: String(fila.participante_id),
        periodo_id: String(periodoId),
      });
      const base = buildUrl('internado-fdtc.asistencias.reporte.detalle', '/internado/fdtc/asistencias/reporte/detalle');
      const res = await fetch(`${base}?${qs.toString()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      const json = await res.json();
      setDetalle(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      console.error(e);
      toast.error('No se pudo cargar el detalle');
    } finally {
      setDetalleLoading(false);
    }
  };

  const cerrarDetalle = () => {
    setDetalleOpen(false);
    setDetalle([]);
    setDetalleAlumno(null);
  };

  useEffect(() => {
    if (props.filtros.periodo_id && String(props.filtros.periodo_id) !== periodoId) {
      setPeriodoId(String(props.filtros.periodo_id));
    }
  }, [props.filtros.periodo_id]);

  useEffect(() => {
    if (didAutoLoad.current) return;
    const hasPeriodoInUrl = !!props.filtros.periodo_id;
    if (hasPeriodoInUrl) return;
    const pid = periodoId || defaultPeriodoId;
    if (!pid) return;

    didAutoLoad.current = true;
    const url = buildUrl('internado-fdtc.asistencias.reporte', '/internado/fdtc/asistencias/reporte');
    router.get(
      url,
      { periodo_id: pid, nivel: nivel || undefined },
      { preserveScroll: true, replace: true }
    );
  }, [defaultPeriodoId, periodoId, props.filtros.periodo_id]);

  const onChangePeriodo = (value: string) => {
    setPeriodoId(value);
    if (value) {
      const url = buildUrl('internado-fdtc.asistencias.reporte', '/internado/fdtc/asistencias/reporte');
      router.get(
        url,
        { periodo_id: value, nivel: nivel || undefined },
        { preserveScroll: true, replace: true }
      );
    }
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Head title="Reporte de Asistencias - Internado FDTC" />
        <h1 className="text-2xl font-bold mb-3">Reporte de Asistencias</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecciona periodo, rango y filtros adicionales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              <div className="md:col-span-2">
                <label htmlFor="periodo" className="block text-sm mb-1">Periodo</label>
                <select
                  id="periodo"
                  value={periodoId}
                  onChange={(e) => onChangePeriodo(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona un periodo</option>
                  {listaPeriodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}{p.es_vigente ? ' ✓' : ''}</option>
                  ))}
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

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_auto]">
              <Input
                placeholder="Buscar por nombre o código..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Detalle por estudiante</CardTitle>
            <CardDescription>
              {filasFiltradas.length} registro(s){nivel ? ` · Nivel: ${nivel}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Código</th>
                    <th className="py-2 px-2">Nombre</th>
                    <th className="py-2 px-2">Nivel</th>
                    <th className="py-2 px-2 text-right">Pres.</th>
                    <th className="py-2 px-2 text-right">Aus.</th>
                    <th className="py-2 px-2 text-right">Just.</th>
                    <th className="py-2 px-2 text-right">Total</th>
                    <th className="py-2 px-2 text-right">% Asist.</th>
                    <th className="py-2 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filasFiltradas.length ? (
                    filasFiltradas.map((f) => (
                      <tr key={f.participante_id} className="border-b last:border-0">
                        <td className="py-2 px-2">{f.codigo || '—'}</td>
                        <td className="py-2 px-2">{f.nombre}</td>
                        <td className="py-2 px-2">{toText(f.nivel_educativo) || '—'}</td>
                        <td className="py-2 px-2 text-right">{f.presentes}</td>
                        <td className="py-2 px-2 text-right">{f.ausentes}</td>
                        <td className="py-2 px-2 text-right">{f.justificadas}</td>
                        <td className="py-2 px-2 text-right">{f.total}</td>
                        <td className="py-2 px-2 text-right">{f.porcentaje}%</td>
                        <td className="py-2 px-2 text-right">
                          <Button type="button" variant="outline" size="sm" onClick={() => abrirDetalle(f)}>
                            Ver días
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-muted-foreground" colSpan={9}>
                        Sin datos para los filtros seleccionados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal simple */}
        {detalleOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={cerrarDetalle} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-xl rounded-md border bg-background shadow-lg">
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Días de asistencia</div>
                    <div className="text-xs text-muted-foreground">
                      {detalleAlumno ? `${detalleAlumno.codigo} · ${detalleAlumno.nombre}` : ''}
                    </div>
                  </div>
                  <Button type="button" variant="ghost" onClick={cerrarDetalle}>Cerrar</Button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-auto">
                  {detalleLoading ? (
                    <div className="text-center text-muted-foreground py-8">Cargando...</div>
                  ) : detalle.length ? (
                    <ul className="space-y-2">
                      {detalle.map((d) => (
                        <li key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                          {/* Texto: "martes 20 de enero de 2025 - presente" */}
                          <div className="text-sm">{`${formatFechaLarga(toText(d.fecha))} - ${toText(d.estado)}`}</div>
                          {toText(d.observaciones) ? (
                            <span className="text-xs text-muted-foreground max-w-[280px] truncate" title={toText(d.observaciones)}>
                              {toText(d.observaciones)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">Sin registros en el rango</div>
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