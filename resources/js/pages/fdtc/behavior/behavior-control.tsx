import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type Participante = {
  id: number;
  codigo: string;
  nombre: string;
  centro_educativo: string;
  nivel_educativo?: string;
  estudiante?: {
    nivel_educativo?: string;
    nivelEducativo?: {
      nombre?: string;
      nivel?: string;
    };
  };
  conducta?: {
    id: number;
    calificacion: 'excelente' | 'buena' | 'regular' | 'mala';
    descripcion?: string | null;
  } | null;
};

interface PageProps {
  participantes: Participante[];
  periodos: { id: number; nombre: string }[];
  periodoSeleccionado?: number | null;
}

const toText = (v: unknown) => (v == null ? '' : String(v));

export default function BehaviorControl(props: PageProps) {
  const listaParticipantes = Array.isArray(props.participantes) ? props.participantes : [];
  const listaPeriodos = Array.isArray(props.periodos) ? props.periodos : [];

  const [periodoId, setPeriodoId] = useState<string>(props.periodoSeleccionado ? String(props.periodoSeleccionado) : '');
  const [q, setQ] = useState<string>('');
  const [nivel, setNivel] = useState<string>('');
  const [conductas, setConductas] = useState<Record<number, { calificacion: string; descripcion: string }>>({});
  const [guardando, setGuardando] = useState(false);

  const participantesFiltrados = useMemo(() => {
    const query = toText(q).trim().toLowerCase();
    const nivelFilter = toText(nivel).trim();
    
    let resultado = listaParticipantes;
    
    if (query) {
      resultado = resultado.filter(
        (p) =>
          toText(p.nombre).toLowerCase().includes(query) ||
          toText(p.codigo).toLowerCase().includes(query) ||
          toText(p.centro_educativo).toLowerCase().includes(query)
      );
    }
    
    if (nivelFilter) {
      resultado = resultado.filter((p) => {
        const nivelParticipante = p.nivel_educativo || 
          p.estudiante?.nivel_educativo || 
          p.estudiante?.nivelEducativo?.nivel || 
          p.estudiante?.nivelEducativo?.nombre || 
          '';
        return toText(nivelParticipante).toLowerCase().includes(nivelFilter.toLowerCase());
      });
    }
    
    return resultado;
  }, [listaParticipantes, q, nivel]);

  const niveles = useMemo(() => {
    const nivelesUnicos = new Set<string>();
    listaParticipantes.forEach((p) => {
      const nivelParticipante = p.nivel_educativo || 
        p.estudiante?.nivel_educativo || 
        p.estudiante?.nivelEducativo?.nivel || 
        p.estudiante?.nivelEducativo?.nombre || 
        '';
      const nivelStr = toText(nivelParticipante).trim();
      if (nivelStr) nivelesUnicos.add(nivelStr);
    });
    return Array.from(nivelesUnicos).sort((a, b) => a.localeCompare(b));
  }, [listaParticipantes]);

  const handleChangePeriodo = (newPeriodoId: string) => {
    setPeriodoId(newPeriodoId);
    if (newPeriodoId) {
      router.get(route('internado-fdtc.conductas.control'), { periodo_id: newPeriodoId }, { preserveScroll: true, replace: true });
    }
  };

  const handleConductaChange = (participanteId: number, field: 'calificacion' | 'descripcion', value: string) => {
    setConductas((prev) => ({
      ...prev,
      [participanteId]: {
        ...prev[participanteId],
        [field]: value,
      },
    }));
  };

  const handleGuardarIndividual = async (p: Participante) => {
    if (!periodoId) return toast.error('Selecciona un periodo');
    const data = conductas[p.id];
    if (!data?.calificacion) return toast.error('Selecciona una calificación');

    setGuardando(true);
    const t = toast.loading('Guardando conducta...');
    router.post(
      route('internado-fdtc.conductas.store'),
      {
        participante_id: p.id,
        periodo_id: periodoId,
        calificacion: data.calificacion,
        descripcion: data.descripcion || null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Conducta guardada');
          setConductas((prev) => {
            const updated = { ...prev };
            delete updated[p.id];
            return updated;
          });
        },
        onError: () => toast.error('Error al guardar'),
        onFinish: () => {
          setGuardando(false);
          toast.dismiss(t);
        },
      }
    );
  };

  const handleGuardarMasivo = () => {
    if (!periodoId) return toast.error('Selecciona un periodo');
    const entries = Object.entries(conductas).filter(([_, v]) => v.calificacion);
    if (!entries.length) return toast.error('No hay conductas para guardar');

    setGuardando(true);
    const t = toast.loading(`Guardando ${entries.length} conducta(s)...`);
    router.post(
      route('internado-fdtc.conductas.masivo'),
      {
        periodo_id: periodoId,
        conductas: entries.map(([id, v]) => ({
          participante_id: Number(id),
          calificacion: v.calificacion,
          descripcion: v.descripcion || null,
        })),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Conductas guardadas');
          setConductas({});
        },
        onError: () => toast.error('Error al guardar'),
        onFinish: () => {
          setGuardando(false);
          toast.dismiss(t);
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Head title="Control de Conducta - Internado FDTC" />
        <h1 className="text-2xl font-bold mb-3">Control de Conducta</h1>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Selecciona el periodo y busca participantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label htmlFor="periodo" className="block text-sm mb-1">Periodo</label>
                <select
                  id="periodo"
                  value={periodoId}
                  onChange={(e) => handleChangePeriodo(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona un periodo</option>
                  {listaPeriodos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nivel" className="block text-sm mb-1">Nivel Educativo</label>
                <select
                  id="nivel"
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Todos los niveles</option>
                  {niveles.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Buscar</label>
                <Input placeholder="Código, nombre o centro..." value={q} onChange={(e) => setQ(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Participantes</CardTitle>
              <CardDescription>{participantesFiltrados.length} registro(s)</CardDescription>
            </div>
            {Object.keys(conductas).length > 0 && (
              <Button type="button" onClick={handleGuardarMasivo} disabled={guardando || !periodoId}>
                Guardar todo ({Object.keys(conductas).length})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Código</th>
                    <th className="py-2 px-2">Nombre</th>
                    <th className="py-2 px-2">Centro</th>
                    <th className="py-2 px-2">Calificación</th>
                    <th className="py-2 px-2">Descripción</th>
                    <th className="py-2 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participantesFiltrados.length ? (
                    participantesFiltrados.map((p) => {
                      const actual = conductas[p.id] || {};
                      const original = p.conducta;
                      const calificacion = actual.calificacion || original?.calificacion || '';
                      const descripcion = actual.descripcion ?? original?.descripcion ?? '';
                      const cambio = actual.calificacion || actual.descripcion;

                      return (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 px-2">{p.codigo || '—'}</td>
                          <td className="py-2 px-2">{p.nombre}</td>
                          <td className="py-2 px-2">{p.centro_educativo}</td>
                          <td className="py-2 px-2">
                            <select
                              value={calificacion}
                              onChange={(e) => handleConductaChange(p.id, 'calificacion', e.target.value)}
                              className="h-8 w-full rounded border bg-background px-2 text-xs"
                              disabled={!periodoId}
                            >
                              <option value="">—</option>
                              <option value="excelente">Excelente</option>
                              <option value="buena">Buena</option>
                              <option value="regular">Regular</option>
                              <option value="mala">Mala</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <Input
                              value={descripcion}
                              onChange={(e) => handleConductaChange(p.id, 'descripcion', e.target.value)}
                              placeholder="Observaciones..."
                              className="h-8 text-xs"
                              disabled={!periodoId}
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            {cambio && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleGuardarIndividual(p)}
                                disabled={guardando || !periodoId}
                              >
                                Guardar
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="py-6 text-center text-muted-foreground" colSpan={6}>
                        {periodoId ? 'Sin participantes' : 'Selecciona un periodo'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}