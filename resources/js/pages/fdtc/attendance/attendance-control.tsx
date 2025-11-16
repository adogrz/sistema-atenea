import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InternadoPeriodo, InternadoParticipante, InternadoAsistencia } from '@/types/fdtc/internado';
import { toast } from 'sonner';

const EMPTY_PERIODOS: InternadoPeriodo[] = [];
const EMPTY_PARTICIPANTES: InternadoParticipante[] = [];
const EMPTY_ASISTENCIAS: InternadoAsistencia[] = [];
type EstadoAsistencia = 'presente' | 'ausente' | 'justificada';

interface PageProps {
  periodos: InternadoPeriodo[];
  participantes: InternadoParticipante[];
  asistencias?: InternadoAsistencia[];
  periodo_seleccionado?: number;
  fecha_seleccionada?: string;
}

export default function AttendancesManagement(props: PageProps) {
  const { periodos, participantes, asistencias } = props;

  const listaPeriodos = Array.isArray(periodos) ? periodos : EMPTY_PERIODOS;
  const listaParticipantes = Array.isArray(participantes) ? participantes : EMPTY_PARTICIPANTES;
  const listaAsistencias = Array.isArray(asistencias) ? asistencias : EMPTY_ASISTENCIAS;

  const toText = (v: unknown) => (v == null ? '' : String(v));

  const [periodoId, setPeriodoId] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);

  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [estadoById, setEstadoById] = useState<Record<number, EstadoAsistencia>>({});
  const [selectedIds, setSelectedIds] = useState<Record<number, boolean>>({});
  const [estadoMasivo, setEstadoMasivo] = useState<EstadoAsistencia>('presente');

  const masterRef = useRef<HTMLInputElement | null>(null);

  const [nivel, setNivel] = useState<string>('');

  // Helpers de nombre y código
  const getNombre = (p: InternadoParticipante) => {
    const anyP = p as any;

    const top = (anyP.nombre ?? '').toString().trim();
    if (top) return top;

    const e = anyP.estudiante ?? {};
    const persona = e.persona ?? {};

    const nombreCompleto = (e.nombre_completo ?? persona.nombre_completo ?? persona.nombreCompleto ?? '').toString().trim();
    if (nombreCompleto) return nombreCompleto;

    const nombres = [e.nombres ?? persona.nombres ?? persona.primer_nombre ?? '', persona.segundo_nombre ?? '']
      .filter(Boolean)
      .join(' ')
      .trim();

    const apellidos = [e.apellidos ?? persona.apellidos ?? '', persona.apellido_paterno ?? '', persona.apellido_materno ?? '', persona.apellido_casada ?? '']
      .filter(Boolean)
      .join(' ')
      .trim();

    const combinado = [nombres, apellidos].filter(Boolean).join(' ').trim();
    if (combinado) return combinado;

    const userName = (e.user?.name ?? e.user?.full_name ?? anyP.user?.name ?? '').toString().trim();
    return userName || 'Sin nombre';
  };

  const getCodigo = (p: InternadoParticipante) => {
    const anyP = p as any;
    const top = (anyP.codigo ?? '').toString().trim();
    if (top) return top;
    const e = anyP.estudiante ?? {};
    const persona = e.persona ?? {};
    return (e.codigo ?? persona.codigo ?? '').toString();
  };

  // helper para obtener el nivel educativo del participante
  const getNivel = (p: InternadoParticipante) => {
  const anyP = p as any;
  const raw =
    anyP.nivel_educativo ??
    anyP.estudiante?.nivel_educativo ??
    anyP.estudiante?.nivelEducativo?.nombre ??
    anyP.estudiante?.nivelEducativo?.nivel ??
    '';
  return toText(raw).trim();
};

  // Selección
  const toggleSeleccion = (id: number, checked: boolean) => {
    setSelectedIds((prev) => ({ ...prev, [id]: checked }));
  };

  const seleccionarFiltrados = (checked: boolean, ids: number[]) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = checked));
      return next;
    });
  };

  const aplicarEstadoSeleccionados = () => {
    const ids = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (!ids.length) return toast.error('Selecciona al menos un estudiante');
    setEstadoById((prev) => {
      const next = { ...prev };
      ids.forEach((id) => (next[id] = estadoMasivo));
      return next;
    });
    toast.success(`Aplicado: ${estadoMasivo} a ${ids.length} seleccionado(s)`);
  };

  // Reset selección al cambiar la lista
  useEffect(() => {
    setSelectedIds({});
  }, [listaParticipantes]);

  useEffect(() => {
    setSelectedIds({});
  }, [nivel]);

  // Leer filtros iniciales de la URL
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qPeriodo = sp.get('periodo_id') || '';
    const qFecha = sp.get('fecha') || '';
    if (qPeriodo) setPeriodoId(qPeriodo);
    if (qFecha) setFecha(qFecha);
  }, []);

  // Hidratar estado y observaciones desde backend
  useEffect(() => {
    if (!listaAsistencias.length) {
      setEstadoById({});
      setObservaciones({});
      return;
    }
    const estados: Record<number, EstadoAsistencia> = {};
    const obs: Record<number, string> = {};
    for (const it of listaAsistencias as any[]) {
      const estado: EstadoAsistencia = (it.estado as EstadoAsistencia) ?? (it.presente ? 'presente' : 'ausente');
      estados[it.participante_id] = estado;
      obs[it.participante_id] = it.observaciones || '';
    }
    setEstadoById(estados);
    setObservaciones(obs);
  }, [listaAsistencias]);

  const periodoActual = useMemo(() => listaPeriodos.find((p) => p.id === Number(periodoId)), [listaPeriodos, periodoId]);

  // niveles disponibles y lista base por nivel
  const niveles = useMemo(
    () =>
      Array.from(
        new Set(
          (listaParticipantes || [])
            .map((p) => getNivel(p))
            .map((n) => toText(n).trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [listaParticipantes]
  );

  const participantesPorNivel = useMemo(
    () =>
      nivel
        ? listaParticipantes.filter((p) => toText(getNivel(p)) === toText(nivel))
        : listaParticipantes,
    [nivel, listaParticipantes]
  );

  const participantesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return participantesPorNivel;
    return participantesPorNivel.filter((p) => {
      const nombre = getNombre(p).toLowerCase();
      const codigo = (getCodigo(p) ?? '').toLowerCase();
      return nombre.includes(q) || codigo.includes(q);
    });
  }, [busqueda, participantesPorNivel]);

  const filteredIds = useMemo(() => participantesFiltrados.map((p) => p.id), [participantesFiltrados]);
  const selectedInFiltered = useMemo(() => filteredIds.filter((id) => !!selectedIds[id]), [filteredIds, selectedIds]);
  const allSelectedFiltered = selectedInFiltered.length > 0 && selectedInFiltered.length === filteredIds.length;
  const anySelectedFiltered = selectedInFiltered.length > 0;

  // Checkbox maestro indeterminado
  useEffect(() => {
    if (!masterRef.current) return;
    masterRef.current.indeterminate = anySelectedFiltered && !allSelectedFiltered;
    masterRef.current.checked = allSelectedFiltered;
  }, [anySelectedFiltered, allSelectedFiltered]);

  const handleEstadoChange = (participanteId: number, value: EstadoAsistencia) => {
    setEstadoById((prev) => ({ ...prev, [participanteId]: value }));
  };

  const handleObservacionChange = (participanteId: number, value: string) => {
    setObservaciones((prev) => ({ ...prev, [participanteId]: value }));
  };

  const handleGuardar = () => {
    if (!periodoId || !fecha) {
      return toast.error('Selecciona periodo y fecha antes de guardar.');
    }

    const payload = listaParticipantes.map((p) => ({
      participante_id: p.id,
      estado: (estadoById[p.id] ?? 'ausente') as EstadoAsistencia,
      observaciones: observaciones[p.id]?.trim() || null,
    }));

    console.log('POST asistencias payload:', { periodo_id: Number(periodoId), fecha, asistencias: payload });

    setSaving(true);
    const t = toast.loading('Guardando asistencias...');
    router.post(
      route('internado-fdtc.asistencias.masivo'),
      { periodo_id: Number(periodoId), fecha, asistencias: payload },
      {
        preserveScroll: true,
        onSuccess: () => toast.success('Asistencias guardadas'),
        onError: (errors: Record<string, any>) => {
          console.error('Guardar errores:', errors);
          const first = errors && (Array.isArray(errors) ? errors[0] : Object.values(errors).flat?.()[0]);
          toast.error(first ? String(first) : 'No se pudo guardar. Revisa la consola.');
        },
        onFinish: () => {
          setSaving(false);
          toast.dismiss(t);
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Head title="Asistencias - Internado FDTC" />
        <h1 className="text-2xl font-bold mb-3">Asistencias - Internado FDTC</h1>

        {/* Filtros */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Seleccionar Periodo y Fecha</CardTitle>
            <CardDescription>Pulsa Buscar para cargar datos del backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-[1fr_1fr_160px]">
              <div>
                <label htmlFor="periodo" className="block text-sm mb-1">
                  Periodo *
                </label>
                <select
                  id="periodo"
                  value={periodoId}
                  onChange={(e) => setPeriodoId(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona un periodo</option>
                  {listaPeriodos.map((p) => (
                    <option key={p.id} value={p.id.toString()}>
                      {p.nombre}{p.es_vigente ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fecha" className="block text-sm mb-1">
                  Fecha a guardar *
                </label>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha} // por defecto: hoy (ya inicializado en el estado)
                  onChange={(e) => setFecha(e.target.value)}
                  min={periodoActual?.fecha_inicio}
                  max={periodoActual?.fecha_fin}
                  disabled={!periodoId}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de estudiantes */}
        {periodoId ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Lista de Asistencia - {fecha || '—'}</CardTitle>
              <CardDescription>Selecciona filas y aplica un estado masivo o edita por fila</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Barra de búsqueda y acciones (alineado) */}
              <div className="mb-3 space-y-2">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Buscar por nombre o código..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="h-10 md:max-w-xl"
                    />
                  
                    <div className="flex items-center gap-2">
                      <label htmlFor="nivel" className="text-sm">Nivel</label>
                      <select
                        id="nivel"
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        value={nivel}
                        onChange={(e) => setNivel(e.target.value)}
                        disabled={!niveles.length}
                      >
                        <option value="">{niveles.length ? 'Todos los niveles' : 'Sin niveles'}</option>
                        {niveles.map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        ref={masterRef}
                        id="sel-todos"
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={(e) => seleccionarFiltrados(e.target.checked, filteredIds)}
                      />
                      <label htmlFor="sel-todos" className="text-sm">
                        Seleccionar todos
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="estado-masivo" className="text-sm">
                        Estado a aplicar
                      </label>
                      <select
                        id="estado-masivo"
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        value={estadoMasivo}
                        onChange={(e) => setEstadoMasivo(e.target.value as EstadoAsistencia)}
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                        <option value="justificada">Justificada</option>
                      </select>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10"
                      onClick={aplicarEstadoSeleccionados}
                      disabled={!Object.values(selectedIds).some(Boolean)}
                    >
                      Aplicar a seleccionados
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="h-10"
                      onClick={() => setSelectedIds({})}
                      disabled={!Object.values(selectedIds).some(Boolean)}
                    >
                      Limpiar selección
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Mostrando {participantesFiltrados.length} de {participantesPorNivel.length}
                  {selectedInFiltered.length ? ` · Seleccionados (filtrados): ${selectedInFiltered.length}` : ''}
                </div>
              </div>

              {/* Lista */}
              <div className="space-y-3">
                {participantesFiltrados.length ? (
                  participantesFiltrados.map((p) => (
                    <div key={p.id} className="flex items-start gap-3 rounded-md border p-3">
                      <input
                        id={`sel-${p.id}`}
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={!!selectedIds[p.id]}
                        onChange={(e) => toggleSeleccion(p.id, e.target.checked)}
                        title="Seleccionar fila"
                      />

                      <select
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                        value={estadoById[p.id] ?? 'ausente'}
                        onChange={(e) => handleEstadoChange(p.id, e.target.value as EstadoAsistencia)}
                      >
                        <option value="presente">Presente</option>
                        <option value="ausente">Ausente</option>
                        <option value="justificada">Justificada</option>
                      </select>

                      <div className="flex-1">
                        <label htmlFor={`sel-${p.id}`} className="font-medium text-foreground cursor-pointer" title={getNombre(p)}>
                          {getNombre(p)}
                        </label>
                        <div className="text-xs text-muted-foreground">
                          {getCodigo(p) || '—'}
                          {(p as any).centro_educativo ? ` · ${(p as any).centro_educativo}` : null}
                        </div>
                        <Input
                          placeholder="Observaciones (opcional)"
                          value={observaciones[p.id] || ''}
                          onChange={(e) => handleObservacionChange(p.id, e.target.value)}
                          className="mt-2 h-9"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">No hay participantes que coincidan con la búsqueda</div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Selecciona un periodo para ver la lista</CardContent>
          </Card>
        )}

        {/* Acciones */}
        {periodoId && listaParticipantes.length ? (
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handleGuardar} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}