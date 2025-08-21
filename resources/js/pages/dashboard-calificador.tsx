import React, { useMemo } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, ClipboardList, Hourglass, ArrowRight } from 'lucide-react'

interface PageProps { auth?: any }

// --- Tipos de filtros
type OlimpiadaOption = { id: number; nombre: string }
type FaseOption = { id: number; nombre: string; olimpiada_id: number }
type Filters = {
  selectedOlimpiadaId: number | null
  selectedFaseId: number | null
  olimpiadas: OlimpiadaOption[]
  fases: FaseOption[]
}

// --- Tipos de datos
export type EvaluacionFase = {
  id: number
  total: number
  inscripcion: {
    id: number
    fase?: { nombre?: string | null } | null
    participante?: { nombre_completo?: string | null } | null
  }
}

export type Inscripcion = {
  id: number
  participante?: { nombre_completo?: string | null } | null
  // la inscripción ya NO tiene fase; añadimos olimpiada para mostrar algo útil
  olimpiada?: { nombre?: string | null } | null
}

// --- Props del componente (una sola definición)
interface Props extends PageProps {
  yaCalificadas: EvaluacionFase[]
  reclamadas: EvaluacionFase[]
  noReclamadas: Inscripcion[]
  stats: {
    finalizadas: number
    enProceso: number
    disponibles: number
  }
  filters?: Filters
}

const DEFAULT_FILTERS: Filters = {
  selectedOlimpiadaId: null,
  selectedFaseId: null,
  olimpiadas: [],
  fases: [],
}

export default function DashboardCalificador({
  yaCalificadas,
  reclamadas,
  noReclamadas,
  stats,
  filters = DEFAULT_FILTERS,
}: Props) {

  // alias local
  const f = filters

  // Acciones
  const claim = (inscripcionId: number) => {
    router.post(route('dashboard.calificaciones.inscripciones.claim', inscripcionId))
  }

  const continuar = (inscripcionId: number) => {
    router.visit(route('dashboard.calificaciones.inscripciones.edit', inscripcionId))
  }

  const resumen = useMemo(() => ([
    { label: 'Finalizadas', value: stats.finalizadas, icon: CheckCircle2 },
    { label: 'En proceso', value: stats.enProceso, icon: Hourglass },
    { label: 'Disponibles', value: stats.disponibles, icon: ClipboardList },
  ]), [stats])

  const onFilterChange = (key: 'olimpiada_id' | 'fase_id', value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value); else params.delete(key)
    router.visit(
      route('dashboard.calificaciones.index') + (params.toString() ? `?${params.toString()}` : ''),
      { preserveState: true, preserveScroll: true }
    )
  }

  return (
    <AppLayout>
      <Head title="Mis Evaluaciones" />

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Olimpiada</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={f.selectedOlimpiadaId !== null ? String(f.selectedOlimpiadaId) : ''}
            onChange={(e) => onFilterChange('olimpiada_id', e.target.value)}
          >
            <option value="">Todas</option>
            {f.olimpiadas.map(o => (
              <option key={o.id} value={String(o.id)}>{o.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted-foreground mb-1">Fase</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={f.selectedFaseId !== null ? String(f.selectedFaseId) : ''}
            onChange={(e) => onFilterChange('fase_id', e.target.value)}
          >
            <option value="">Todas</option>
            {f.fases
              .filter(ff => !f.selectedOlimpiadaId || ff.olimpiada_id === f.selectedOlimpiadaId)
              .map(ff => (
                <option key={ff.id} value={String(ff.id)}>{ff.nombre}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {resumen.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-muted/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Icon className="h-4 w-4" /> {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reclamadas / En proceso */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold">En proceso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reclamadas.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin evaluaciones reclamadas.</p>
            )}
            {reclamadas.map(({ id, inscripcion }) => (
              <div key={id} className="rounded border p-3">
                <p className="font-medium">{inscripcion?.participante?.nombre_completo ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Fase: {inscripcion?.fase?.nombre ?? '—'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">En proceso</Badge>
                  <Button size="sm" onClick={() => continuar(inscripcion.id)}>
                    Continuar <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* No reclamadas / Disponibles */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {noReclamadas.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin evaluaciones disponibles.</p>
            )}
            {noReclamadas.map(({ id, participante, olimpiada }) => {
              const faseNombre = f.selectedFaseId
                ? (f.fases.find(x => x.id === f.selectedFaseId)?.nombre ?? '—')
                : (olimpiada?.nombre ?? '—')
              return (
                <div key={id} className="rounded border p-3">
                  <p className="font-medium">{participante?.nombre_completo ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.selectedFaseId ? `Fase: ${faseNombre}` : `Olimpiada: ${faseNombre}`}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline">Pendiente</Badge>
                    <Button size="sm" variant="secondary" onClick={() => claim(id)}>
                      Reclamar
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Ya calificadas / Finalizadas */}
        <Card className="border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Finalizadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {yaCalificadas.length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no has finalizado evaluaciones.</p>
            )}
            {yaCalificadas.map(({ id, inscripcion, total }) => (
              <div key={id} className="rounded border p-3">
                <p className="font-medium">{inscripcion?.participante?.nombre_completo ?? '—'}</p>
                <p className="text-xs text-muted-foreground">Fase: {inscripcion?.fase?.nombre ?? '—'}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="default">Finalizado</Badge>
                  <span className="text-sm">Total: <strong>{Number(total ?? 0).toFixed(2)}</strong></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="text-xs text-muted-foreground">
        Tip: Puedes reclamar una evaluación disponible; si otro calificador la está editando, aparecerá como no disponible hasta que libere o expire su bloqueo.
      </div>
    </AppLayout>
  )
}
