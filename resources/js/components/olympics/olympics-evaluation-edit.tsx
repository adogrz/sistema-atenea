import { useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldCheck, Save, CheckCircle2, ArrowLeft, TimerReset, LockOpen } from 'lucide-react';

/**
 * Vista de edición para calificar inscripciones.
 *
 * Requiere del controlador CalificacionInscripcionController::edit
 * que envíe las siguientes props vía Inertia:
 * - inscripcion: { id: number, fase_id: number, participante: { nombre_completo: string } }
 * - evaluacion: { id: number, estado: 'en_proceso'|'finalizado', total: number }
 * - items: Array<{ id:number; nombre:string; descripcion?:string|null; puntaje_maximo:number; orden?:number|null }>
 * - calificaciones: Record<item_definido_id, { puntaje:number; observacion:string }>
 */

type PageProps = {
  auth?: any
}

type Inscripcion = {
  id: number
  fase_id: number
  participante: { nombre_completo: string }
}

type Evaluacion = {
  id: number
  estado: 'en_proceso' | 'finalizado'
  total: number
}

type ItemDefinido = {
  id: number
  nombre: string
  descripcion?: string | null
  puntaje_maximo: number
  orden?: number | null
}

type CalificacionMap = Record<number, { puntaje: number; observacion: string }>

type Props = PageProps & {
  inscripcion: Inscripcion
  evaluacion: Evaluacion
  items: ItemDefinido[]
  calificaciones: CalificacionMap
}

export default function CalificarOlimpiadaEdit({ inscripcion, evaluacion, items, calificaciones }: Props) {
  const { props } = usePage() as any
  const flash = props?.flash || {}

  // form state usando Inertia useForm para manejar busy/errors fácilmente
  const { data, setData, processing, errors, put, post, reset, wasSuccessful, recentlySuccessful } = useForm({
    items: items.map((it) => ({
      item_definido_id: it.id,
      puntaje: calificaciones?.[it.id]?.puntaje ?? 0,
      observacion: calificaciones?.[it.id]?.observacion ?? '',
    })),
    finalizar: false as boolean,
  })

  // Cálculo del total local (no es fuente de verdad, solo ayuda visual)
  const totalLocal = useMemo(() => data.items.reduce((acc, r) => acc + (Number(r.puntaje) || 0), 0), [data.items])

  // Validación cliente: límites de puntaje y números válidos
  const validateClient = (): string[] => {
    const errs: string[] = []
    const byId = new Map<number, ItemDefinido>(items.map((i) => [i.id, i]))

    for (const row of data.items) {
      const def = byId.get(row.item_definido_id)
      if (!def) {
        errs.push(`Ítem ${row.item_definido_id} no pertenece a la fase.`)
        continue
      }
      const p = Number(row.puntaje)
      if (Number.isNaN(p)) errs.push(`Puntaje del ítem "${def.nombre}" no es un número válido.`)
      if (p < 0) errs.push(`Puntaje del ítem "${def.nombre}" no puede ser negativo.`)
      if (p > def.puntaje_maximo + 1e-9) errs.push(`Puntaje del ítem "${def.nombre}" excede el máximo (${def.puntaje_maximo}).`)
    }

    if (data.finalizar) {
      const idsInput = new Set(data.items.map((r) => r.item_definido_id))
      const faltantes = items.filter((i) => !idsInput.has(i.id))
      if (faltantes.length > 0) errs.push(`Faltan puntajes para: ${faltantes.map((f) => '"' + f.nombre + '"').join(', ')}`)
    }

    return errs
  }

  const [clientErrors, setClientErrors] = useState<string[]>([])

  const handleChangePuntaje = (index: number, value: string) => {
    const next = [...data.items]
    // permitir vacío mientras escribe
    const v = value === '' ? '' : Number(value)
    if (v !== '') {
      next[index].puntaje = isFinite(v as number) ? (v as number) : 0
    } else {
      // si vacío, no sumar al total (se tomará como 0)
      next[index].puntaje = 0 as any
    }
    setData('items', next)
  }

  const handleChangeObs = (index: number, value: string) => {
    const next = [...data.items]
    next[index].observacion = value
    setData('items', next)
  }

  const submit = (finalizar: boolean) => {
    setData('finalizar', finalizar)
    const errs = validateClient()
    setClientErrors(errs)
    if (errs.length > 0) return

    // PUT semántico a /calificaciones/inscripciones/{id}
    put(route('calificaciones.inscripciones.update', inscripcion.id), {
      preserveScroll: true,
      onSuccess: () => {
        // si finaliza, usualmente redirige al dashboard (controlador)
      },
    })
  }

  // Heartbeat del claim cada 2 min (si no está finalizado)
  useEffect(() => {
    if (evaluacion.estado === 'finalizado') return
    const t = setInterval(() => {
      router.post(route('calificaciones.inscripciones.heartbeat', inscripcion.id), {}, {
        preserveState: true,
        preserveScroll: true,
        onError: () => {/* silencioso */},
      })
    }, 120000)
    return () => clearInterval(t)
  }, [inscripcion.id, evaluacion.estado])

  const liberar = () => {
    router.post(route('calificaciones.inscripciones.release', inscripcion.id), {}, {
      preserveScroll: true,
    })
  }

  return (
    <AppLayout>
      <Head title={`Calificar: ${inscripcion.participante?.nombre_completo ?? ''}`} />

      <div className="mb-4 flex items-center gap-2">
        <Link href={route('dashboard')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Volver al dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Calificar inscripción</h1>
          <p className="text-sm text-muted-foreground">
            Participante: <span className="font-medium">{inscripcion.participante?.nombre_completo}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={evaluacion.estado === 'finalizado' ? 'default' : 'secondary'} className="uppercase">
            {evaluacion.estado}
          </Badge>
          <Badge variant="outline">Total actual: {totalLocal.toFixed(2)}</Badge>
        </div>
      </div>

      {(flash.error || clientErrors.length > 0) && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Errores</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1">
              {flash.error && <li>{String(flash.error)}</li>}
              {clientErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {flash.success && (
        <Alert className="mb-4">
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{String(flash.success)}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {items.map((item, index) => (
          <Card key={item.id} className="border-muted/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="font-semibold">{item.nombre}</span>
                <span className="text-xs text-muted-foreground">Máx. {item.puntaje_maximo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.descripcion && (
                <p className="text-sm text-muted-foreground leading-relaxed">{item.descripcion}</p>
              )}

              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Puntaje</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={item.puntaje_maximo}
                    step="0.01"
                    value={data.items[index].puntaje}
                    onChange={(e) => handleChangePuntaje(index, e.target.value)}
                    disabled={processing || evaluacion.estado === 'finalizado'}
                  />
                </div>

                <div className="flex-[2]">
                  <label className="text-xs text-muted-foreground">Observación</label>
                  <Textarea
                    value={data.items[index].observacion}
                    onChange={(e) => handleChangeObs(index, e.target.value)}
                    placeholder="Opcional"
                    disabled={processing || evaluacion.estado === 'finalizado'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-6" />

      <div className="flex flex-wrap gap-3 justify-end">
        <Button variant="outline" onClick={liberar} disabled={processing}>
          <LockOpen className="h-4 w-4 mr-2" /> Liberar
        </Button>
        <Button variant="secondary" onClick={() => submit(false)} disabled={processing || evaluacion.estado === 'finalizado'}>
          {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Guardar
        </Button>
        <Button onClick={() => submit(true)} disabled={processing || evaluacion.estado === 'finalizado'}>
          {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />} Finalizar evaluación
        </Button>
      </div>

      {/* Ayudas visuales */}
      <div className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Los cambios se guardan de forma atómica. El bloqueo se renueva automáticamente cada 2 minutos.</span>
      </div>
    </AppLayout>
  )
}
